"use client";

import React from "react";
import GridBackground from "@/components/GridBackground";
import Badgemodule from "@/components/Badgemodule";
import TextReveal, { type RevealItem } from "../subComponents/TextReveal";
import type { BadgeModule, CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";

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

  return (
    <section className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
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
            className={step.badge.colSpan || "col-span-2"}
            text={step.badge.text ?? ""}
            subtitle={step.badge.subtitle ?? ""}
            numberEl={step.badge.numberEl ?? ""}
          />
        )}

        <div className="col-start-3 col-span-9">
          <TextReveal items={items} />
        </div>
      </div>
    </section>
  );
}
