"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import dynamic from "next/dynamic";
import { hasVisibleText } from "@1sp/utils/text-content";

const World = dynamic(
  () => import("@flzr/components/ui/globe").then((m) => m.World),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32  bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    ),
  }
);

interface Arc {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
  label: string;
}

interface GlobeConfig {
  pointSize: number;
  globeColor: string;
  showAtmosphere: boolean;
  atmosphereColor: string;
  atmosphereAltitude: number;
  emissive: string;
  emissiveIntensity: number;
  shininess: number;
  polygonColor: string;
  ambientLight: string;
  directionalLeftLight: string;
  directionalTopLight: string;
  pointLight: string;
  arcTime: number;
  arcLength: number;
  rings: number;
  maxRings: number;
  initialPosition: { lat: number; lng: number };
  autoRotate: boolean;
  autoRotateSpeed: number;
}

interface GlobalDataComponentProps {
  arcs: Arc[];
  globeConfig: GlobeConfig;
  title?: string;
  description?: string;
}

export default function GlobalDataComponent({
  arcs,
  globeConfig,
  title = "We are global.",
  description = "You will find us connecting businesses and people across the world.",
}: GlobalDataComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadGlobe, setShouldLoadGlobe] = useState(false);

  // Trigger when component is near viewport (with margin for preloading)
  const isInView = useInView(containerRef, {
    once: true,
    margin: "200px 0px", // Start loading 200px before entering viewport
  });

  // Delay globe loading slightly after in view to not block other animations
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setShouldLoadGlobe(true);
      }, 100); // Small delay to let other animations settle
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className="flex flex-row items-center justify-center py-20 h-screen md:h-auto dark:bg-black bg-white relative w-full"
    >
      <div className="max-w-7xl mx-auto z-10 w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="div"
        >
          {hasVisibleText(title) ? (
            <h2 className="text-center text-xl md:text-5xl tracking-tight dark:text-white">
              {title}
            </h2>
          ) : null}
          <p className="text-center text-base md:text-lg font-normal text-neutral-400 dark:text-neutral-200 max-w-md mt-2 mx-auto">
            {description}
          </p>
        </motion.div>
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-40" />
        {shouldLoadGlobe ? (
          <World data={arcs} globeConfig={globeConfig} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32  bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
