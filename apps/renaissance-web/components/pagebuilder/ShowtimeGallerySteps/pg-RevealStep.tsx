"use client";

import React from "react";
import TextReveal, { type RevealItem } from "@renaissance/components/ui/TextReveal";
import type { CloudinaryAsset } from "@1sp/sanity-types";
import { assetUrl } from "@1sp/utils/cloudinary";
import HeaderImageVideoComp2 from "@renaissance/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";

export type GalleryRevealStep = {
  _type?: "galleryRevealStep";
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

  const sectionId = "gallery-reveal";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step?.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="grid grid-cols-12 z-1 mx-auto relative container font-renaissance"
    >
      {mediaUrl && (
        <HeaderImageVideoComp2
          useVideo={isVideo}
          videoSrc={isVideo ? mediaUrl : undefined}
          imageSrc={!isVideo ? mediaUrl : undefined}
          enableParallax
        />
      )}

      <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
        <div className="col-span-12 col-start-1 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1">
          <TextReveal items={items} />
        </div>
      </div>
    </section>
  );
}
