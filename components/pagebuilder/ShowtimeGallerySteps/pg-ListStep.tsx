"use client";

import React, { useEffect, useState } from "react";
import GridBackground from "@/components/ui/GridBackground";
import Badgemodule from "@/components/ui/Badgemodule";
import ListContainerComponent from "@/components/ui/ListContainerComponent";
import ListItemComponent from "@/components/ui/ListItemComponent";
import ExpandableCards from "../Fragments/pg-ExpandableCards";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Button2 from "@/components/ui/Button2";
import CtaMiniComponent from "../Fragments/pg-CtaMiniComponent";
import CtaSplitHeader from "../Fragments/pg-CtaSplitHeader";

import type {
  GalleryListStep,
  CardItem,
  CTA,
  CloudinaryAsset,
  CtaMiniComponent as CtaMiniComponentType,
  CtaSplitHeader as CtaSplitHeaderType,
} from "@/types/sanity.types";

import {
  ctaToButtonProps,
  assetUrl,
  resolveLink,
  resolveLinkAsync,
} from "@/utils/utils";
import { useParams } from "next/navigation";

/* ---------- helpers ---------- */

function isVideoUrl(url?: string) {
  if (!url) return false;
  return /\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url);
}

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

type UnitReference = {
  _id: string;
  _type: string;
  name?: string;
  slug?: { current: string };
  logo?: CloudinaryAsset;
  backgroundImage?: CloudinaryAsset;
  description?: string;
  tagline?: string;
  cta?: CTA;
};

type UnitCardsBlock = {
  _type?: "unitCards";
  units?: UnitReference[];
  sortBy?: "manual" | "name-asc" | "name-desc" | "recent";
};

function isCardsBlock(x: AC): x is { _type?: "cards"; items?: CardItem[] } {
  return !!x && (x as any)._type === "cards";
}

