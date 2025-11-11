"use client";
import { useState, useEffect } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import CaseGalleryComponent from "@/components/data/data-CaseGallery";
import { getTranslations } from "@/lib/translations";

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string }[];
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

interface CasesPageClientProps {
  caseStudies: CaseStudy[];
  locale: string;
}

export default function CasesPageClient({
  caseStudies,
  locale,
}: CasesPageClientProps) {
  // Get translations for the current locale
  const t = getTranslations(locale);

  const [activeFilter, setActiveFilter] = useState<string>(
    t.casesList.filterAll
  );

  // Ensure body overflow is reset when component mounts (in case user navigates back)
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // Extract unique service names from case studies
  const uniqueServices = Array.from(
    new Set(
      caseStudies
        .flatMap((study) => study.services || [])
        .map((service) => service.name)
    )
  ).sort();

  const filters = [t.casesList.filterAll, ...uniqueServices];

  return (
    <>
      <section className="relative overflow-hidden">
        <HamburgerGradientMenu />

        {/* <FrontNavOverlay2 color="dark" /> */}

        {/* Intro Section */}
        <div
          id={t.ids.intro}
          className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta"
        >
          <GridBackground />
          <div className="z-1 grid  col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
            <div className="z-1 col-span-16 col-start-1 mt-16">
              {/* Description and CTA Section */}
              <div className="flex flex-col items-start gap-8 justify-center w-full">
                <StaggeredSlideUp
                  delay={0.19}
                  staggerDelay={0.03}
                  distance={100}
                  className=" max-w-2/4 "
                >
                  <h2 className="text-5xl leading-none text-neutral-700 pb-3 font-aspekta font-medium">
                    {t.casesList.title}
                  </h2>
                  <h2 className="text-5xl leading-none text-neutral-400  pb-3 font-aspekta font-">
                    {t.casesList.subtitle}
                  </h2>
                </StaggeredSlideUp>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <div
        id={t.ids.cases}
        className="grid grid-cols-12 z-1 mx-auto container  mb-16  relative font-aspekta"
      >
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-16 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-12 col-start-1 ">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-xs font-medium uppercase transition-all duration-100 ${
                    activeFilter === filter
                      ? "bg-lime-500 text-black "
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <CaseGalleryComponent
              caseStudies={caseStudies}
              activeFilter={activeFilter}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </>
  );
}
