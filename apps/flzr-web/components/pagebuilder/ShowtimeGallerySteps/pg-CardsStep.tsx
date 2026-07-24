"use client";
import React from "react";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import HeaderImageVideoComp2 from "@flzr/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import ExpandableCards from "../Fragments/pg-ExpandableCards";
import type {
  GalleryCardsStep,
  CardItem,
  CloudinaryAsset,
} from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";

type CardsStepProps = {
  step: GalleryCardsStep & {
    content?: {
      title?: string;
      headline?: string;
      description?: string;
      subheadline?: string;
      cards?: { items?: CardItem[] };
      items?: CardItem[];
    };
    cards?: { items?: CardItem[] };
    expandableCards?: { items?: CardItem[] };
    backgroundVideo?: CloudinaryAsset;
    opacity?: number;
  };
};

function pickCardItems(step: CardsStepProps["step"]): CardItem[] {
  const candidates = [
    step?.expandableCards?.items,
    step?.cards?.items,
    step?.content?.cards?.items,
    step?.content?.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c as CardItem[];
  return [];
}

export default function CardsStep({ step }: CardsStepProps) {
  const videoSrc = assetUrl(step.backgroundVideo);
  const opacity = (step as any)?.opacity ?? 0.1;

  const title =
    (step as any)?.content?.title ??
    (step as any)?.content?.headline ??
    step.headline;

  const description =
    (step as any)?.content?.description ??
    (step as any)?.content?.subheadline ??
    "";

  const cards = pickCardItems(step);

  const sectionId = title
      ? title
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
      : "gallery-cards";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="grid grid-cols-12 z-2 mx-auto bg-neutral-100 mt-8 min-h-[50vh] relative font-flzr"
    >
      {/* Background video */}
      {videoSrc && (
        <HeaderImageVideoComp2
          useVideo
          videoSrc={videoSrc}
          enableParallax
          opacity={opacity}
        />
      )}

      <div className="z-1 grid gap-8  col-span-12 py-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
        {(title || description) && (
          <div className="col-span-12 col-start-1 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 border">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              {hasVisibleText(title) && (
                <h2 className="text-7xl leading-compress text-neutral-900 max-w-lg font-semibold leading-tighter mb-8">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text text-neutral-700 font-medium max-w-2xs mx-auto">
                  {description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>
        )}

        {/* Cards */}

        {cards.length > 0 && (
          <div className="col-span-12 col-start-1 md:col-span-10 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 mt-8 ">
            <ExpandableCards
              items={cards}
              variant="compact"
              columns={5}
              initialVisibleCount={Math.min(8, cards.length)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
