"use client";

import { startTransition, useEffect, useState } from "react";
import CaseGalleryComponent from "@renaissance/components/data/data-CaseGallery";
import { getTranslations } from "@1sp/utils/translations";

import StaggeredSlideUp from "@renaissance/components/ui/StaggeredSlideUp";

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string; taglabel?: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
}

interface SelectedCaseReference {
  _ref: string;
  _type: "reference";
  _key?: string;
}

interface CasesGalleryFilteredProps {
  locale?: string;
  caseStudies?: CaseStudy[];
  showFilters?: boolean;
  paddingY?: string;
  marginBottom?: string;
  navPointName?: string;
  selectionMode?: "auto" | "manual";
  selectedCases?: SelectedCaseReference[];
}

function CasesGalleryFiltered({
  locale = "en",
  caseStudies = [],
  showFilters = true,
  paddingY = "16",
  marginBottom = "16",
  navPointName,
}: CasesGalleryFilteredProps) {
  const t = getTranslations(locale);

  const [activeFilter, setActiveFilter] = useState<string>("");
  const [filterAllText, setFilterAllText] = useState<string>("");

  // Set the "All" filter text once translations are loaded
  useEffect(() => {
    setFilterAllText(t.casesList.filterAll);
    setActiveFilter(t.casesList.filterAll);
  }, [t.casesList.filterAll]);

  // Extract unique services with both name and taglabel
  const serviceMap = new Map<string, { name: string; taglabel: string }>();
  caseStudies
    .flatMap((study) => study.services || [])
    .forEach((service) => {
      const taglabel = service.taglabel || service.name;
      if (!serviceMap.has(taglabel)) {
        serviceMap.set(taglabel, {
          name: service.name,
          taglabel: taglabel,
        });
      }
    });

  const uniqueServices = Array.from(serviceMap.values()).sort((a, b) =>
    a.taglabel.localeCompare(b.taglabel)
  );

  const filters = [
    filterAllText,
    ...uniqueServices.map((s) => s.taglabel),
  ].filter(Boolean);
  const sectionId = t.ids.cases;

  // Get the actual service name for the active filter
  const activeServiceName =
    activeFilter === filterAllText
      ? filterAllText
      : serviceMap.get(activeFilter)?.name || activeFilter;

  const paddingClass = `py-${paddingY}`;
  const marginClass = `mb-${marginBottom}`;

  return (
    <div
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`grid grid-cols-12 z-1 mx-auto  container ${marginClass} relative font-renaissance`}
    >
      <div
        className={`z-1 grid gap-responsive col-span-12 ${paddingClass} col-start-1 container row-start-1 grid-cols-12`}
      >
        <div className="z-1 col-span-12 col-start-1 px-4 md:px-0">
          {/* Filter Buttons */}
          {showFilters && filters.length > 1 && (
            <div className="flex flex-wrap gap-4 mb-8 justify-center  md:justify-start">
              <StaggeredSlideUp
                key={activeFilter}
                staggerDelay={0.05}
                distance={11}
                duration={1}
                className="flex flex-wrap gap-1 justify-start md:gap-3   w-full md:justify-start"
              >
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      startTransition(() => {
                        setActiveFilter(filter);
                      });
                    }}
                    className={`px-3 py-1 md:px-2  text-sm md:text-xxs  md:font-medium uppercase transition-all  duration-100 ${activeFilter === filter
                      ? "bg-violet-500 text-black"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                      }`}
                  >
                    {filter}
                  </button>
                ))}

              </StaggeredSlideUp>
            </div>
          )}
          <CaseGalleryComponent
            caseStudies={caseStudies}
            activeFilter={activeServiceName}
            locale={locale}
            filterAllText={filterAllText}
          />
        </div>
      </div>
    </div>
  );
}

export default CasesGalleryFiltered;
