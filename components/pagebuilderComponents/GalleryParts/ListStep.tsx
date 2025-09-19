// components/showtimeGallery/steps/ListStep.tsx
"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";
import Badgemodule from "@/components/Badgemodule";
import ListContainerComponent from "@/components/ListContainerComponent";
import ListItemComponent from "@/components/ListItemComponent";
import ExpandableCards from "../subComponents/ExpandableCards";
import type { GalleryListStep, CardItem } from "@/types/sanity.types";

/**
 * Supports:
 * - Badge (left)
 * - Header block with super/main/sub headlines
 * - List items (right column)
 * - Optional bottom ExpandableCards (if provided by Sanity)
 * - Optional GridBackground animation timing via step.grid
 */
type HeadBlock = {
  superText?: string;
  mainHeadline?: string;
  subHeadline?: string;
};

export default function ListStep({
  step,
}: {
  step: GalleryListStep & {
    grid?: { delay?: number; staggerDelay?: number };
    // Optional richer header shape
    header?: HeadBlock;
    content?: {
      header?: HeadBlock;
      list?: { items?: GalleryListStep["items"] };
      cards?: { items?: CardItem[] };
      // allow headline string fallback
      headline?: string;
    };
    // direct fallbacks
    cards?: { items?: CardItem[] };
    list?: { items?: GalleryListStep["items"] };
  };
}) {
  const delay = (step as any)?.grid?.delay;
  const staggerDelay = (step as any)?.grid?.staggerDelay;

  // Header: prefer object {super/main/sub}, fallback to step.headline string
  const header: HeadBlock = (step as any)?.content?.header ||
    (step as any)?.header || {
      mainHeadline: step.headline, // fallback to simple headline if provided
    };

  // List items: support multiple nesting shapes
  const listItems =
    (step as any)?.content?.list?.items ??
    (step as any)?.list?.items ??
    step.items ??
    [];

  // Optional cards at the bottom (same section as your reference)
  const cards: CardItem[] | undefined =
    (step as any)?.content?.cards?.items ?? (step as any)?.cards?.items;

  return (
    <section className="relative">
      <GridBackground delay={delay} staggerDelay={staggerDelay} />

      <div className="z-1 grid gap-4 col-span-12 relative col-start-1 container mx-auto row-start-1 grid-cols-12 ">
        {step.badge && (
          <Badgemodule
            className={step.badge.colSpan || "col-span-2"}
            text={step.badge.text ?? ""}
            subtitle={step.badge.subtitle ?? ""}
            numberEl={step.badge.numberEl ?? ""}
          />
        )}

        {/* Left header block */}
        {(header.superText || header.mainHeadline || header.subHeadline) && (
          <header className="col-span-4 col-start-3 border-t">
            <div className="flex flex-col items-start justify-start w-full">
              <div className="flex-1 flex flex-col min-w-0">
                {header.superText && (
                  <h2 className="text-xl text-neutral-900 font-bold font-aspekta">
                    {header.superText}
                  </h2>
                )}
                {header.mainHeadline && (
                  <h4 className="text-7xl text-neutral-900 font-semibold leading-compress font-aspekta">
                    {header.mainHeadline}
                  </h4>
                )}
                {header.subHeadline && (
                  <h4 className="text-xl mt-2 text-neutral-900 font-semibold leading-compress font-aspekta">
                    {header.subHeadline}
                  </h4>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Right list column */}
        {Array.isArray(listItems) && listItems.length > 0 && (
          <div className="col-span-8 col-start-7 border-t pt-8">
            <ListContainerComponent>
              {listItems.map((it: any, i: number) => (
                <ListItemComponent
                  key={i}
                  size={(it?.size as any) || "small"}
                  fontWeight={(it?.fontWeight as any) || "normal"}
                  color={(it?.color as any) || "black"} // 'black' | 'white' | 'gray'
                >
                  {it?.text}
                </ListItemComponent>
              ))}
            </ListContainerComponent>
          </div>
        )}

        {/* Bottom cards (optional, matches reference layout) */}
        {Array.isArray(cards) && cards.length > 0 && (
          <div className="col-span-10 col-start-3 mt-8">
            <ExpandableCards items={cards} variant="default" />
          </div>
        )}
      </div>
    </section>
  );
}
