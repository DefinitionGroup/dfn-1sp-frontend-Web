"use client";
import React from "react";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import Badgemodule from "@/components/Badgemodule";
import ScrollHighlight from "../subComponents/ScrollHighlight";
import type {
  GalleryScrollHighlightStep,
  CloudinaryAsset,
} from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";

export default function HighlightStep({
  step,
}: {
  step: GalleryScrollHighlightStep & { backgroundVideo?: CloudinaryAsset };
}) {
  const video = assetUrl(step.backgroundVideo);

  // Pull items from common Sanity shapes: step.items or step.content.items
  const rawItems = ((step as any)?.items ??
    (step as any)?.content?.items ??
    []) as Array<string | { name?: string; text?: string }>;

  // Normalize to { name, text }
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
