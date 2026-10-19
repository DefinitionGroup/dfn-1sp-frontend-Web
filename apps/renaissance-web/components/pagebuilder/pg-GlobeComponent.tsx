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

// Arc height grows with the distance it spans, so long hops clear the globe.
function arcAltitude(from: GlobeLocation, to: GlobeLocation) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const [lat1, lat2] = [toRadians(from.coordinateLat), toRadians(to.coordinateLat)];
  const deltaLng = toRadians(to.coordinateLon - from.coordinateLon);
  const angle = Math.acos(
    Math.min(1, Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(deltaLng)),
  );
  return 0.05 + 0.3 * (angle / Math.PI);
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

  const colors = ["#245e66", "#99bbba", "#dbe5e5"];
  const destinations = locations as GlobeLocation[];

  // Each destination is reached from the one before it (labelled, along the
  // tour route) and from the one two back, so the arcs read as a network.
  const arcs = destinations.flatMap((location, index) => {
    const before = (steps: number) =>
      destinations[(index - steps + destinations.length) % destinations.length];
    const routes = [{ from: before(1), label: location.name }];
    if (destinations.length > 2) routes.push({ from: before(2), label: "" });
    return routes.map(({ from, label }, route) => ({
        order: index + 1,
        startLat: from.coordinateLat,
        startLng: from.coordinateLon,
        endLat: location.coordinateLat,
        endLng: location.coordinateLon,
        arcAlt: arcAltitude(from, location),
        color: colors[(index + route) % colors.length],
        label,
        labelOffsetX: label ? location.labelOffsetX : undefined,
        labelOffsetY: label ? location.labelOffsetY : undefined,
      }));
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
    cameraRadius: 250,
    fixedLabelSize: true,
    // The globe fills the block behind the copy: right of it on desktop,
    // below it on phones.
    framing: { x: 0.2, y: 0 },
    mobileFraming: { x: 0, y: 0.26 },
    // Zoom into each destination in the CMS order, then spin on to the next.
    tour: {
      stops: destinations.map((location) => ({
        lat: location.coordinateLat,
        lng: location.coordinateLon,
        label: location.name,
      })),
      nearRadius: 150,
      dwellMs: 2600,
      travelMs: 3400,
    },
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
        clearSectionBadge={presentationRole === "reach"}
      />
    </section>
  );
}

export default GlobeComponent;
