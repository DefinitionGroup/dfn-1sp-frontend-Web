"use client";

import React from "react";
import TextHeadlineCombo from "@renaissance/components/ui/TextHeadlineCombo";
import type { GalleryOverview } from "@1sp/sanity-types";

export default function OverviewStep({ step }: { step: GalleryOverview }) {
  const {
    eyebrow,
    headline,
    highlight,
    subhead,
    kicker,
    align = "left",
    size = "xl",
    navPointName,
  } = step || {};

  if (![eyebrow, headline, highlight, subhead, kicker].some(Boolean))
    return null;

  // Generate section ID from headline
  const sectionId = headline
    ? headline
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "gallery-overview";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="bg-neutral-50 relative"
    >
      <div className="grid grid-cols-12 z-1 gap-8 mx-auto relative container font-renaissance">
        <div className="z-1 grid col-span-12 relative top-0 py-64 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="col-span-9 col-start-3 row-start-1 ">
            <TextHeadlineCombo
              eyebrow={eyebrow}
              headline={headline}
              highlight={highlight}
              subhead={subhead}
              kicker={kicker}
              align={align as any}
              size={size as any}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
