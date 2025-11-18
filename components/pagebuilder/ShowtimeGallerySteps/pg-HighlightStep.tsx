"use client";
import React, { useState, useEffect } from "react";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import Badgemodule from "@/components/ui/Badgemodule";
import ScrollHighlight from "../../ui/ScrollHighlight";
import ArrowBig from "@/components/ui/arrowBig";
import CtaMiniComponent from "../Fragments/pg-CtaMiniComponent";
import type {
  GalleryScrollHighlightStep,
  CloudinaryAsset,
} from "@/types/sanity.types";
import { assetUrl, resolveLinkAsync } from "@/utils/utils";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [ctaUrl, setCtaUrl] = useState<string>("#");

  const video = assetUrl(step.backgroundVideo);

  const rawItems = pickItems(step);
  const items = rawItems
    .map((it) =>
      typeof it === "string"
        ? { name: it, text: "" }
        : { name: it?.name || "", text: it?.text || "" }
    )
    .filter((i) => i.name);

  // Generate section ID from badge text
  const sectionId = step.badge?.text
    ? step.badge.text
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "gallery-highlight";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = step.navPointName
    ? { "data-navpoint-name": step.navPointName }
    : {};

  const cta = (step as any).ctaMini ?? null;
  const showCta = !!(step as any).useCTAMini && !!cta;

  useEffect(() => {
    async function resolveCTALink() {
      if (showCta && cta?.link) {
        const baseUrl = await resolveLinkAsync(cta.link);
        const finalUrl =
          baseUrl &&
          baseUrl.startsWith("/") &&
          !baseUrl.startsWith(`/${locale}`)
            ? `/${locale}${baseUrl}`
            : baseUrl || "#";
        setCtaUrl(finalUrl);
      }
    }

    resolveCTALink();
  }, [showCta, cta?.link, locale]);

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="z-1 mx-auto mt-8 min-h-[60vh] relative font-aspekta"
    >
      {video && (
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc={video}
          enableParallax={true}
        />
      )}

      <div className="grid grid-cols-12 z-1 mx-auto relative container">
        <div className="z-1 grid col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12">
          {/* Left column: sticky badge + controls */}
          <div className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky md:top-0 top-0 flex flex-col">
            {step.badge && (
              <Badgemodule
                className={step.badge.colSpan || ""}
                text={step.badge.text ?? ""}
                subtitle={step.badge.subtitle ?? ""}
                numberEl={step.badge.numberEl ?? ""}
              />
            )}

            {showCta && (
              <>
                <ArrowBig
                  animate={true}
                  size={48}
                  color="white"
                  className="my-12 fill-white text-white"
                />
                <CtaMiniComponent
                  {...({
                    className: "w-1/2 text-white",
                    heading: cta?.heading,
                    paragraph: cta?.paragraph,
                    buttonText: cta?.buttonText,
                    buttonVariant: cta?.variant ?? cta?.buttonVariant,
                    url: ctaUrl,
                    align: cta?.alignment,
                  } as any)}
                />
              </>
            )}
          </div>

          {/* Right column: scroll highlight content */}
          <div className="col-span-9 col-start-2 mt-12 md:mt-0 md:col-start-3">
            {items.length > 0 && <ScrollHighlight items={items} />}
          </div>
        </div>
      </div>
    </section>
  );
}
