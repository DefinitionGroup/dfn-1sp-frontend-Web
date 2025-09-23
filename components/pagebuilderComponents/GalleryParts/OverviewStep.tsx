"use client";

import React from "react";
import GridBackground from "@/components/GridBackground";
import TextHeadlineCombo from "@/components/TextHeadlineCombo";
import type { GalleryOverview } from "@/types/sanity.types";

export default function OverviewStep({ step }: { step: GalleryOverview }) {
  const {
    eyebrow,
    headline,
    highlight,
    subhead,
    kicker,
    align = "left",
    size = "xl",
    grid,
  } = step || {};

  if (![eyebrow, headline, highlight, subhead, kicker].some(Boolean))
    return null;

  const showGrid = !!grid?.hasGrid;
  const delay = grid?.customAnimation ? grid?.delay : undefined;
  const staggerDelay = grid?.customAnimation ? grid?.staggerDelay : undefined;

  return (
    <section className="bg-neutral-50 relative">
      <div className="grid grid-cols-12 z-1 gap-8 mx-auto relative container font-aspekta">
        {showGrid && (
          <GridBackground delay={delay} staggerDelay={staggerDelay} />
        )}

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
