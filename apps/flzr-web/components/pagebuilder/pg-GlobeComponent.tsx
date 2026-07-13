"use client";
import React from "react";
import type { GlobeComponent as GlobeComponentType } from "@1sp/sanity-types";
import GlobalDataComponent from "@flzr/components/pagebuilder/pg-GlobalDataComponent";


interface GlobeComponentProps {
  data: GlobeComponentType;
}

function GlobeComponent({ data }: GlobeComponentProps) {
  const {
    locations = [],
    sectionTitle,
    sectionSubtitle,
    navPointName,
  } = data || {};

  if (!locations || locations.length === 0) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="text-gray-400">
          No locations available. Please add locations in Sanity Studio.
        </div>
      </div>
    );
  }

  // Generate section ID
  const sectionId = sectionTitle
    ? sectionTitle
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "globe-component";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  // Transform locations data into globe arcs format — flzr violet family
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
      arcAlt: 0.2 + (index % 3) * 0.1,
      color: colors[index % colors.length],
      label: location.subtitle || location.name,
    };
  });

  // Globe configuration
  const globeConfig = {
    pointSize: 1,
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
      id={sectionId}
      {...navPointDataAttr}
      className="container relative mx-auto overflow-hidden rounded-4xl"
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
