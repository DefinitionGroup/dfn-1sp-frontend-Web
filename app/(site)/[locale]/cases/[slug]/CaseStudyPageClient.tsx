"use client";
import { useEffect, useState } from "react";
import HeaderImageVideoComp from "@/components/data/Fragments/data-HeaderImageVideoComp";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import LineMinimap, { NavPoint } from "@/components/ui/MapVertical";
import { CasePageBuilder } from "@/components/CasePageBuilder";
import { getTranslations } from "@/lib/translations";
import type { CaseStudyData } from "@/types/sanity.types";

interface CaseStudyPageClientProps {
  caseStudy: CaseStudyData;
  locale: string;
}

export default function CaseStudyPageClient({
  caseStudy,
  locale,
}: CaseStudyPageClientProps) {
  const t = getTranslations(locale);
  const [navPoints, setNavPoints] = useState<NavPoint[]>([]);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  // Collect navigation points for minimap
  useEffect(() => {
    const collectPageIds = () => {
      setTimeout(() => {
        const all = document.querySelectorAll<HTMLElement>("[id]");
        const points: NavPoint[] = [];
        all.forEach((el) => {
          const id = el.id;
          const isInFooter = el.closest("footer") !== null;

          if (
            id &&
            !id.startsWith("headlessui-") &&
            !id.startsWith("radix-") &&
            !id.startsWith("__") &&
            !id.startsWith("_") &&
            id !== "_R_" &&
            id.length > 2 &&
            !/^\d+$/.test(id) &&
            !/^\d+-\d+$/.test(id) &&
            id !== "root" &&
            !isInFooter
          ) {
            const customName = el.getAttribute("data-navpoint-name");
            points.push({
              id: id,
              name: customName || id,
            });
          }
        });
        setNavPoints(points);
      }, 500);
    };
    collectPageIds();
  }, []);

  // Normalize main image / video URLs
  const mainVideoUrl =
    (caseStudy.mainVideo &&
      (caseStudy.mainVideo.secure_url || caseStudy.mainVideo.url)) ||
    (caseStudy.mainVideoUrl as string | undefined) ||
    null;

  const mainImageUrl =
    (caseStudy.mainImage &&
      (caseStudy.mainImage.secure_url || caseStudy.mainImage.url)) ||
    (caseStudy.mainImageUrl as string | undefined) ||
    "/placeholder.jpg";

  return (
    <>
      <section className="relative h-[95vh] overflow-hidden">
        <HamburgerGradientMenu />
        <LineMinimap navPoints={navPoints} />

        {/* Background Image with Overlay */}
        {mainVideoUrl ? (
          <HeaderImageVideoComp
            useVideo={true}
            videoSrc={mainVideoUrl}
            enableParallax={true}
            opacity="opacity-100"
          />
        ) : (
          <HeaderImageVideoComp
            useVideo={false}
            imageSrc={mainImageUrl}
            enableParallax={true}
            opacity="opacity-100"
          />
        )}

        {/* Hero Content */}
        <div id={t.ids.top} className="" />
        <div className="relative z-10 container mt-[30vh] mx-auto p-8 md:p-0">
          <StaggeredSlideUp
            delay={1}
            className="max-w-full flex flex-col md:gap-0 md:max-w-1/3 border-l-2 border-white/50 pl-4"
          >
            <h1 className="text-neutral-50 pb-2 text-7xl">{caseStudy.title}</h1>
            {caseStudy.subtitle && (
              <h2 className="text-neutral-50 pb-2 text-3xl">
                {caseStudy.subtitle}
              </h2>
            )}
            {caseStudy.description && (
              <h3 className="text-neutral-50 pb-2 text-2xl">
                {caseStudy.description}
              </h3>
            )}
          </StaggeredSlideUp>
        </div>

        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xxs font-medium -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / 1SP
        </div>
      </section>

      {/* Case Page Builder - Modular case study sections */}
      {caseStudy.casesPageBuilder &&
        Array.isArray(caseStudy.casesPageBuilder) &&
        caseStudy.casesPageBuilder.length > 0 && (
          <CasePageBuilder content={caseStudy.casesPageBuilder} />
        )}
    </>
  );
}
