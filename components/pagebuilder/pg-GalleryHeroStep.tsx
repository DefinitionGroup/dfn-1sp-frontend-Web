"use client";
import type { GalleryHeroStep, CarouselItem } from "@/types/sanity.types";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import GridBackground from "@/components/ui/GridBackground";
import Badgemodule from "@/components/ui/Badgemodule";
import { Typewriter } from "motion-plus/react";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { useRef } from "react";
import { assetUrl } from "@/utils/utils";
import { useInView } from "motion/react";
import { useParams } from "next/navigation";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props =
  | { data: GalleryHeroStep }
  | GalleryHeroStep
  | { step: GalleryHeroStep };

function GalleryHeroStepComponent(props: Props) {
  const typewriterref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(typewriterref);
  const params = useParams();

  // Prop normalization
  let step: GalleryHeroStep;
  if ("step" in props && props.step) {
    step = props.step;
  } else if ("typewriterText" in props) {
    step = props as GalleryHeroStep;
  } else {
    step = (props as any).data;
  }

  if (!step) return null;

  const videoSrc = assetUrl(step.backgroundVideo);

  // Legacy carousel field support
  const carouselItems = (((step as any)?.carousel?.items ||
    (step as any)?.content?.carousel?.items) ??
    []) as CarouselItem[];

  // Get additional content items
  const additionalContent = (step as any)?.additionalContent || [];

  // Get language from URL params (locale), or step, or default to 'en'
  const language =
    (params?.locale as string) || (step as any)?.language || "en";

  // Generate section ID from badge text or typewriter text
  const sectionId = step.badge?.text
    ? step.badge.text
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : step.typewriterText
      ? step.typewriterText
          .substring(0, 30)
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase()
      : "gallery-hero";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="relative overflow-hidden"
    >
      {/* Optional background video */}
      {videoSrc && (
        <HeaderImageVideoComp2 useVideo videoSrc={videoSrc} enableParallax />
      )}

      <div className="grid grid-cols-6 md:grid-cols-12 z-1 mx-auto container  relative font-aspekta">
        {/* Background grid (optional visual helper) */}
        <GridBackground delay={0.2} staggerDelay={0.06} />

        <div className="z-1 grid  col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          {step.badge && (
            <Badgemodule
              text={step.badge.text ?? ""}
              subtitle={step.badge.subtitle ?? ""}
              numberEl={step.badge.numberEl ?? ""}
              className="col-span-6 md:col-span-2 col-start-2 md:col-start-1"
            />
          )}

          <div className="col-span-10 col-start-2 md:col-start-3">
            {step.typewriterText && (
              <h2 className="text-7xl font-regular tracking-tighter pr-2 mb-4">
                <Typewriter
                  ref={typewriterref}
                  play={isInView}
                  speed="fast"
                  cursorStyle={{ backgroundColor: "transparent" }}
                  variance={0.8}
                  backspace="word"
                >
                  {step.typewriterText}
                </Typewriter>
              </h2>
            )}

            {(step.description?.length ?? 0) > 0 && (
              <StaggeredSlideUp
                className="flex flex-col items-start justify-start "
                delay={0}
                debug={false}
                easing="smooth"
                staggerDelay={0.1}
                duration={0.5}
                distance={40}
              >
                {step.description?.map((p, i) => (
                  <p key={i} className="text-lg text-gray-600">
                    {p}
                  </p>
                ))}
              </StaggeredSlideUp>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default withDebugBadge(GalleryHeroStepComponent, "pg-GalleryHeroStep");
