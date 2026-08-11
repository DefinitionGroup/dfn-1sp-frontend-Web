"use client";
import React from "react";
import Image from "next/image";
import { assetUrl } from "@1sp/utils/cloudinary";
import { getRenderableCta } from "@1sp/utils/cta";
import Link from "next/link";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import type { CloudinaryAsset, CTA } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

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
  units?: Unit[];
  language?: string;
}

function UnitLogoGrid({
  data,
  units = [],
  language = "de",
}: UnitLogoGridProps) {
  const {
    headline,
    subheadline,
    logoVariant = "logoColor",
    columns = 4,
    navPointName,
    hideFromNav = false,
  } = data || {};

  if (!hasVisibleText(headline)) return null;

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

  const getLinkHref = (unit: Unit): string | null => {
    const cta = getRenderableCta(unit.cta);
    if (!cta) return null;

    let href = cta.href;

    // Fix URL to include locale if it's an internal link
    if (href && href.startsWith("/") && !href.startsWith(`/${language}`)) {
      href = `/${language}${href}`;
    }

    return href;
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
      <div className="container mx-auto px-[var(--container-padding)] border-t border-white/10 pt-12 md:pt-16">
        {/* Grid background */}
        <div className="absolute inset-0 z-0">
        </div>

        {/* Headlines */}
        <div className="relative z-10 mb-12 md:mb-16 text-center">
          <StaggeredSlideUp
            className="flex flex-col items-center gap-4"
            delay={0.1}
            staggerDelay={0.1}
          >
            <h2 className="headline-display text-neutral-50">
              {headline}
            </h2>
            {subheadline && (
              <p className="text-lg md:text-xl text-neutral-400 max-w-2xl">
                {subheadline}
              </p>
            )}
          </StaggeredSlideUp>
        </div>

        {/* Logo Grid */}
        <div className="relative container max-w-4xl mx-auto  z-10">
          {unitsWithLogo.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No units found</div>
            </div>
          ) : (
            <StaggeredSlideUp
              className={`grid ${columnClasses[columns]} gap-0.5  w-full`}
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

                const logoContent = (
                    <div className="relative w-full aspect-[3/2] flex-col border border-white/15 items-center justify-center overflow-hidden">
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
                );
                const className = `group flex items-center justify-center hover:bg-white/5 p-2 md:p-4 ${bgClass} transition-all duration-300${href ? " cursor-pointer" : ""}`;

                return href ? (
                  <Link
                    key={unit._id}
                    href={href}
                    target={unit.cta?.link?.linkType === "external" ? "_blank" : undefined}
                    rel={unit.cta?.link?.linkType === "external" ? "noopener noreferrer" : undefined}
                    className={className}
                  >
                    {logoContent}
                  </Link>
                ) : (
                  <div key={unit._id} className={className}>
                    {logoContent}
                  </div>
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
