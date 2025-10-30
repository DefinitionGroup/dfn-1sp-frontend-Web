"use client";
import { useState } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import CaseGalleryComponent from "@/components/data/data-CaseGallery";

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
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Extract unique service names from case studies
  const uniqueServices = Array.from(
    new Set(
      caseStudies
        .flatMap((study) => study.services || [])
        .map((service) => service.name)
    )
  ).sort();

  const filters = ["All", ...uniqueServices];

  return (
    <>
      <section className="relative overflow-hidden">
        <HamburgerGradientMenu />

        {/* <FrontNavOverlay2 color="dark" /> */}

        {/* Intro Section */}
        <div
          id="Intro"
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
                    At 1SP, our passionate team thrives on creativity.
                  </h2>
                  <h2 className="text-5xl leading-none text-neutral-400  pb-3 font-aspekta font-">
                    Here is the proof. We deliver exceptional digital products
                    and experiences that make a difference.
                  </h2>
                </StaggeredSlideUp>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <div
        id="Cases"
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
