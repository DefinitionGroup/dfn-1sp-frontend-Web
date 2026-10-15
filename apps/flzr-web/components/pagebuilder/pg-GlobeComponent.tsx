"use client";
import React from "react";
import type { GlobeComponent as GlobeComponentType } from "@1sp/sanity-types";
import GlobalDataComponent from "@flzr/components/pagebuilder/pg-GlobalDataComponent";
import {
  getFlzrEuropeanLocations,
  getFlzrGlobeSectionId,
} from "@flzr/data/europeanLocations";

interface GlobeComponentProps {
  data: GlobeComponentType;
  language?: string;
  inheritSectionSurface?: boolean;
}

const REACH_CAMERA_RADIUS = 145 * 1.1;

function GlobeComponent({
  data,
  language,
  inheritSectionSurface = false,
}: GlobeComponentProps) {
  const { sectionTitle, sectionSubtitle, navPointName } = data || {};
  const isCentralEuropeStatic = data?.viewMode === "centralEuropeStatic";
  const locations = getFlzrEuropeanLocations(language);

  const sectionId = getFlzrGlobeSectionId(sectionTitle);

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  // Transform the shared FLZR market locations into globe arcs.
  const colors = ["#7c5cff", "#9d85ff", "#d6ccff"];

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
      labelOffsetX: location.labelOffsetX,
      labelOffsetY: location.labelOffsetY,
    };
  });

  // Globe configuration
  const globeConfig = {
    pointSize: 0.5,
    globeColor: "#f6f6f6",
    showAtmosphere: false,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#ffffff",
    emissiveIntensity: 22,
    shininess: 1,
    polygonColor: "rgba(124,92,255,1)",
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
    cameraRadius: isCentralEuropeStatic ? REACH_CAMERA_RADIUS : 165,
    enableRotate: !isCentralEuropeStatic,
    verticalOffset: isCentralEuropeStatic ? 0.18 : 1 / 3,
  };

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      data-globe-view-mode={data?.viewMode || "default"}
      className={`relative overflow-hidden ${
        isCentralEuropeStatic
          ? "flzr-reach-map-shell"
          : "container mx-auto"
      } ${
        inheritSectionSurface ? "rounded-none" : "rounded-4xl"
      }`}
    >
      <GlobalDataComponent
        arcs={arcs}
        globeConfig={globeConfig}
        title={isCentralEuropeStatic ? "" : sectionTitle || "Our Locations"}
        description={isCentralEuropeStatic ? undefined : sectionSubtitle}
        backgroundTone={inheritSectionSurface ? "inherit" : "muted"}
      />
    </section>
  );
}

export default GlobeComponent;
