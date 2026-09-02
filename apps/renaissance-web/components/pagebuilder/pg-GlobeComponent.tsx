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

  // Create arcs connecting consecutive locations
  const arcs = locations.map((location, index) => {
    // Connect from previous location (or wrap around to last location)
    const prevIndex = (index - 1 + locations.length) % locations.length;
    const prevLocation = locations[prevIndex];

    return {
      order: Math.floor(index / 3) + 1,
      startLat: prevLocation.coordinateLat,
      startLng: prevLocation.coordinateLon,
      endLat: location.coordinateLat,
      endLng: location.coordinateLon,
      arcAlt: 0.08 + (index % 3) * 0.015,
      color: colors[index % colors.length],
      label: location.name,
      labelOffsetX:
        "labelOffsetX" in location ? location.labelOffsetX : undefined,
      labelOffsetY:
        "labelOffsetY" in location ? location.labelOffsetY : undefined,
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
    verticalOffset: 1 / 3,
  };

  return (
    <section
      id={presentationRole === "reach" ? undefined : sectionId}
      {...navPointDataAttr}
      className={
        presentationRole === "reach"
          ? "relative mx-auto max-w-[1680px] overflow-hidden px-0 pb-16 pt-4 md:pb-24"
          : "container relative mx-auto overflow-hidden rounded-media"
      }
    >
      <GlobalDataComponent
        arcs={arcs}
        globeConfig={globeConfig}
        title={sectionTitle || "Our Locations"}
        description={sectionSubtitle}
        backgroundTone="muted"
      />
    </section>
  );
}

export default GlobeComponent;
