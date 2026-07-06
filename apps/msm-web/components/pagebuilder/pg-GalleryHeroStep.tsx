"use client";
import type { GalleryHeroStep, CarouselItem } from "@1sp/sanity-types";
import HeaderImageVideoComp2 from "@msm/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import { Typewriter } from "motion-plus/react";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import { useRef } from "react";
import { assetUrl } from "@1sp/utils/cloudinary";
import { useInView } from "motion/react";
import { useParams } from "next/navigation";
import { hasVisibleText } from "@1sp/utils/text-content";
import Badgemodule from "@msm/components/ui/Badgemodule";


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

  const sectionId = step.typewriterText
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

      <div className="relative z-10 container mx-auto px-[var(--container-padding)] font-aspekta border-t border-white/10">
        {/* Background grid (optional visual helper) */}

        <div className="grid grid-cols-4 iphone-landscape:grid-cols-12 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pt-16 sm:pt-24 lg:pt-32 pb-6 sm:pb-8 lg:pb-12">
          {/* Badge — responsive positioning (reinstated, mirrors root) */}
          {(step as any).badge?.text && (
            <div className="hidden md:block md:col-span-2 md:mb-0 iphone-landscape:!hidden">
              <Badgemodule
                text={(step as any).badge.text ?? ""}
                subtitle={(step as any).badge.subtitle ?? ""}
                numberEl={(step as any).badge.numberEl ?? ""}
                variant="glass"
                size="md"
              />
            </div>
          )}

          <div className={`col-span-4 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 sm:col-span-6 ${(step as any).badge?.text ? "md:col-span-10 md:col-start-3" : "md:col-span-12"}`}>
            {hasVisibleText(step.typewriterText) && (
              <h2 className="headline-display mb-4 text-neutral-50 md:mb-2">
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
                className="flex flex-col items-start justify-start gap-0"
                delay={0}
                debug={false}
                easing="smooth"
                staggerDelay={0.1}
                duration={0.5}
                distance={40}
              >
                {step.description?.map((p, i) => (
                  <p key={i} className="text-base overflow-visible sm:text-lg text-neutral-400 max-w-2xl leading-normal">
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

export default GalleryHeroStepComponent;
