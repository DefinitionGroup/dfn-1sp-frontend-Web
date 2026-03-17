"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { UNIT_LOGO_FLOAT_QUERY } from "@/sanity/lib/queries";
import { assetUrl } from "@/utils/utils";
import type { CloudinaryAsset } from "@/types/sanity.types";

type Unit = {
  _id: string;
  _type?: string;
  name?: string;
  slug?: { current?: string };
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
  logoSignet?: CloudinaryAsset;
};

interface PageBuilderLogoFloatProps {
  data: {
    logoVariant?: "logo" | "logoColor" | "logoSignet";
    cardSize?: "sm" | "md" | "lg";
    maxItems?: number;
    navPointName?: string;
    hideFromNav?: boolean;
    selectionMode?: "auto" | "manual";
    selectedUnits?: Unit[];
  };
  language?: string;
}

function PageBuilderLogoFloat({
  data,
  language: propLanguage,
}: PageBuilderLogoFloatProps) {
  const params = useParams();
  const language = propLanguage || (params?.locale as string) || "de";

  const {
    logoVariant = "logoColor",
    cardSize = "sm",
    maxItems = 24,
    navPointName,
    hideFromNav = true,
    selectionMode = "auto",
    selectedUnits,
  } = data || {};

  const [units, setUnits] = React.useState<Unit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY < 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  React.useEffect(() => {
    async function loadUnits() {
      try {
        if (
          selectionMode === "manual" &&
          Array.isArray(selectedUnits) &&
          selectedUnits.length > 0
        ) {
          setUnits(selectedUnits);
          setIsLoading(false);
          return;
        }

        const fetchedUnits = await client.fetch<Unit[]>(
          UNIT_LOGO_FLOAT_QUERY,
          { language, maxItems },
          { next: { revalidate: 60 } }
        );
        setUnits(fetchedUnits || []);
      } catch (error) {
        console.error("Error loading units for logo float:", error);
        setUnits([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadUnits();
  }, [language, maxItems, selectedUnits, selectionMode]);

  const sectionId = "logo-float";

  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  const getLogoForUnit = (unit: Unit): CloudinaryAsset | undefined => {
    return unit.logoColor || unit.logo;
  };

  const cardsWithLogo = units
    .map((unit) => {
      const asset = getLogoForUnit(unit);
      return {
        unit,
        logoUrl: assetUrl(asset),
        width: asset?.width || 0,
        height: asset?.height || 0,
      };
    })
    .filter((entry): entry is { unit: Unit; logoUrl: string; width: number; height: number } =>
      Boolean(entry.logoUrl)
    );

  const maxHeightPx: Record<NonNullable<typeof cardSize>, number> = {
    sm: 56,
    md: 64,
    lg: 80,
  };

  const maxH = maxHeightPx[cardSize] || maxHeightPx.md;
  const mobileMaxHeightClass: Record<NonNullable<typeof cardSize>, string> = {
    sm: "max-h-6 sm:max-h-7",
    md: "max-h-7 sm:max-h-8",
    lg: "max-h-8 sm:max-h-9",
  };
  const desktopMaxHeightClass: Record<NonNullable<typeof cardSize>, string> = {
    sm: "lg:max-h-14",
    md: "lg:max-h-16",
    lg: "lg:max-h-20",
  };
  const logoHeightClass = `${mobileMaxHeightClass[cardSize] || mobileMaxHeightClass.md} ${desktopMaxHeightClass[cardSize] || desktopMaxHeightClass.md}`;

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      {...(hideFromNav ? { "data-nav-hidden": "true" } : {})}
      className="fixed inset-x-0 top-0 z-[999999] pointer-events-none lg:inset-0"
      data-component="pg-pagebuilder-logo-float"
    >
      <div className="w-full flex items-start justify-center px-4 pt-24 md:pt-16 sm:px-6 lg:h-full lg:mt-24 lg:px-6 lg:pt-0">
        {isLoading ? (
          <div className="text-center text-neutral-400">.</div>
        ) : cardsWithLogo.length === 0 ? (
          <div className="text-center text-neutral-400">No unit logos found</div>
        ) : (
          <div className="mx-auto w-full max-w-7xl flex flex-wrap items-center  justify-center lg:gap-0">
            <AnimatePresence>
              {visible && cardsWithLogo.map(({ unit, logoUrl, width, height }, index) => {
                // Scale to max height, keeping aspect ratio
                const scale = height > 0 ? Math.min(1, maxH / height) : 1;
                const displayW = width > 0 ? Math.round(width * scale) : undefined;
                const displayH = height > 0 ? Math.round(height * scale) : maxH;

                return (
                  <motion.div
                    key={unit._id}
                    initial={{ opacity: 0, y: 8, x: -0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -8, x: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    className="rounded-sm min-h-2  flex items-center justify-center  md:w-auto pointer-events-auto cursor-pointer"
                    onClick={() => {
                      document
                        .getElementById("what-fuels-1sp")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <img
                      src={logoUrl}
                      alt={unit.name || "Unit logo"}
                      width={displayW}
                      height={displayH}
                      style={{ width: displayW, height: displayH }}
                      className={`invert object-contain object-left iphone-landscape:max-w-[8vw]  max-w-[33vw]   min-h-2 md:min-h-8 lg:max-w-none ${logoHeightClass}`}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

export default PageBuilderLogoFloat;
