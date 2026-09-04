"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import dynamic from "next/dynamic";
import { hasVisibleText } from "@1sp/utils/text-content";

const World = dynamic(
  () => import("@renaissance/components/ui/globe").then((m) => m.World),
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
  labelOffsetX?: number;
  labelOffsetY?: number;
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
  arcStroke?: number;
  arcTime: number;
  arcLength: number;
  rings: number;
  maxRings: number;
  initialPosition: { lat: number; lng: number };
  autoRotate: boolean;
  autoRotateSpeed: number;
  verticalOffset?: number;
  cameraRadius?: number;
  fixedLabelSize?: boolean;
}

interface GlobalDataComponentProps {
  arcs: Arc[];
  globeConfig: GlobeConfig;
  title?: string;
  description?: string;
  backgroundTone?: "default" | "muted";
  layout?: "centered" | "split";
}

export default function GlobalDataComponent({
  arcs,
  globeConfig,
  title = "We are global.",
  description,
  backgroundTone = "default",
  layout = "centered",
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

  if (layout === "split") {
    return (
      <div
        ref={containerRef}
        data-globe-layout="split"
        className={`relative grid w-full items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-12 md:gap-10 md:py-16 lg:px-12 ${
          backgroundTone === "muted" ? "bg-renaissance-mist" : "bg-renaissance-paper"
        }`}
      >
        <div className="relative z-10 min-w-0 md:col-span-5">
          {hasVisibleText(title) ? (
            <h2 className="renaissance-display max-w-[16ch] text-[clamp(2.7rem,3.5vw,3.75rem)] font-bold leading-[0.95] tracking-[-0.025em] text-renaissance-ink">
              {title}
            </h2>
          ) : null}
          {hasVisibleText(description) ? (
            <p className="mt-6 max-w-[38ch] text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] text-renaissance-ink/75">
              {description}
            </p>
          ) : null}
        </div>
        <div
          data-globe-viewport
          className="relative aspect-[3/2] min-w-0 overflow-hidden md:col-span-7"
          style={{ maskImage: "linear-gradient(to bottom, black 68%, transparent 100%)" }}
        >
          <div className="absolute inset-x-0 top-0 aspect-square">
            {shouldLoadGlobe ? (
              <World data={arcs} globeConfig={globeConfig} />
            ) : (
              <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
                <div className="h-64 w-64 rounded-full bg-renaissance-accent/10" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-row items-center justify-center py-20 h-screen md:h-auto relative w-full ${
        backgroundTone === "muted"
          ? "bg-renaissance-mist"
          : "bg-renaissance-paper"
      }`}
    >
      <div className="pointer-events-none max-w-7xl mx-auto z-10 flex w-full h-full md:h-[44rem] flex-col relative px-4">
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
          className="relative z-20"
        >
          {hasVisibleText(title) ? (
            <h2 className="text-center text-xl md:text-5xl leading-[1.15] dark:text-white">
              {title}
            </h2>
          ) : null}
          {hasVisibleText(description) ? (
            <p className="mx-auto mt-3 max-w-2xl text-balance text-center text-base font-normal leading-relaxed text-neutral-600 dark:text-neutral-200 md:text-lg">
              {description}
            </p>
          ) : null}
        </motion.div>
      </div>
      <div
        className={`absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent z-40 ${
          backgroundTone === "muted"
            ? "to-renaissance-mist"
            : "to-renaissance-paper"
        }`}
      />
      <div className="absolute inset-0 z-0">
        {shouldLoadGlobe ? (
          <World data={arcs} globeConfig={globeConfig} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
