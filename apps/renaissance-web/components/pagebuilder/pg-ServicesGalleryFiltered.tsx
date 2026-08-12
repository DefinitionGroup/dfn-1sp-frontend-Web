"use client";

import { startTransition, useState } from "react";
import ServiceGalleryComponent from "@renaissance/components/data/data-ServiceGallery";
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
    <section
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`relative z-10 overflow-hidden ${bgColorClass} ${paddingClass} font-renaissance`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(153,187,186,0.24),transparent_28%)]" />
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
        />
      </div>
    </section>
  );
}

export default ServicesGalleryFiltered;
