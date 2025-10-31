"use client";
import React from "react";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import Badgemodule from "@/components/ui/Badgemodule";
import ScrollHighlight from "../../ui/ScrollHighlight";
import type {
  GalleryScrollHighlightStep,
  CloudinaryAsset,
} from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";

type RawItem = string | { name?: string; text?: string };

function pickItems(step: any): RawItem[] {
  const candidates = [
    step?.scrollHighlightContent?.items,
    step?.items,
    step?.content?.items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as RawItem[];
  }
  return [];
}

export default function HighlightStep({
  step,
}: {
  step: GalleryScrollHighlightStep & { backgroundVideo?: CloudinaryAsset };
}) {
  const video = assetUrl(step.backgroundVideo);

  const rawItems = pickItems(step);
  const items = rawItems
    .map((it) =>
      typeof it === "string"
        ? { name: it, text: "" }
        : { name: it?.name || "", text: it?.text || "" }
    )
    .filter((i) => i.name);

  return (
    <section className="z-1 mx-auto mt-8 min-h-[60vh] relative font-aspekta">
      {video && (
        <HeaderImageVideoComp2 useVideo videoSrc={video} enableParallax />
      )}

      <div className="grid grid-cols-12 z-1 mx-auto relative container">
        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          {step.badge && (
            <Badgemodule
              className={step.badge.colSpan || "col-span-2"}
              text={step.badge.text ?? ""}
              subtitle={step.badge.subtitle ?? ""}
              numberEl={step.badge.numberEl ?? ""}
            />
          )}

          <div className="col-span-9 col-start-3">
            {items.length > 0 && <ScrollHighlight items={items} />}
          </div>
        </div>
      </div>
    </section>
  );
}
