"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { CASE_STUDIES_QUERY } from "@/sanity/lib/queries";
import GridBackground from "@/components/ui/GridBackground";
import CaseGalleryComponent from "@/components/data/data-CaseGallery";
import { getTranslations } from "@/lib/translations";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

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

interface CasesGalleryFilteredProps {
  showGridBackground?: boolean;
  showFilters?: boolean;
  paddingY?: string;
  marginBottom?: string;
  navPointName?: string;
}

function CasesGalleryFiltered({
  showGridBackground = true,
  showFilters = true,
  paddingY = "16",
  marginBottom = "16",
  navPointName,
}: CasesGalleryFilteredProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterAllText, setFilterAllText] = useState<string>("");

  // Set the "All" filter text once translations are loaded
  useEffect(() => {
    setFilterAllText(t.casesList.filterAll);
    setActiveFilter(t.casesList.filterAll);
  }, [t.casesList.filterAll]);

  // Fetch case studies
  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        setIsLoading(true);
        // Get channel from cookie or default
        const channel =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("channel="))
            ?.split("=")[1] || "1spWeb";

        const data = await client.fetch(CASE_STUDIES_QUERY, {
          channel,
          language: locale,
        });

        setCaseStudies(data || []);
      } catch (error) {
        console.error("Error fetching case studies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseStudies();
  }, [locale]);

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-12 z-1 mx-auto container relative">
        <div className="col-span-12 py-16 text-center">
          <div className="text-gray-400">Loading cases...</div>
        </div>
      </div>
    );
  }

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
        <div className="z-1 col-span-12 col-start-1 px-4 md:px-0">
          {/* Filter Buttons */}
          {showFilters && filters.length > 1 && (
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-xxs md:text-xs font-bold md:font-medium uppercase transition-all  duration-100 ${
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

export default withDebugBadge(CasesGalleryFiltered, "pg-CasesGalleryFiltered");
