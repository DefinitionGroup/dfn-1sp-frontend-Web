// components/showtimeGallery/steps/CardsStep.tsx
"use client";
import React from "react";
import Badgemodule from "@/components/Badgemodule";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import ExpandableCards from "../subComponents/ExpandableCards";
import type {
  GalleryCardsStep,
  CardItem,
  CloudinaryAsset,
} from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";

export default function CardsStep({
  step,
}: {
  step: GalleryCardsStep & {
    // allow flexible shapes from Sanity
    content?: {
      title?: string; // e.g. "News."
      headline?: string; // fallback
      description?: string; // paragraph under the title
      subheadline?: string; // optional alt source for description
      cards?: { items?: CardItem[] };
    };
    cards?: { items?: CardItem[] };
    backgroundVideo?: CloudinaryAsset;
    opacity?: number; // optional dimmer for bg video (if your HeaderImageVideoComp2 supports it)
  };
}) {
  const videoSrc = assetUrl(step.backgroundVideo);
  const opacity = (step as any)?.opacity ?? 0.1;

  // Headline + paragraph (flexible sources)
  const title =
    (step as any)?.content?.title ??
    (step as any)?.content?.headline ??
    step.headline;

  const description =
    (step as any)?.content?.description ??
    (step as any)?.content?.subheadline ??
    "";

  // Cards for the grid (Sanity-driven)
  const cards: CardItem[] | undefined =
    (step as any)?.content?.cards?.items ?? (step as any)?.cards?.items;

  return (
    <section className="grid grid-cols-12 z-2 mx-auto bg-neutral-100 mt-8 min-h-[50vh] relative font-aspekta">
      {/* Background video */}
      {videoSrc && (
        <HeaderImageVideoComp2
          useVideo
          videoSrc={videoSrc}
          enableParallax
          opacity={opacity}
        />
      )}

      <div className="z-1 grid gap-8 col-span-12 py-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
        {/* Badge (left) */}
        {step.badge && (
          <Badgemodule
            className={step.badge.colSpan || "col-span-2"}
            text={step.badge.text ?? ""}
            subtitle={step.badge.subtitle ?? ""}
            numberEl={step.badge.numberEl ?? ""}
          />
        )}

        {/* Title + paragraph (center) */}
        {(title || description) && (
          <div className="col-span-10 col-start-3">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              {title && (
                <h2 className="text-7xl leading-compress text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text text-gray-100 font-medium max-w-2xs mx-auto">
                  {description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>
        )}

        {/* Cards (compact variant – replaces ExpandableCards2) */}
        <div className="col-span-9 col-start-3 mt-8">
          <ExpandableCards items={cards} variant="compact" columns={5} />
        </div>
      </div>
    </section>
  );
}
