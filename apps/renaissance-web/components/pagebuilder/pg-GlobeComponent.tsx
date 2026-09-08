"use client";
import React from "react";
import type {
  GlobeComponent as GlobeComponentType,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";
import GlobalDataComponent from "@renaissance/components/pagebuilder/pg-GlobalDataComponent";
import {
  getRenaissanceEuropeanLocations,
  getRenaissanceGlobeSectionId,
} from "@renaissance/data/europeanLocations";

interface GlobeComponentProps {
  data: GlobeComponentType;
  language?: string;
  presentationRole?: RenaissanceSectionRole;
}

type GlobeLocation = {
  name: string;
  coordinateLat: number;
  coordinateLon: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
};

type NetworkRegion = "europe" | "america" | "china";

const NETWORK_MULTIPLIER = 5;
const REGIONAL_NETWORK_OFFSETS: Record<
  NetworkRegion,
  ReadonlyArray<{ lat: number; lng: number }>
> = {
  europe: [
    { lat: 0, lng: 0 },
    { lat: 3.4, lng: 11.8 },
    { lat: -4.3, lng: 5.7 },
    { lat: 7.1, lng: 20.2 },
    { lat: -9.8, lng: 9.4 },
  ],
  america: [
    { lat: 0, lng: 0 },
    { lat: 13, lng: -4 },
    { lat: 6.7, lng: 44.2 },
    { lat: -14.6, lng: 19.1 },
    { lat: 9.6, lng: 38.9 },
  ],
  china: [
    { lat: 0, lng: 0 },
    { lat: 4, lng: 12.2 },
    { lat: -4.7, lng: 17.3 },
    { lat: -12.7, lng: 9.1 },
    { lat: -5.3, lng: -0.1 },
  ],
};

function getNetworkRegion(longitude: number): NetworkRegion {
  if (longitude < -30) return "america";
  if (longitude > 60) return "china";
  return "europe";
}

function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

function buildNetworkLocations(locations: GlobeLocation[]) {
  return Array.from({ length: NETWORK_MULTIPLIER }, (_, layer) =>
    locations.map((location) => {
      const offset =
        REGIONAL_NETWORK_OFFSETS[getNetworkRegion(location.coordinateLon)][layer];

      return {
        name: layer === 0 ? location.name : "",
        coordinateLat: Math.max(
          -75,
          Math.min(75, location.coordinateLat + offset.lat),
        ),
        coordinateLon: normalizeLongitude(location.coordinateLon + offset.lng),
        labelOffsetX: layer === 0 ? location.labelOffsetX : undefined,
        labelOffsetY: layer === 0 ? location.labelOffsetY : undefined,
      };
    }),
  ).flat();
}

function GlobeComponent({ data, language, presentationRole }: GlobeComponentProps) {
  const { sectionTitle, sectionSubtitle, navPointName } = data || {};
  const configuredLocations = Array.isArray(data?.locations)
    ? data.locations.filter(
        (location) =>
          Number.isFinite(location?.coordinateLat) &&
          Number.isFinite(location?.coordinateLon),
      )
    : [];
  const locations = configuredLocations.length
    ? configuredLocations
    : getRenaissanceEuropeanLocations(language);

  const sectionId = getRenaissanceGlobeSectionId(navPointName || sectionTitle);

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  // Transform the shared RENAISSANCE market locations into globe arcs.
  const colors = ["#245e66", "#99bbba", "#dbe5e5"];
  const networkLocations = buildNetworkLocations(locations as GlobeLocation[]);

  // Weave five layers through every region in one continuous animated network.
  const arcs = networkLocations.map((location, index) => {
    const prevIndex =
      (index - 1 + networkLocations.length) % networkLocations.length;
    const prevLocation = networkLocations[prevIndex];

    return {
      order: Math.floor(index / locations.length) + 1,
      startLat: prevLocation.coordinateLat,
      startLng: prevLocation.coordinateLon,
      endLat: location.coordinateLat,
      endLng: location.coordinateLon,
      arcAlt: 0.07 + (index % NETWORK_MULTIPLIER) * 0.012,
      color: colors[index % colors.length],
      label: location.name,
      labelOffsetX: location.labelOffsetX,
      labelOffsetY: location.labelOffsetY,
    };
  });

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
    initialPosition: {
      lat: 50,
      lng: 10,
    },
    autoRotate: false,
    autoRotateSpeed: 0.15,
    // A square canvas keeps the silhouette inside the column at every breakpoint.
    cameraRadius: 260,
    fixedLabelSize: true,
    verticalOffset: 0,
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
        globeConfig={globeConfig}
        title={sectionTitle || "Our Locations"}
        description={sectionSubtitle}
        backgroundTone="muted"
        layout="split"
      />
    </section>
  );
}

export default GlobeComponent;
