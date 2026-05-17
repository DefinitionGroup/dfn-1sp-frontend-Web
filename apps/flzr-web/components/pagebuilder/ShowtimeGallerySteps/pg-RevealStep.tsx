"use client";

import React from "react";
import GridBackground from "@flzr/components/ui/GridBackground";
import Badgemodule from "@flzr/components/ui/Badgemodule";
import TextReveal, { type RevealItem } from "@flzr/components/ui/TextReveal";
import type { BadgeModule, CloudinaryAsset } from "@1sp/sanity-types";
import { assetUrl } from "@/utils/utils";
import HeaderImageVideoComp2 from "@flzr/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";

export type GalleryRevealStep = {
  _type?: "galleryRevealStep";
  badge?: BadgeModule;
  items?: Array<{
    label?: string;
    image?: CloudinaryAsset;
    number?: number;
  }>;
  media?: CloudinaryAsset;
  grid?: { delay?: number; staggerDelay?: number };
  navPointName?: string;
};

export default function RevealStep({ step }: { step: GalleryRevealStep }) {
  const items: RevealItem[] = Array.isArray(step?.items)
    ? step.items.map((it) => ({
        label: it?.label,
        image: it?.image,
        number: it?.number,
      }))
    : [];

  const mediaUrl = assetUrl(step?.media);
  const isVideo =
    !!mediaUrl &&
    (/\/video\//.test(mediaUrl) || /\.(mp4|webm|ogg)$/i.test(mediaUrl));

  // Generate section ID from badge text
  const sectionId = step?.badge?.text
    ? step.badge.text
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "gallery-reveal";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step?.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta"
    >
      {mediaUrl && (
        <HeaderImageVideoComp2
          useVideo={isVideo}
          videoSrc={isVideo ? mediaUrl : undefined}
          imageSrc={!isVideo ? mediaUrl : undefined}
          enableParallax
        />
      )}

      <GridBackground
        delay={step?.grid?.delay}
        staggerDelay={step?.grid?.staggerDelay}
      />

      <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
        {step?.badge && (
          <Badgemodule
            className={`hidden md:block iphone-landscape:!hidden ${step.badge.colSpan || "col-span-2"}`}
            text={step.badge.text ?? ""}
            subtitle={step.badge.subtitle ?? ""}
            numberEl={step.badge.numberEl ?? ""}
          />
        )}

        <div className="col-span-12 col-start-1 md:col-span-9 md:col-start-3 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1">
          <TextReveal items={items} />
        </div>
      </div>
    </section>
  );
}