function isUnitCardsBlock(x: any): x is UnitCardsBlock {
  return !!x && (x as any)._type === "unitCards";
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

function isCtaSplitHeader(
  x: AC
): x is CtaSplitHeaderType & { _type?: "ctaSplitHeader" } {
  return !!x && (x as any)._type === "ctaSplitHeader";
}

function transformUnitsToCards(
  units: UnitReference[],
  sortBy?: string
): CardItem[] {
  if (!Array.isArray(units)) return [];

  // Sort units based on sortBy parameter
  const sortedUnits = [...units];
  if (sortBy === "name-asc") {
    sortedUnits.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sortBy === "name-desc") {
    sortedUnits.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  }
  // "manual" and "recent" keep the order from Sanity

  return sortedUnits.map(
    (unit) =>
      ({
        _type: "cardItem" as const,
        title: unit.name || "",
        description: unit.tagline || unit.description || "",
        src: unit.backgroundImage || unit.logo,
        logo: unit.logo,
        content: unit.description || "",
        ctaButton: unit.cta || undefined,
      }) as CardItem
  );
}

function splitAdditionalContent(
  additional?: GalleryListStep["additionalContent"]
) {
  const out = {
    cards: [] as CardItem[],
    ctas: [] as CTA[],
    ctaMini: [] as Array<CtaMiniComponentType & { _type?: "ctaMiniComponent" }>,
    ctaSplit: [] as Array<CtaSplitHeaderType & { _type?: "ctaSplitHeader" }>,
  };
  if (!Array.isArray(additional)) return out;

  for (const item of additional) {
    if (isCardsBlock(item)) {
      const items = (item as any)?.items;
      if (Array.isArray(items)) out.cards.push(...items);
    } else if (isUnitCardsBlock(item)) {
      const unitCards = transformUnitsToCards(
        (item as any)?.units || [],
        (item as any)?.sortBy
      );
      if (unitCards.length > 0) out.cards.push(...unitCards);
    } else if (isCtaMini(item)) {
      out.ctaMini.push({ ...(item as any), _type: "ctaMiniComponent" });
    } else if (isCtaSplitHeader(item)) {
      out.ctaSplit.push({ ...(item as any), _type: "ctaSplitHeader" });
    } else if (isCta(item)) {
      out.ctas.push(item);
    }
  }
  return out;
}

/** Map tailwind text sizes */
const sizeToClass: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

function normalizeParagraphs(lines: unknown) {
  const src: any[] = Array.isArray(lines) ? lines : [];
  const flat: any[] = src.flatMap((item) =>
    Array.isArray(item) ? item : [item]
  );

  return flat
    .map((line, idx) => {
      if (typeof line === "string")
        return { text: line, fontSize: idx === 0 ? "3xl" : "base" };

      if (line && typeof line === "object") {
        const raw = (line as any)?.fontSize;
        const value =
          typeof raw === "string"
            ? raw
            : typeof raw === "object"
              ? raw?.size
              : undefined;

        return {
          text: (line as any)?.text ?? "",
          fontSize: value || (idx === 0 ? "3xl" : "base"),
        };
      }

      return { text: "", fontSize: "base" };
    })
    .filter((l) => l.text);
}

/* ---------- component ---------- */

export default function ListStep({ step }: { step: GalleryListStep }) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const applyLocaleToPath = (url?: string | null) => {
    if (!url) return undefined;
    if (!url.startsWith("/")) return url || undefined;
    if (url.startsWith(`/${locale}`)) return url;
    return `/${locale}${url}`;
  };

  const delay = step.grid?.delay;
  const staggerDelay = step.grid?.staggerDelay;

  // Background media
  const mediaUrl = assetUrl(step.media as CloudinaryAsset | undefined);
  const useVideo = isVideoUrl(mediaUrl);

  // Headers
  const staggered = Boolean(step.staggeredSlideUp);
  const staggeredHeader = step.staggeredHeader;
  const header = pickHeader(step);

  // Staggered paragraphs (new schema, with per-line font sizes)
  const paragraphLines = normalizeParagraphs(
    (staggeredHeader as any)?.paragraphs
  );

  // Lists & content
  const listItems = pickListItems(step);

  const {
    cards: cardsFromAC,
    ctas,
    ctaMini,
    ctaSplit,
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

  // Generate section ID from badge text or header text
  const sectionId = step.badge?.text
    ? step.badge.text
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : header.mainHeadline
      ? header.mainHeadline
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
      : "gallery-list";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  const shouldShowBadgeMiniCta = Boolean(
    step.showBadgeMiniCta && step.badgeMiniCta
  );
  const badgeMiniCta = shouldShowBadgeMiniCta ? step.badgeMiniCta : undefined;
  const showBadgeMiniCta = shouldShowBadgeMiniCta;
  const [badgeMiniUrl, setBadgeMiniUrl] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function updateBadgeUrl() {
      if (!showBadgeMiniCta || !badgeMiniCta?.link) {
        if (!cancelled) setBadgeMiniUrl(undefined);
        return;
      }
      const resolved = await resolveLinkAsync(badgeMiniCta.link);
      if (!cancelled) setBadgeMiniUrl(applyLocaleToPath(resolved));
    }

    updateBadgeUrl();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBadgeMiniCta, badgeMiniCta?.link, locale]);

  const [ctaMiniUrls, setCtaMiniUrls] = useState<string[]>(() =>
    ctaMini.map((item) => applyLocaleToPath(resolveLink(item.link)) || "")
  );


  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="z-4 grid col-span-12 relative col-start-1 container mx-auto row-start-1 grid-cols-12 "
    >
      {/* Optional background media */}
      {mediaUrl && (
        <HeaderImageVideoComp2
          useVideo={useVideo}
          videoSrc={useVideo ? mediaUrl : undefined}
          imageSrc={!useVideo ? mediaUrl : undefined}
          enableParallax
        />
      )}

      <GridBackground delay={delay} staggerDelay={staggerDelay} />

      <div className="z-1 grid col-span-12  col-start-1 pt-32 row-start-1 grid-cols-12 ">
        {/* Badge */}
        <div className="col-span-6 col-start-2  row-span-2 md:col-start-1 md:col-span-2 md:sticky top-0 ">

          {step.badge && (
            <Badgemodule
              text={step.badge.text ?? ""}
              subtitle={step.badge.subtitle ?? ""}
              numberEl={step.badge.numberEl ?? ""}
            />

          )}
          {showBadgeMiniCta && badgeMiniCta && (
            <div className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 mt-4 pr-8 ">
              <CtaMiniComponent
                heading={badgeMiniCta.heading || ""}
                paragraph={badgeMiniCta.paragraph || ""}
                buttonText={badgeMiniCta.buttonText || ""}
                buttonVariant={(badgeMiniCta.variant as any) || "limesmall"}
                align={(badgeMiniCta.alignment as any) || "left"}
                url={badgeMiniUrl || undefined}
              />
            </div>
          )}
        </div>



        {/* Header area */}
        {staggered
          ? ((staggeredHeader as any)?.title || paragraphLines.length > 0) && (
            <div className="col-span-10 col-start-3">
              <StaggeredSlideUp
                className="flex flex-col items-start justify-start"
                delay={0}
                staggerDelay={0.1}
                duration={0.5}
                distance={80}
              >
                {(staggeredHeader as any)?.title && (
                  <h2 className="text-9xl text-gray-100 max-w-xl font-nyghtserif font-semibold tracking-tight leading-compress mb-4 pb-8">
                    {(staggeredHeader as any).title}
                  </h2>
                )}

                {paragraphLines.map((line, idx) => (
                  <p
                    key={`para-${idx}`}
                    className={[
                      sizeToClass[line.fontSize] || "text-base",
                      "text-gray-100 max-w-2xs mx-auto",
                      idx > 0 ? "mt-4" : "",
                    ].join(" ")}
                  >
                    {line.text}
                  </p>
                ))}
              </StaggeredSlideUp>
            </div>
          )
          : (header?.superText ||
            header?.mainHeadline ||
            header?.subHeadline) && (
            <header className="col-span-12  md:col-span-4 col-start-2 md:col-start-3  md:mt-0 border-y border-gray-200">
              <div className="flex flex-col items-start justify-start w-full">
                <div className="flex-1 flex flex-col min-w-0">
                  {header?.superText && (
                    <h4 className=" text-neutral-900 font-bold font-aspekta">
                      {header.superText}
                    </h4>
                  )}
                  {header?.mainHeadline && (
                    <h2 className="text-5xl md:text-7xl  text-gray-900  tracking-tight font-aspekta">
                      {header.mainHeadline}
                    </h2>
                  )}
                  {header?.subHeadline && (
                    <h4 className=" text-gray-700 font-medium leading- font-aspekta">
                      {header.subHeadline}
                    </h4>
                  )}
                </div>
              </div>
            </header>
          )}

        {/* Right list column */}
        {Array.isArray(listItems) && listItems.length > 0 && (
          <div className="col-span-10 md:col-span-4 col-start-2 md:col-start-3 mt-12 md:mt-0 border-gray-500 pb-8 md:row-start-2 ">
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

        {/* Left column when ctaMini is present */}
        {hasCtaMini && (
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100">
            {ctaMini.map((m, i) => {
              const href =
                ctaMiniUrls[i] || applyLocaleToPath(resolveLink(m.link));
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

        {/* Inject any ctaSplitHeader blocks as full-width rows */}
        {Array.isArray(ctaSplit) &&
          ctaSplit.length > 0 &&
          ctaSplit.map((block, i) => (
            <div key={`ctaSplit-${i}`} className="col-span-12 mt-8">
              <CtaSplitHeader data={block} />
            </div>
          ))}

        {/* Variant A: Cards present (no buttons) */}
        {hasCards && (
          <div className="col-span-10 md:col-span-8 col-start-2 md:col-start-3 mt-8">
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
