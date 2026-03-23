"use client";
import React, { useState, useEffect } from "react";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import Badgemodule from "@/components/ui/Badgemodule";
import ScrollHighlight from "../../ui/ScrollHighlight";
import ArrowBig from "@/components/ui/arrowBig";
import CtaMiniComponent from "../Fragments/pg-CtaMiniComponent";
import { TracingBeam } from "@/components/ui/tracing-beam";
import type {
  GalleryScrollHighlightStep,
  CloudinaryAsset,
} from "@/types/sanity.types";
import { assetUrl, resolveLinkAsync } from "@/utils/utils";
import { useParams } from "next/navigation";

type RawItem =
  | string
  | {
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
  const [ctaUrl, setCtaUrl] = useState<string>("#");

  const mediaUrl = assetUrl(step.backgroundVideo);
  const isImage = mediaUrl
    ? /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(mediaUrl)
    : false;

  const rawItems = pickItems(step);
  const items = rawItems
    .map((it) => {
      if (typeof it === "string") {
        return { name: it, text: "" };
      }
      // Handle Services references
      if (it?._type === "services") {
        const url = assetUrl((it.serviceBackground as any)?.asset);
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
      className="z-12 mx-auto mt-8 min-h-[60vh] relative font-aspekta"
    >
      {mediaUrl && (
        <HeaderImageVideoComp2
          useVideo={!isImage}
          videoSrc={isImage ? undefined : mediaUrl}
          imageSrc={isImage ? mediaUrl : undefined}
          enableParallax={true}
          opacity={0.6}
        />
      )}

      <div className="relative z-10 container mx-auto px-4 sm:px-6  lg:px-8">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pt-16 pb-16">
          {/* Left column: sticky badge + controls */}
          <div className="hidden md:flex md:col-span-2 md:mb-0 md:sticky md:top-24 self-start flex-col gap-4 iphone-landscape:!hidden">
            {step.badge && (
              <Badgemodule
                text={step.badge.text ?? ""}
                subtitle={step.badge.subtitle ?? ""}
                numberEl={step.badge.numberEl ?? ""}
                variant="glass"
                size="md"
              />
            )}

            {showCta && (
              <div className="hidden md:block mt-8">
                <ArrowBig
                  animate={true}
                  size={48}
                  color="white"
                  className="mb-4 fill-white text-white iphone-landscape:hidden"
                />
                <CtaMiniComponent
                  {...({
                    className: "text-white iphone-landscape:max-w-1/3",
                    heading: cta?.heading,
                    paragraph: cta?.paragraph,
                    buttonText: cta?.buttonText,
                    buttonVariant: cta?.variant ?? cta?.buttonVariant,
                    url: ctaUrl,
                    align: cta?.alignment,
                  } as any)}
                />
              </div>
            )}
          </div>

          {/* Right column: scroll highlight content */}
          <div className="col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 md:col-span-9 md:col-start-4">
            <TracingBeam className="">
              {items.length > 0 && <ScrollHighlight items={items} />}
            </TracingBeam>
          </div>

          {/* Mobile CTA - shown at bottom on mobile */}
          {showCta && (
            <div className="col-span-4 sm:col-span-6 md:hidden iphone-landscape:!block iphone-landscape:col-span-12 mt-8">
              <div className="flex flex-col border-t  border-white pt-8 items-start gap-4">

                <CtaMiniComponent
                  {...({
                    className: "font-regular text-white  line-height-normal",
                    heading: cta?.paragraph,

                    buttonText: cta?.buttonText,
                    buttonVariant: cta?.variant ?? cta?.buttonVariant,
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
