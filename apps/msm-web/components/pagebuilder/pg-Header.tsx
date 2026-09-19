"use client";

import React from "react";
import HeroVideoComp from "@msm/components/pagebuilder/Fragments/HeroVideoComp";
import SelectionFrame from "@msm/components/ui/SelectionFrame";
import { assetUrl, resolveLink } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import Button2 from "@msm/components/ui/Button2";
import DecryptRotator from "@msm/components/ui/DecryptRotator";
import CornerMarkers from "@msm/components/ui/CornerMarkers";
import MsmLogoAnimated from "@msm/components/ui/MsmLogoAnimated";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type {
  OneSPHeader,
  CloudinaryAsset,
} from "@1sp/sanity-types";
import { useMediaQuery } from "@1sp/utils/hooks/use-media-query";
import { SMALL_TOUCH_LANDSCAPE_MEDIA_QUERY } from "@1sp/utils/responsive";
import { hasVisibleText } from "@1sp/utils/text-content";

function useIphoneLandscape(): boolean {
  return useMediaQuery(SMALL_TOUCH_LANDSCAPE_MEDIA_QUERY);
}
/** --- helpers --- */
function isVideoUrl(url?: string) {
  return !!url && (/\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url));
}

function highlightInline(text: string, highlight?: string): React.ReactNode {
  if (!highlight || !text) return text;

  const normalized = highlight.trim().replace(/^[^\w]+|[^\w]+$/g, "");
  if (!normalized) return text;

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escapeRegex(normalized), "i");
  const match = text.match(re);
  if (!match) return text;

  const idx = match.index ?? 0;
  const before = text.slice(0, idx);
  const matched = text.slice(idx, idx + match[0].length);
  const after = text.slice(idx + match[0].length);

  return (
    <>
      {before}
      <span className="text-msm-cyan">
        {matched}
      </span>
      {after}
    </>
  );
}

/** --- component --- */
function OneSPHeaderStep({ step }: { step: OneSPHeader }) {
  const isIphoneLandscape = useIphoneLandscape();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Optional CTA below the hero copy (schema: oneSPHeader.cta)
  let ctaHref = step.cta?.link ? resolveLink(step.cta.link) : undefined;
  if (ctaHref && ctaHref.startsWith("/") && !ctaHref.startsWith(`/${locale}`)) {
    ctaHref = `/${locale}${ctaHref}`;
  }
  const ctaText = step.cta?.text;
  // Older imported homepage content points this project CTA to a legal page.
  if (ctaText?.trim().toLowerCase() === "start a project" && /\/legal\/?$/.test(ctaHref || "")) {
    ctaHref = locale === "en" ? "/contact" : `/${locale}/contact`;
  }
  const mediaUrl = assetUrl(step.media as CloudinaryAsset | undefined);
  const useVideo = isVideoUrl(mediaUrl);

  const eyebrow = step.eyebrow ?? "Welcome at 1SP";
  const seoTitle = step.seoTitle?.trim();
  const words = Array.isArray(step.rotatingText) ? step.rotatingText : [];
  const paragraphs = (step.paragraphs ?? []) as PortableTextBlock[];
  const mobileParagraphs = (step.mobileParagraphs ?? []) as PortableTextBlock[];
  const mobileParagraphsToRender =
    mobileParagraphs.length > 0 ? mobileParagraphs : paragraphs;
  const highlight = step.highlight;
  const navPointName = step.navPointName;
  const hideFromNav = (step as any).hideFromNav ?? false;

  const leftMark = step.cornerLeftText ?? "SUPER*";
  const rightMark = step.cornerRightText ?? "/ 1SP";

  // Generate section ID from eyebrow or default
  const sectionId = eyebrow
    ? eyebrow
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "header-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };
  const paragraphSizeClass = isIphoneLandscape ? "text-xs" : "text-base";

  const portableTextComponents = {
    block: {
      normal: ({ children }: { children?: React.ReactNode }) => (
        <p className={`text-neutral-50 ${paragraphSizeClass} max-w-[48ch]`}>
          {children}
        </p>
      ),
    },
    marks: {
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-bold">{children}</strong>
      ),
      em: ({ children }: { children?: React.ReactNode }) => (
        <em className="italic">{children}</em>
      ),
    },
  };

  const portableTextComponentsWithHighlight = highlight
    ? {
      ...portableTextComponents,
      block: {
        normal: ({ children, value }: { children?: React.ReactNode; value?: PortableTextBlock }) => {
          const plainText = value?.children
            ?.map((c: any) => c.text)
            .join("") ?? "";
          const highlighted = highlightInline(plainText, highlight);
          // If highlight matched, render the highlighted version
          if (highlighted !== plainText) {
            return (
              <p className={`text-neutral-500 ${paragraphSizeClass} max-w-[48ch]`}>
                {highlighted}
              </p>
            );
          }
          return (
            <p className={`text-neutral-500 ${paragraphSizeClass} max-w-[48ch]`}>
              {children}
            </p>
          );
        },
      },
    }
    : portableTextComponents;

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="relative min-h-[80vh] h-[95vh] iphone-landscape:!h-dvh  overflow-hidden z-1"
    >
      <h1 className="sr-only">{seoTitle || "MSM.digital — Gaming, tech and consumer electronics marketing"}</h1>

      {/* Blueprint corner markers (Vast grammar) */}
      <CornerMarkers
        inset="1.25rem"
        animateOnView
        animationDelay={0.12}
        stagger={0.15}
      />

      {/* Background media */}
      {mediaUrl && (
        <HeroVideoComp
          useVideo={useVideo}
          videoSrc={useVideo ? mediaUrl : undefined}
          imageSrc={!useVideo ? mediaUrl : undefined}
        />
      )}

      {/* Foreground content — white corner markers frame the
          eyebrow/headline/copy/CTA group. */}
      <div className="absolute inset-x-0 bottom-20 md:bottom-12 iphone-landscape:bottom-0 z-10 max-w-9xl container mx-auto px-6 md:px-10 py-5">
        <SelectionFrame
          className="inline-block max-w-full"
          contentClassName="p-6 md:p-8 space-y-1"
          delay={250}
        >
            <div className="pb-3 md:pb-4">
              <MsmLogoAnimated
                size={44}
                className="h-11 w-11"
              />
            </div>

            {hasVisibleText(eyebrow) && (
              <h3 className="text-msm-cyan text-xl md:text-2xl tracking-tight pb-3">
                {eyebrow}
              </h3>
            )}

            {/* Decrypt-style rotating words */}
            {words.length > 0 && <DecryptRotator text={words} />}

            {/* Desktop paragraphs (rich text) */}
            {paragraphs.length > 0 && (
              <div className="hidden md:block iphone-landscape:!hidden space-y-4 text-balance text-neutral-50 font-medium text-4xl ">
                <PortableText
                  value={paragraphs}
                  components={portableTextComponentsWithHighlight}
                />
              </div>
            )}

            {/* Mobile + iPhone landscape paragraphs (rich text) */}
            {mobileParagraphsToRender.length > 0 && (
              <div className="block md:hidden iphone-landscape:!block space-y-4 text-neutral-50 lg:max-w-3/4">
                <PortableText
                  value={mobileParagraphsToRender}
                  components={portableTextComponentsWithHighlight}
                />
              </div>
            )}

            {/* Optional CTA (mosaic button) */}
            {ctaHref && ctaText && (
              <div className="pt-6">
                <Button2 text={ctaText} href={ctaHref} />
              </div>
            )}
        </SelectionFrame>
      </div>

    </section>
  );
}

export default OneSPHeaderStep;
