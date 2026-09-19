"use client";
import React from "react";
import cards from "@msm/components/ui/SelectionCards.module.css";
import { SelectionSequence } from "@msm/components/ui/SelectionFrame";
import ServiceCards from "@msm/components/ui/ServiceCards";
import Badgemodule from "@msm/components/ui/Badgemodule";
import CtaMiniComponent from "../Fragments/pg-CtaMiniComponent";
import type {
  GalleryScrollHighlightStep,
  CloudinaryAsset,
} from "@1sp/sanity-types";
import { assetUrl, withCacheKey } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import { getRenderableCtaMini } from "@1sp/utils/cta";

type RawItem =
  | string
  | {
    _updatedAt?: string;
    _type?: string;
    name?: string;
    text?: string;
    taglabel?: string;
    introText?: string;
    serviceBackground?: CloudinaryAsset;
  };

function pickItems(step: any): RawItem[] {
  const contentType = step?.scrollHighlightContent?.contentType;

  // Return items based on selected content type
  if (contentType === "services") {
    return step?.scrollHighlightContent?.serviceItems || [];
  } else {
    // Default to text items (including when contentType is 'text' or undefined)
    return step?.scrollHighlightContent?.textItems || [];
  }
}

export default function HighlightStep({
  step,
}: {
  step: GalleryScrollHighlightStep & { backgroundVideo?: CloudinaryAsset };
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const rawItems = pickItems(step);
  const items = rawItems
    .map((it) => {
      if (typeof it === "string") {
        return { name: it, text: "" };
      }
      // Handle Services references
      if (it?._type === "services") {
        const url = withCacheKey(
          assetUrl((it.serviceBackground as any)?.asset),
          it._updatedAt
        );
        const isVideo = url
          ? /\.(mp4|webm|mov|ogg)$/i.test(url) || url.includes("/video/")
          : false;
        return {
          name: it.name || it.taglabel || "",
          text: it.introText || "",
          image: isVideo ? undefined : url,
          video: isVideo ? url : undefined,
        };
      }
      // Handle slideUpText
      return {
        name: it?.name || "",
        text: it?.text || "",
      };
    })
    .filter((i) => i.name);

  const sectionId = "gallery-highlight";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  const badge = (step as any).badge ?? null;
  const cta = (step as any).useCTAMini
    ? getRenderableCtaMini((step as any).ctaMini)
    : null;
  const baseCtaUrl = cta?.href;
  const ctaUrl =
    baseCtaUrl &&
      baseCtaUrl.startsWith("/") &&
      !baseCtaUrl.startsWith(`/${locale}`)
      ? `/${locale}${baseCtaUrl}`
      : baseCtaUrl;
  const showCta = Boolean(cta && ctaUrl);

  return (
    <section id={sectionId} {...navPointDataAttr} className="relative bg-msm-paper text-msm-ink py-[var(--msm-section-space)]">
      <div className="container mx-auto px-[var(--container-padding)]">
        <SelectionSequence className={cards.sectionLayout}>
          <Badgemodule text={badge?.text || (locale === "de" ? "Was wir machen" : "What we do")} subtitle={badge?.subtitle || (locale === "de" ? "Unsere Services" : "Our services")} size="md" />
          <div className={cards.sectionContent}>
      <header className="mb-12 md:mb-16">
        <h2 className="headline-display">{step.highlightText || (locale === "de" ? "Was wir machen." : "What we do.")}</h2>
      </header>
      <ServiceCards items={items} />
      {showCta ? (
        <div className="mt-12 border-t border-white/15 pt-8">
          <CtaMiniComponent {...({ className: "text-neutral-200", heading: cta?.paragraph, buttonText: cta?.buttonText, buttonVariant: cta?.variant ?? "limesmall", url: ctaUrl, align: "left" } as any)} />
        </div>
      ) : null}
          </div>
        </SelectionSequence>
      </div>
    </section>
  );
}
