"use client";

import { startTransition, useState } from "react";
import ServiceGalleryComponent from "@flzr/components/data/data-ServiceGallery";
import { getTranslations } from "@1sp/utils/translations";
import type { Service } from "@1sp/sanity-types";

interface ServicesGalleryFilteredProps {
  locale?: string;
  services?: Service[];
  showFilters?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
  presentation?: "carousel" | "grid";
  inheritSectionSurface?: boolean;
}

const GRID_PADDING_CLASSES: Record<string, string> = {
  "8": "py-8",
  "16": "py-16",
  "24": "py-24",
  "32": "py-32",
};

const BACKGROUND_CLASSES: Record<string, string> = {
  "neutral-100": "bg-neutral-100",
  white: "bg-white",
  transparent: "bg-transparent",
  black: "bg-black",
};

function ServicesGalleryFiltered({
  locale = "en",
  services = [],
  showFilters = true,
  backgroundColor = "neutral-100",
  navPointName,
  paddingY = "16",
  presentation = "carousel",
  inheritSectionSurface = false,
}: ServicesGalleryFilteredProps) {
  const t = getTranslations(locale);

  const [activeFilter, setActiveFilter] = useState<string>(
    t.services.filterAll
  );

  // Extract unique service groups for filtering
  const uniqueServiceGroups = Array.from(
    new Set(
      services
        .flatMap((service) => service.servicegrouprel || [])
        .map((group) => group.name)
    )
  ).sort();

  const filters = [t.services.filterAll, ...uniqueServiceGroups];
  const sectionId = t.ids.services;

  const bgColorClass = inheritSectionSurface
    ? "bg-transparent"
    : BACKGROUND_CLASSES[backgroundColor] ?? BACKGROUND_CLASSES["neutral-100"];
  const paddingClass =
    presentation === "grid"
      ? GRID_PADDING_CLASSES[paddingY] ?? GRID_PADDING_CLASSES["16"]
      : "";

  return (
    <section
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`relative z-10 overflow-hidden ${bgColorClass} ${paddingClass} font-flzr`}
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {showFilters && filters.length > 1 && (
          <div className="mb-8 overflow-x-auto border-b border-neutral-900/15 [scrollbar-width:none] md:mb-10 [&::-webkit-scrollbar]:hidden">
            <div
              className="flex w-max min-w-full gap-7"
              role="tablist"
              aria-label="Filter services"
            >
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  onClick={() => {
                    startTransition(() => {
                      setActiveFilter(filter);
                    });
                  }}
                  className={`relative pb-3 text-xs uppercase transition-colors duration-300 ${
                    activeFilter === filter
                      ? "text-neutral-900 after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-violet-500"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}
        <ServiceGalleryComponent
          services={services}
          activeFilter={activeFilter}
          locale={locale}
          filterAllText={t.services.filterAll}
          presentation={presentation}
        />
      </div>
    </section>
  );
}

export default ServicesGalleryFiltered;
