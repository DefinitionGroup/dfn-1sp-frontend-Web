"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";
import Badgemodule from "@/components/Badgemodule";
import ListContainerComponent from "@/components/ListContainerComponent";
import ListItemComponent from "@/components/ListItemComponent";
import ExpandableCards from "../subComponents/ExpandableCards";
import type { GalleryListStep, CardItem, CTA } from "@/types/sanity.types";
import { ctaToButtonProps } from "@/utils/utils";
import Button2 from "@/components/ui/Button2";

type HeadBlock = {
  superText?: string;
  mainHeadline?: string;
  subHeadline?: string;
};

type ListStepProps = {
  step: GalleryListStep & {
    grid?: { delay?: number; staggerDelay?: number };
    header?: HeadBlock;
    content?: {
      header?: HeadBlock;
      list?: { items?: GalleryListStep["items"] };
      cards?: { items?: CardItem[] };
      headline?: string;
    };
    cards?: { items?: CardItem[] };
    list?: { items?: GalleryListStep["items"] };
    expandableCards?: { items?: CardItem[] };
    listItems?: GalleryListStep["items"];
    additionalContent?: Array<CTA | { _type?: string; items?: CardItem[] }>; // new schema
  };
};

function pickHeader(step: ListStepProps["step"]): HeadBlock {
  return (
    (step as any)?.content?.header ||
    (step as any)?.header || {
      mainHeadline: (step as any)?.headline || undefined,
    }
  );
}

function pickListItems(step: ListStepProps["step"]) {
  const candidates = [
    (step as any)?.listItems, // schema primary
    (step as any)?.content?.list?.items,
    (step as any)?.list?.items,
    (step as any)?.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c as any[];
  return [] as any[];
}

function pickCards(step: ListStepProps["step"]): CardItem[] {
  const candidates = [
    (step as any)?.expandableCards?.items, // legacy name
    (step as any)?.cards?.items,
    (step as any)?.content?.cards?.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c as CardItem[];
  return [] as CardItem[];
}

function pickFromAdditionalContent(
  additional: ListStepProps["step"]["additionalContent"]
) {
  const out = { cards: [] as CardItem[], ctas: [] as CTA[] };
  if (!Array.isArray(additional)) return out;

  for (const item of additional) {
    const t = (item as any)?._type;
    if (t === "cards") {
      const items = (item as any)?.items;
      if (Array.isArray(items)) out.cards.push(...(items as CardItem[]));
    } else if (t === "cta") {
      out.ctas.push(item as CTA);
    }
  }
  return out;
}

export default function ListStep({ step }: ListStepProps) {
  const delay = (step as any)?.grid?.delay;
  const staggerDelay = (step as any)?.grid?.staggerDelay;

  const header = pickHeader(step);
  const listItems = pickListItems(step);

  const legacyCards = pickCards(step);
  const { cards: cardsFromAC, ctas } = pickFromAdditionalContent(
    (step as any)?.additionalContent
  );

  // Variant selection: prefer cards if present; otherwise use CTAs
  const cards = (cardsFromAC?.length ?? 0) > 0 ? cardsFromAC : legacyCards;
  const hasCards = Array.isArray(cards) && cards.length > 0;
  const hasCtas = !hasCards && Array.isArray(ctas) && ctas.length > 0;

  return (
    <section className="relative">
      <GridBackground delay={delay} staggerDelay={staggerDelay} />

      <div className="z-1 grid gap-4 col-span-12 relative col-start-1 container mx-auto row-start-1 grid-cols-12">
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
          <div className="col-span-6 col-start-7 border-t pt-8">
            {/* fits 12-col grid */}
            <ListContainerComponent>
              {listItems.map((it: any, i: number) => (
                <ListItemComponent
                  key={it?._key || i}
                  size={(it?.size as any) || "small"}
                  fontWeight={(it?.fontWeight as any) || "normal"}
                  color={(it?.color as any) || "black"}
                >
                  {it?.text}
                </ListItemComponent>
              ))}
            </ListContainerComponent>
          </div>
        )}

        {/* Variant A: Cards present (no buttons) */}
        {hasCards && (
          <div className="col-span-10 col-start-3 mt-8">
            <ExpandableCards items={cards} variant="default" />
          </div>
        )}

        {/* Variant B: No cards, show CTA buttons from additionalContent */}
        {hasCtas && (
          <div className="col-span-2 col-start-3 mt-8 pr-8">
            <div className="flex flex-col gap-4">
              {ctas.map((cta, idx) => {
                const btn = ctaToButtonProps(cta);
                if (!btn.text) return null;
                return (
                  <Button2
                    key={`cta-${idx}`}
                    variant={btn.variant as any}
                    text={btn.text}
                    href={btn.href}
                    className="w-fit"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
