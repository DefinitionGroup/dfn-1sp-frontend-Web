"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";
import Badgemodule from "@/components/Badgemodule";
import ListContainerComponent from "@/components/ListContainerComponent";
import ListItemComponent from "@/components/ListItemComponent";
import ExpandableCards from "../subComponents/ExpandableCards";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import Button2 from "@/components/ui/Button2";

import type {
  GalleryListStep,
  CardItem,
  CTA,
  CloudinaryAsset,
  CtaMiniComponent as CtaMiniComponentType,
} from "@/types/sanity.types";
import { ctaToButtonProps, assetUrl, resolveLink } from "@/utils/utils";

import CtaMiniComponent from "@/components/CtaMiniComponent";

function pickHeader(step: GalleryListStep) {
  const legacyContentHeader = (step as any)?.content?.header as
    | GalleryListStep["header"]
    | undefined;

  return (
    step.header ??
    legacyContentHeader ?? {
      mainHeadline: step.headline,
    }
  );
}

function pickListItems(step: GalleryListStep) {
  const candidates = [
    step.listItems,
    (step as any)?.content?.list?.items,
    (step as any)?.list?.items,
    step.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

function pickLegacyCards(step: GalleryListStep): CardItem[] {
  const candidates = [
    (step as any)?.expandableCards?.items,
    (step as any)?.cards?.items,
    (step as any)?.content?.cards?.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c as CardItem[];
  return [];
}

type AC = NonNullable<GalleryListStep["additionalContent"]>[number];

function isCardsBlock(
  x: AC
): x is
  | (CardItem[] & { _type?: "cards" })
  | { _type?: "cards"; items?: CardItem[] } {
  return !!x && (x as any)._type === "cards";
}

function isCta(x: AC): x is CTA & { _type?: "cta" } {
  return (
    !!x && ((x as any)._type === "cta" || typeof (x as any)?.text === "string")
  );
}

function isCtaMini(
  x: AC
): x is CtaMiniComponentType & { _type?: "ctaMiniComponent" } {
  return (
    !!x &&
    ((x as any)._type === "ctaMiniComponent" ||
      typeof (x as any)?.heading === "string")
  );
}

function splitAdditionalContent(
  additional?: GalleryListStep["additionalContent"]
) {
  const out = {
    cards: [] as CardItem[],
    ctas: [] as CTA[],
    ctaMini: [] as Array<CtaMiniComponentType & { _type?: "ctaMiniComponent" }>,
  };
  if (!Array.isArray(additional)) return out;

  for (const item of additional) {
    if (isCardsBlock(item)) {
      const items = (item as any)?.items;
      if (Array.isArray(items)) out.cards.push(...items);
    } else if (isCtaMini(item)) {
      out.ctaMini.push({ ...(item as any), _type: "ctaMiniComponent" });
    } else if (isCta(item)) {
      out.ctas.push(item);
    }
  }
  return out;
}

function isVideoUrl(url?: string) {
  if (!url) return false;
  return /\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url);
}

/** ---------- Component ---------- */
export default function ListStep({ step }: { step: GalleryListStep }) {
  const delay = step.grid?.delay;
  const staggerDelay = step.grid?.staggerDelay;

  // Background media
  const mediaUrl = assetUrl(step.media as CloudinaryAsset | undefined);
  const isVideo = isVideoUrl(mediaUrl);

  // Headers
  const staggered = Boolean(step.staggeredSlideUp);
  const staggeredHeader = step.staggeredHeader;

  const header = pickHeader(step);
  const listItems = pickListItems(step);

  // Additional content split
  const {
    cards: cardsFromAC,
    ctas,
    ctaMini,
  } = splitAdditionalContent(step.additionalContent);
  const legacyCards = pickLegacyCards(step);
  const cards = (cardsFromAC.length ? cardsFromAC : legacyCards) as CardItem[];

  const hasCards = cards.length > 0;
  const hasCtaMini = !hasCards && ctaMini.length > 0;
  const hasCtas = !hasCards && !hasCtaMini && ctas.length > 0;

  // Layout for list column
  const listColClass = hasCtaMini
    ? "col-span-8 col-start-5"
    : "col-span-6 col-start-7";

  return (
    <section className="relative">
      {/* Optional background media */}
      {mediaUrl && (
        <HeaderImageVideoComp2
          useVideo={isVideo}
          videoSrc={isVideo ? mediaUrl : undefined}
          imageSrc={!isVideo ? mediaUrl : undefined}
          enableParallax
        />
      )}

      <GridBackground delay={delay} staggerDelay={staggerDelay} />

      <div className="z-1 grid gap-4 col-span-12 relative col-start-1 container mx-auto row-start-1 grid-cols-12">
        {/* Badge */}
        {step.badge && (
          <Badgemodule
            className={step.badge.colSpan || "col-span-2"}
            text={step.badge.text ?? ""}
            subtitle={step.badge.subtitle ?? ""}
            numberEl={step.badge.numberEl ?? ""}
          />
        )}

        {/* Header area */}
        {staggered
          ? (staggeredHeader?.title || staggeredHeader?.paragraph) && (
              <div className="col-span-10 col-start-3">
                <StaggeredSlideUp
                  className="flex flex-col items-start justify-start"
                  delay={0.0}
                  staggerDelay={0.1}
                  duration={0.5}
                  distance={80}
                >
                  {staggeredHeader?.title && (
                    <h2 className="text-9xl text-gray-100 max-w-xl font-nyghtserif font-semibold tracking-tight leading-compress mb-4 pb-8">
                      {staggeredHeader.title}
                    </h2>
                  )}
                  {staggeredHeader?.paragraph && (
                    <p className="text-body-lg text-gray-100 max-w-2xs mx-auto">
                      {staggeredHeader.paragraph}
                    </p>
                  )}
                </StaggeredSlideUp>
              </div>
            )
          : (header?.superText ||
              header?.mainHeadline ||
              header?.subHeadline) && (
              <header className="col-span-4 col-start-3 border-t">
                <div className="flex flex-col items-start justify-start w-full">
                  <div className="flex-1 flex flex-col min-w-0">
                    {header?.superText && (
                      <h2 className="text-xl text-neutral-900 font-bold font-aspekta">
                        {header.superText}
                      </h2>
                    )}
                    {header?.mainHeadline && (
                      <h4 className="text-7xl text-neutral-900 font-semibold leading-compress font-aspekta">
                        {header.mainHeadline}
                      </h4>
                    )}
                    {header?.subHeadline && (
                      <h4 className="text-xl mt-2 text-neutral-900 font-semibold leading-compress font-aspekta">
                        {header.subHeadline}
                      </h4>
                    )}
                  </div>
                </div>
              </header>
            )}

        {/* Left column when ctaMini is present */}
        {hasCtaMini && (
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100">
            {ctaMini.map((m, i) => {
              // Optional href from link
              const href = resolveLink(m.link);
              return (
                <CtaMiniComponent
                  key={`ctaMini-${i}`}
                  heading={m.heading || ""}
                  paragraph={m.paragraph || ""}
                  buttonText={m.buttonText || ""}
                  buttonVariant={(m.variant as any) || "limesmall"}
                  align={(m.alignment as any) || "left"}
                  url={href || undefined}
                  {...(href ? { href } : {})}
                />
              );
            })}
          </div>
        )}

        {/* Right list column */}
        {Array.isArray(listItems) && listItems.length > 0 && (
          <div className={`${listColClass} mt-8`}>
            <ListContainerComponent>
              {listItems.map((it, i) => (
                <ListItemComponent
                  key={(it as any)?._key || i}
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

        {/* Variant B (fallback): No cards, no ctaMini → plain CTA buttons */}
        {!hasCards && !hasCtaMini && hasCtas && (
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
