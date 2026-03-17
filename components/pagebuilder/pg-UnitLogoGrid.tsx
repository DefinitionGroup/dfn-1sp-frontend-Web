"use client";
import React from "react";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { UNIT_LOGO_GRID_QUERY } from "@/sanity/lib/queries";
import { resolveLink, assetUrl } from "@/utils/utils";
import { useParams } from "next/navigation";
import { Link } from "next-view-transitions";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import GridBackground from "@/components/ui/GridBackground";
import type { CloudinaryAsset, CTA } from "@/types/sanity.types";

type Unit = {
  _id: string;
  _type: string;
  name?: string;
  slug?: { current: string };
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
  logoSignet?: CloudinaryAsset;
  cta?: CTA;
};

interface UnitLogoGridProps {
  data: {
    headline?: string;
    subheadline?: string;
    logoVariant?: "logo" | "logoColor" | "logoSignet";
    columns?: 3 | 4 | 5 | 6;
    maxItems?: number;
    navPointName?: string;
    hideFromNav?: boolean;
    selectionMode?: "auto" | "manual";
    selectedUnits?: Unit[];
  };
  language?: string;
}

function UnitLogoGrid({ data, language: propLanguage }: UnitLogoGridProps) {
  const params = useParams();
  const language = propLanguage || (params?.locale as string) || "de";

  const {
    headline,
    subheadline,
    logoVariant = "logoColor",
    columns = 4,
    maxItems = 20,
    navPointName,
    hideFromNav = false,
    selectionMode = "auto",
    selectedUnits: preSelectedUnits,
  } = data || {};

  const [units, setUnits] = React.useState<Unit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUnits() {
      try {
        // Manual mode: use pre-selected units directly
        if (selectionMode === "manual" && preSelectedUnits && preSelectedUnits.length > 0) {
          setUnits(preSelectedUnits);
          setIsLoading(false);
          return;
        }

        // Auto mode: fetch units from database
        const fetchedUnits = await client.fetch<Unit[]>(
          UNIT_LOGO_GRID_QUERY,
          { language, maxItems: maxItems - 1 },
          { next: { revalidate: 60 } }
        );
        setUnits(fetchedUnits || []);
      } catch (error) {
        console.error("Error fetching units for logo grid:", error);
        setUnits([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUnits();
  }, [language, maxItems, selectionMode, preSelectedUnits]);

  if (!headline) return null;

  // Generate section ID from headline
  const sectionId = headline
    ? headline
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "unit-logo-grid";

  // Nav point data attribute
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  // Grid column classes based on configuration
  const columnClasses: Record<number, string> = {
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  };

  const getLogoForVariant = (unit: Unit): CloudinaryAsset | undefined => {
    switch (logoVariant) {
      case "logo":
        return unit.logo;
      case "logoSignet":
        return unit.logoSignet;
      case "logoColor":
      default:
        return unit.logoColor || unit.logo;
    }
  };

  const getLinkHref = (unit: Unit): string => {
    if (!unit.cta?.link) return "#";

    const link = unit.cta.link;
    let href = resolveLink(link);

    // Fix URL to include locale if it's an internal link
    if (href && href.startsWith("/") && !href.startsWith(`/${language}`)) {
      href = `/${language}${href}`;
    }

    return href || "#";
  };

  // Filter units that have the selected logo variant
  const unitsWithLogo = units.filter((unit) => {
    const logo = getLogoForVariant(unit);
    return assetUrl(logo);
  });

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      {...(hideFromNav ? { "data-nav-hidden": "true" } : {})}
      className="relative py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Grid background */}
        <div className="absolute inset-0 z-0">
          <GridBackground delay={0.1} staggerDelay={0.04} />
        </div>

        {/* Headlines */}
        <div className="relative z-10 mb-12 md:mb-16 text-center">
          <StaggeredSlideUp
            className="flex flex-col items-center gap-4"
            delay={0.1}
            staggerDelay={0.1}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-normal text-gray-800 dark:text-gray-100">
              {headline}
            </h2>
            {subheadline && (
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
                {subheadline}
              </p>
            )}
          </StaggeredSlideUp>
        </div>

        {/* Logo Grid */}
        <div className="relative container max-w-4xl mx-auto  z-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : unitsWithLogo.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No units found</div>
            </div>
          ) : (
            <StaggeredSlideUp
              className={`grid ${columnClasses[columns]} gap-0.5 rounded-sm w-full`}
              delay={0.1}
              staggerDelay={0.05}
            >
              {unitsWithLogo.map((unit, index) => {
                const logo = getLogoForVariant(unit);
                const href = getLinkHref(unit);
                const logoUrl = assetUrl(logo);

                if (!logoUrl) return null;

                // Use dark background for default logo variant (bright logos)
                const isDarkBg = logoVariant === "logo";
                const bgClass = isDarkBg
                  ? "bg-neutral-900 dark:bg-gray-950"
                  : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm";

                return (
                  <Link
                    key={unit._id}
                    href={href}
                    target={unit.cta?.link?.linkType === "external" ? "_blank" : undefined}
                    rel={unit.cta?.link?.linkType === "external" ? "noopener noreferrer" : undefined}
                    className={`group flex items-center justify-center hover:bg-neutral-200/20 rounded-sm   cursor-pointer p-2 md:p-4  ${bgClass} transition-all duration-300`}
                  >
                    <div className="relative w-full aspect-[3/2] flex-col cursor-pointer border border-neutral-200/90  rounded-sm   items-center justify-center overflow-hidden">
                      <Image
                        src={logoUrl}
                        alt={unit.name || "Unit logo"}
                        fill
                        className={`object-contain object-center relative  transition-all duration-300    px-4   group-hover:scale-80 ${isDarkBg
                          ? "opacity-90 group-hover:opacity-100"
                          : "opacity-90 group-hover:opacity-100 dark:brightness-0 dark:invert"
                          }`}
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        unoptimized
                      />
                    </div>
                  </Link>
                );
              })}
            </StaggeredSlideUp>
          )}
        </div>
      </div>
    </section>
  );
}

export default UnitLogoGrid;
