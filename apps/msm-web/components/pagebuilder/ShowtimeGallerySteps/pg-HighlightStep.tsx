"use client";
import React from "react";
import StickyCardStack from "@msm/components/ui/StickyCardStack";
import ArrowBig from "@msm/components/ui/arrowBig";
import Badgemodule from "@msm/components/ui/Badgemodule";
import CornerMarkers from "@msm/components/ui/CornerMarkers";
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
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="z-12 mx-auto mt-8 min-h-[60vh] relative bg-msm-paper font-aspekta text-neutral-50"
    >
      <div className="relative z-10 container mx-auto px-[var(--container-padding)]">
        {/* System pattern: corner markers frame the step (services zone → cyan) */}
        <CornerMarkers className="text-msm-cyan/40 text-xs" inset="0.5rem" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pt-16 pb-16">

          {/* Left column: sticky badge + desktop CTA */}
          {(badge || showCta) && (
            <div className="hidden md:flex md:col-span-3 md:mb-0 md:sticky md:top-24 self-start flex-col gap-4 iphone-landscape:!hidden">
              {badge && (
                <Badgemodule
                  text={badge.text ?? ""}
                  subtitle={badge.subtitle ?? ""}
                  numberEl={badge.numberEl ?? ""}
                  size="md"
                />
              )}
              {showCta && (
                <div className="mt-8">
                  <ArrowBig
                    animate={true}
                    size={48}
                    color="white"
                    className="mb-4 fill-white text-white iphone-landscape:hidden"
                  />
                  <CtaMiniComponent
                    {...({
                      className: "font-regular text-neutral-200 line-height-normal",
                      heading: cta?.paragraph,
                      buttonText: cta?.buttonText,
                      buttonVariant: cta?.variant ?? "limesmall",
                      url: ctaUrl,
                      align: "left",
                    } as any)}
                  />
                </div>
              )}
            </div>
          )}

          <div className={`col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 ${badge || showCta ? "md:col-span-9" : "md:col-span-12"}`}>
            <StickyCardStack items={items} />
          </div>

          {/* Mobile CTA - shown at bottom on mobile */}
          {showCta && (
            <div className="col-span-4 sm:col-span-6 md:hidden iphone-landscape:!block iphone-landscape:col-span-12 mt-8">
              <div className="flex flex-col border-t border-white/20 pt-8 items-start gap-4">

                <CtaMiniComponent
                  {...({
                    className: "font-regular text-neutral-200 line-height-normal",
                    heading: cta?.paragraph,

                    buttonText: cta?.buttonText,
                    buttonVariant: cta?.variant ?? "limesmall",
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
