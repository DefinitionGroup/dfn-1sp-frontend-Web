"use client";

import { useState, useEffect } from "react";
import GridBackground from "@/components/ui/GridBackground";
import CaseGalleryComponent from "@/components/data/data-CaseGallery";
import { getTranslations } from "@/lib/translations";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";

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

interface CasesGalleryFilteredWithPaginationProps {
  locale?: string;
  caseStudies?: CaseStudy[];
  showGridBackground?: boolean;
  showFilters?: boolean;
  paddingY?: string;
  marginBottom?: string;
  navPointName?: string;
  rowsPerPage?: number;
}

function CasesGalleryFilteredWithPagination({
  locale = "en",
  caseStudies = [],
  showGridBackground = true,
  showFilters = true,
  paddingY = "16",
  marginBottom = "16",
  navPointName,
  rowsPerPage = 12,
}: CasesGalleryFilteredWithPaginationProps) {
  const t = getTranslations(locale);

  const [activeFilter, setActiveFilter] = useState<string>("");
  const [filterAllText, setFilterAllText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Set the "All" filter text once translations are loaded
  useEffect(() => {
    setFilterAllText(t.casesList.filterAll);
    setActiveFilter(t.casesList.filterAll);
  }, [t.casesList.filterAll]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

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

  // Filter case studies based on active filter
  const filteredCaseStudies =
    activeFilter === filterAllText
      ? caseStudies
      : caseStudies.filter((study) =>
          study.services?.some(
            (service) =>
              (service.taglabel || service.name) === activeFilter
          )
        );

  // Pagination logic
  const totalPages = Math.ceil(filteredCaseStudies.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCaseStudies = filteredCaseStudies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top of section when changing page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const paddingClass = `py-${paddingY}`;
  const marginClass = `mb-${marginBottom}`;

  return (
    <div
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`grid grid-cols-12 z-1 mx-auto container ${marginClass} relative font-aspekta`}
    >
      {showGridBackground && <GridBackground />}
      <div
        className={`z-1 grid gap-8 col-span-12 ${paddingClass} col-start-1 container mx-auto row-start-1 grid-cols-12`}
      >
        <div className="z-1 col-span-12 col-start-1">
          {/* Filter Buttons */}
          {showFilters && filters.length > 1 && (
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-xs font-medium uppercase transition-all duration-100 ${
                    activeFilter === filter
                      ? "bg-lime-500 text-black"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          
          {/* We pass the paginated list to the child component, but we need to trick it 
              because it might be doing its own filtering if we passed the raw list.
              However, looking at the original code, it passes `activeFilter` to `CaseGalleryComponent`.
              If `CaseGalleryComponent` does filtering internally, we might have a conflict.
              Let's check `CaseGalleryComponent` implementation if possible, or assume we need to pass 
              the already filtered and paginated list and tell it to show all.
              
              Actually, `CaseGalleryComponent` takes `activeFilter`. If we pass `filterAllText` as `activeFilter`
              and pass our `currentCaseStudies` (which are already filtered and paginated), 
              it should display exactly what we want.
          */}
          <CaseGalleryComponent
            caseStudies={currentCaseStudies}
            activeFilter={filterAllText} // Force "All" because we already filtered
            locale={locale}
            filterAllText={filterAllText}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full transition-colors ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
                aria-label="Previous page"
              >
                <CaretLeft size={24} />
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-lime-500 text-black"
                        : "bg-transparent text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
                aria-label="Next page"
              >
                <CaretRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CasesGalleryFilteredWithPagination;
