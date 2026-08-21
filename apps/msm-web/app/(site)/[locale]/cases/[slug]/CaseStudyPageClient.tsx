"use client";
import { useEffect, useState } from "react";
import HeaderImageVideoComp from "@msm/components/data/Fragments/data-HeaderImageVideoComp";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import LineMinimap, { NavPoint } from "@msm/components/ui/MapVertical";
import { CasePageBuilder } from "@msm/components/CasePageBuilder";
import CasePoweredByContact from "@msm/components/pagebuilder/cases/pg-CasePoweredByContact";
import { getTranslations } from "@1sp/utils/translations";
import type { CaseStudyData } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

type MsmAttributedUnit = {
  _id: string;
  name: string;
  slug?: { current?: string };
};

interface CaseStudyPageClientProps {
  caseStudy: CaseStudyData & { msmUnits?: MsmAttributedUnit[] };
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
      <section className="relative h-[95vh] w-full overflow-hidden  mx-auto">
        <LineMinimap navPoints={navPoints} />

        {/* Background Image with Overlay */}
        {mainVideoUrl ? (
          <HeaderImageVideoComp
            useVideo={true} className="z-1  overflow-hidden "
            videoSrc={mainVideoUrl}
            enableParallax={true}
            opacity="opacity-70"
            enableVertical={caseStudy.isVerticalVideo}
          />
        ) : (
          <HeaderImageVideoComp
            useVideo={false}
            imageSrc={mainImageUrl}
            enableParallax={true}
            opacity="opacity-50"
          />
        )}


        {/* Hero Content */}
        <div id={t.ids.top} className="" />
        <div className="relative container flex flex-col justify-end  h-full z-20  mx-auto px-4 sm:px-6 md:px-8 lg:px-0">
          <StaggeredSlideUp
            delay={0.4}
            className="max-w-full flex flex-col gap-3 sm:gap-4 lg:max-w-2/3 "
          >
            {hasVisibleText(caseStudy.subtitle) && (
              <h2 className="text-violet-500 text-[10px] sm:text-xs   leading-compress  inline-block w-fit py-1  ">
                {caseStudy.subtitle}
              </h2>
            )}
            <h1 className="text-neutral-50 w-full md:w-2/3 pb-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl tracking-tight leading-none">
              {caseStudy.title}
            </h1>

            {hasVisibleText(caseStudy.description) && (
              <h3 className="text-neutral-50 w-full sm:w-3/4 md:w-1/2 pb-2 text-base sm:text-lg md:text-xl leading-relaxed">
                {caseStudy.description}
              </h3>
            )}
            {/* MSM Unit attribution is derived from Unit documents; Cases stay unchanged. */}
            {(caseStudy.msmUnits || []).length > 0 && (
              <div className="mb-4 flex w-fit flex-wrap gap-x-5 gap-y-2 border-t border-white/35 pt-3">
                {(caseStudy.msmUnits || []).map((unit) =>
                  hasVisibleText(unit.name) ? (

                    <h2 key={unit._id} className="inline-block w-fit text-[10px] font-bold uppercase tracking-[0.13em] text-msm-cyan sm:text-xxs">
                      {unit.name}
                    </h2>
                  ) : null
                )}
              </div>
            )}
          </StaggeredSlideUp>
        </div>

        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xxs font-medium -rotate-90 origin-bottom-left">
          MSM*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / MSM
        </div>
      </section>

      {/* Case Page Builder - Modular case study sections */}
      {caseStudy.casesPageBuilder &&
        Array.isArray(caseStudy.casesPageBuilder) &&
        caseStudy.casesPageBuilder.length > 0 && (
          <CasePageBuilder content={caseStudy.casesPageBuilder} />
        )}

      <CasePoweredByContact caseStudy={caseStudy} locale={locale} />
    </>
  );
}
