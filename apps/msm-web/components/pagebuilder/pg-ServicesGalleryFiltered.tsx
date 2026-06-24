"use client";

import { startTransition, useState } from "react";
import ServiceGalleryComponent from "@msm/components/data/data-ServiceGallery";
import { getTranslations } from "@1sp/utils/translations";
import type { Service } from "@1sp/sanity-types";

interface ServicesGalleryFilteredProps {
  locale?: string;
  services?: Service[];
  showFilters?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
}

function ServicesGalleryFiltered({
  locale = "en",
  services = [],
  showFilters = true,
  backgroundColor = "neutral-100",
  paddingY = "32",
  navPointName,
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

  const bgColorClass = `bg-${backgroundColor}`;
  const paddingClass = `py-${paddingY}`;

  return (
    <div
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`grid grid-cols-12 z-50 mx-auto ${bgColorClass} min-h-[90vh] relative font-aspekta`}
    >
      <div
        className={`z-2 grid gap-8  col-span-12 ${paddingClass} col-start-1 container mx-auto row-start-1 grid-cols-12`}
      >
        <div className="col-span-12 col-start-1">
          {/* Filter Buttons */}
          {showFilters && filters.length > 1 && (
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    startTransition(() => {
                      setActiveFilter(filter);
                    });
                  }}
                  className={`px-6 py-2  text-xs font-medium uppercase transition-all duration-100 ${
                    activeFilter === filter
                      ? "bg-violet-500 text-black"
                      : "bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          <ServiceGalleryComponent
            services={services}
            activeFilter={activeFilter}
            locale={locale}
            filterAllText={t.services.filterAll}
            initialVisibleCount={Math.min(6, services.length)}
          />
        </div>
      </div>
    </div>
  );
}

export default ServicesGalleryFiltered;
