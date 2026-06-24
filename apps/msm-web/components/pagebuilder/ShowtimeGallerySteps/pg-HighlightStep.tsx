"use client";
import React from "react";
import ScrollHighlight from "@msm/components/ui/ScrollHighlight";
import ArrowBig from "@msm/components/ui/arrowBig";
import CtaMiniComponent from "../Fragments/pg-CtaMiniComponent";
import { TracingBeam } from "@msm/components/ui/tracing-beam";
import type {
  GalleryScrollHighlightStep,
  CloudinaryAsset,
} from "@1sp/sanity-types";
import { assetUrl, resolveLink, withCacheKey } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";

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

  const cta = (step as any).ctaMini ?? null;
  const showCta = !!(step as any).useCTAMini && !!cta;
  const baseCtaUrl = showCta && cta?.link ? resolveLink(cta.link) : undefined;
  const ctaUrl =
    baseCtaUrl &&
      baseCtaUrl.startsWith("/") &&
      !baseCtaUrl.startsWith(`/${locale}`)
      ? `/${locale}${baseCtaUrl}`
      : baseCtaUrl;

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="z-12 mx-auto mt-8 min-h-[60vh] relative bg-neutral-50 font-aspekta text-neutral-600"
    >
      <div className="relative z-10 container mx-auto px-4 sm:px-6  lg:px-8">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pt-16 pb-16">

          <div className={`col-span-1 sm:col-span-2  not-first: iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 ${showCta ? "md:col-span-9" : "md:col-span-12"}`}>
            <TracingBeam className="">
              {items.length > 0 && <ScrollHighlight items={items} />}
            </TracingBeam>
          </div>

          {/* Mobile CTA - shown at bottom on mobile */}
          {showCta && (
            <div className="col-span-4 sm:col-span-6 md:hidden iphone-landscape:!block iphone-landscape:col-span-12 mt-8">
              <div className="flex flex-col border-t border-neutral-600 pt-8 items-start gap-4">

                <CtaMiniComponent
                  {...({
                    className: "font-regular text-neutral-600 line-height-normal",
                    heading: cta?.paragraph,

                    buttonText: cta?.buttonText,
                    buttonVariant: cta?.variant ?? cta?.buttonVariant ?? "limesmall",
                    url: ctaUrl,
                    align: "center",
                  } as any)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
