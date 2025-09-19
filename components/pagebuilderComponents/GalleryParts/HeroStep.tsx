"use client";
import type { GalleryHeroStep, CarouselItem } from "@/types/sanity.types";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import GridBackground from "@/components/GridBackground";
import Badgemodule from "@/components/Badgemodule";
import { Typewriter } from "motion-plus/react";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import { useRef } from "react";
import { assetUrl } from "@/utils/utils";
import InteractiveCarousel from "../subComponents/InteractiveCarousel";
export default function HeroStep({ step }: { step: GalleryHeroStep }) {
  const typewriterref = useRef<HTMLSpanElement | null>(null);
  const videoSrc = assetUrl(step.backgroundVideo);

  // Accept carousel data from Sanity if present (either step.carousel.items or step.content.carousel.items)
  const carouselItems = (((step as any)?.carousel?.items ||
    (step as any)?.content?.carousel?.items) ??
    []) as CarouselItem[];

  return (
    <section className="relative overflow-hidden">
      {/* Optional background video */}
      {videoSrc && (
        <HeaderImageVideoComp2 useVideo videoSrc={videoSrc} enableParallax />
      )}

      <div className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta">
        {/* Background grid (optional visual helper) */}
        <GridBackground />

        <div className="z-1 grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          {step.badge && (
            <Badgemodule
              text={step.badge.text ?? ""}
              subtitle={step.badge.subtitle ?? ""}
              numberEl={step.badge.numberEl ?? ""}
              className={step.badge.colSpan || "col-span-2"}
            />
          )}

          <div className="col-span-10 col-start-3 ">
            {step.headline && (
              <h2 className="text-7xl font-bold tracking-tighter pr-2 mb-4">
                {step.typewriter ? (
                  <Typewriter
                    ref={typewriterref as any}
                    play
                    cursorStyle={{ backgroundColor: "transparent" }}
                  >
                    {step.headline}
                  </Typewriter>
                ) : (
                  step.headline
                )}
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
        {carouselItems.length > 0 && (
          <div className="col-span-12 col-start-1 mt-8 ">
            <InteractiveCarousel items={carouselItems} />
          </div>
        )}
      </div>
    </section>
  );
}
