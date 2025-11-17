"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { SERVICES_QUERY } from "@/sanity/lib/queries";
import ServiceGalleryComponent from "@/components/data/data-ServiceGallery";
import { getTranslations } from "@/lib/translations";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

interface Service {
  _id: string;
  name: string;
  taglabel?: string;
  iconUrl?: string;
  serviceicon?: any;
  servicegrouprel?: { _id: string; name: string; taglabel?: string }[];
  unitsrel?: { _id: string; name: string; slug: { current: string } }[];
}

interface ServicesGalleryFilteredProps {
  showGridBackground?: boolean;
  showFilters?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
}

function ServicesGalleryFiltered({
  showGridBackground = false,
  showFilters = true,
  backgroundColor = "neutral-100",
  paddingY = "32",
  navPointName,
}: ServicesGalleryFilteredProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const [services, setServices] = useState<Service[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>(
    t.services.filterAll
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await client.fetch(SERVICES_QUERY, {
          language: locale,
        });

        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [locale]);

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

  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-12 z-50 mx-auto ${bgColorClass} relative`}
      >
        <div className="col-span-12 py-16 text-center">
          <div className="text-gray-400">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={sectionId}
      data-navpoint-name={navPointName}
      className={`grid grid-cols-12 z-50 mx-auto ${bgColorClass} min-h-[90vh] relative font-aspekta`}
    >
      <div
        className={`z-2 grid gap-8 col-span-12 ${paddingClass} col-start-1 container mx-auto row-start-1 grid-cols-12`}
      >
        <div className="col-span-12 col-start-3">
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
          />
        </div>
      </div>
    </div>
  );
}

export default withDebugBadge(
  ServicesGalleryFiltered,
  "pg-ServicesGalleryFiltered"
);
