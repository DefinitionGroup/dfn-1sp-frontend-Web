"use client";
import React, { useMemo } from "react";
import { stegaClean } from "@sanity/client/stega";
import type {
  GlobeComponent as GlobeComponentType,
  GlobeLocationType,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";
import GlobalDataComponent, {
  type GlobeLegendEntry,
} from "@renaissance/components/pagebuilder/pg-GlobalDataComponent";
import type { GlobeMarker, GlobeMarkerIcon } from "@renaissance/components/ui/globe";
import {
  getRenaissanceEuropeanLocations,
  getRenaissanceGlobeSectionId,
} from "@renaissance/data/europeanLocations";
import {
  GLOBE_LOCATION_PALETTE,
  buildNetworkArcs,
  buildNetworkRegions,
  getGlobeLocationType,
  type NetworkLocation,
} from "@renaissance/lib/globeNetwork";

interface GlobeComponentProps {
  data: GlobeComponentType;
  language?: string;
  presentationRole?: RenaissanceSectionRole;
}

const LEGEND_COPY: Record<string, Record<GlobeLocationType, string>> = {
  en: { office: "Renaissance offices", partner: "Partner agencies" },
  de: { office: "Renaissance-Standorte", partner: "Partneragenturen" },
  pl: { office: "Biura Renaissance", partner: "Agencje partnerskie" },
};

const LOCATION_TYPES: GlobeLocationType[] = ["office", "partner"];

// The approved location icons, at 80% of their drawn size. The office pin
// stands on its tip; the partner-agency group is centred on the city.
const LOCATION_ICONS: Record<GlobeLocationType, GlobeMarkerIcon> = {
  office: {
    src: "/renaissance/globe/location-office.svg",
    width: 21,
    height: 26,
    anchor: "bottom",
  },
  partner: {
    src: "/renaissance/globe/location-partner.svg",
    width: 24,
    height: 18,
    anchor: "center",
  },
};

function GlobeComponent({ data, language, presentationRole }: GlobeComponentProps) {
  const { sectionTitle, sectionSubtitle, navPointName } = data || {};
  const configuredLocations = data?.locations;

  const locations = useMemo<NetworkLocation[]>(() => {
    const configured = Array.isArray(configuredLocations)
      ? configuredLocations
          .filter(
            (location) =>
              Boolean(location?.name) &&
              Number.isFinite(location?.coordinateLat) &&
              Number.isFinite(location?.coordinateLon),
          )
          .map((location, index) => ({
            key: location._key ?? `${stegaClean(location.name)}-${index}`,
            name: location.name,
            lat: location.coordinateLat,
            lng: location.coordinateLon,
            type: getGlobeLocationType(location.locationType),
          }))
      : [];
    if (configured.length) return configured;
    return getRenaissanceEuropeanLocations(language).map((location) => ({
      key: location.code,
      name: location.name,
      lat: location.coordinateLat,
      lng: location.coordinateLon,
      type: "office" as const,
    }));
  }, [configuredLocations, language]);

  const { arcs, markers, tour, legend } = useMemo(() => {
    const markers: GlobeMarker[] = locations.map((location) => {
      const palette = GLOBE_LOCATION_PALETTE[location.type];
      return {
        key: location.key,
        lat: location.lat,
        lng: location.lng,
        label: location.name,
        kind: location.type,
        icon: LOCATION_ICONS[location.type],
        color: palette.marker,
        ringColor: palette.ring,
        labelBackground: palette.label,
        labelColor: palette.labelText,
      };
    });

    const arcs = buildNetworkArcs(locations).map(({ from, to, order, altitude }) => ({
      order,
      startLat: from.lat,
      startLng: from.lng,
      endLat: to.lat,
      endLng: to.lng,
      arcAlt: altitude,
      color: GLOBE_LOCATION_PALETTE[to.type].arc,
      colors: [
        GLOBE_LOCATION_PALETTE[from.type].arc,
        GLOBE_LOCATION_PALETTE[to.type].arc,
      ] as [string, string],
      label: "",
    }));

    // The camera visits regions rather than single cities, so neighbouring
    // labels share one close-up instead of each getting their own.
    const tour = {
      stops: buildNetworkRegions(locations).map((region) => ({
        lat: region.lat,
        lng: region.lng,
        label: "",
        keys: region.keys,
        spread: region.spread,
      })),
      nearRadius: 150,
      dwellMs: 3400,
      travelMs: 3400,
    };

    const copy = LEGEND_COPY[language ?? "en"] ?? LEGEND_COPY.en;
    const legend: GlobeLegendEntry[] = LOCATION_TYPES.map((type) => ({
      key: type,
      label: copy[type],
      color: GLOBE_LOCATION_PALETTE[type].marker,
      icon: LOCATION_ICONS[type],
      names: locations
        .filter((location) => location.type === type)
        .map((location) => location.name),
    })).filter((entry) => entry.names.length > 0);

    return { arcs, markers, tour, legend };
  }, [locations, language]);

  const sectionId = getRenaissanceGlobeSectionId(navPointName || sectionTitle);

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  // Globe configuration
  const globeConfig = {
    pointSize: 0.5,
    globeColor: "#dbe5e5",
    showAtmosphere: false,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#ffffff",
    emissiveIntensity: 22,
    shininess: 1,
    polygonColor: "rgba(36,94,102,1)",
    ambientLight: "#ffffff",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcStroke: 0.1,
    arcTime: 1555,
    arcLength: 0.95,
    rings: 1,
    maxRings: 3,
    // Over the Atlantic, so the static (reduced-motion) view shows Europe
    // and North America and the tour opens by swinging east.
    initialPosition: {
      lat: 45,
      lng: -30,
    },
    autoRotate: false,
    autoRotateSpeed: 0.15,
    cameraRadius: 250,
    fixedLabelSize: true,
    // The globe fills the block behind the copy: right of it on desktop,
    // below it on phones.
    framing: { x: 0.2, y: 0 },
    mobileFraming: { x: 0, y: 0.26 },
    tour,
  };

  return (
    <section
      id={presentationRole === "reach" ? undefined : sectionId}
      {...navPointDataAttr}
      className={
        presentationRole === "reach"
          ? "relative mx-auto max-w-[1680px] overflow-hidden"
          : "relative mx-auto max-w-[1680px] overflow-hidden rounded-media"
      }
    >
      <GlobalDataComponent
        arcs={arcs}
        markers={markers}
        legend={legend}
        globeConfig={globeConfig}
        title={sectionTitle || "Our Locations"}
        description={sectionSubtitle}
        backgroundTone="muted"
        layout="split"
        clearSectionBadge={presentationRole === "reach"}
      />
    </section>
  );
}

export default GlobeComponent;
