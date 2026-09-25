"use client";

import React from "react";
import HeroVideoComp from "@msm/components/pagebuilder/Fragments/HeroVideoComp";
import SelectionFrame from "@msm/components/ui/SelectionFrame";
import { assetUrl, resolveLink } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import Button2 from "@msm/components/ui/Button2";
import DecryptRotator, { decryptRevealMs } from "@msm/components/ui/DecryptRotator";
import FlickerWords, { flickerWordsMs } from "@msm/components/ui/FlickerWords";
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
  if (locale !== "en" && ctaHref && ctaHref.startsWith("/") && !ctaHref.startsWith(`/${locale}`)) {
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
  const editorialHeadline = step.headlineMode === "headlineReveal" ? step.headline : undefined;
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

  // Hero intro timeline: the headline flickers in word by word, then the
  // eyebrow decrypts, then the selection frame's crosses flicker away.
  const FRAME_DELAY_MS = 250;
  const EYEBROW_GAP_MS = 200;
  const headlineMs = editorialHeadline
    ? flickerWordsMs(editorialHeadline)
    : decryptRevealMs(words[0] ?? "");
  const eyebrowDelayMs = headlineMs + EYEBROW_GAP_MS;

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
  const paragraphWidthClass = editorialHeadline ? "max-w-[68ch]" : "max-w-[48ch]";

  const portableTextComponents = {
    block: {
      normal: ({ children }: { children?: React.ReactNode }) => (
        <p className={`text-neutral-50 ${paragraphSizeClass} ${paragraphWidthClass}`}>
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
              <p className={`text-neutral-500 ${paragraphSizeClass} ${paragraphWidthClass}`}>
                {highlighted}
              </p>
            );
          }
          return (
            <p className={`text-neutral-500 ${paragraphSizeClass} ${paragraphWidthClass}`}>
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
      className={editorialHeadline ? "relative min-h-[95svh] overflow-hidden z-1" : "relative min-h-[80vh] h-[95vh] iphone-landscape:!h-dvh overflow-hidden z-1"}
    >
      {!editorialHeadline && <h1 className="sr-only">{seoTitle || "MSM.digital — Gaming, tech and consumer electronics marketing"}</h1>}

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
      <div className={editorialHeadline ? "relative z-10 container mx-auto flex min-h-[95svh] items-center px-6 md:px-10 py-28 md:py-24" : "absolute inset-x-0 bottom-20 md:bottom-12 iphone-landscape:bottom-0 z-10 max-w-9xl container mx-auto px-6 md:px-10 py-5"}>
        <SelectionFrame
          className={editorialHeadline ? "w-full max-w-6xl" : "inline-block max-w-full"}
          contentClassName="p-6 md:p-8 space-y-1"
          delay={FRAME_DELAY_MS}
          /* Once the copy has landed the borders flicker away; the crosses stay. */
          dismissFramesAfterMs={Math.max(480, eyebrowDelayMs + decryptRevealMs(eyebrow) + 300 - FRAME_DELAY_MS)}
        >
            <div className="pb-3 md:pb-4 flex items-center gap-4">
              <MsmLogoAnimated
                size={44}
                className="h-11 w-11"
              />
              {editorialHeadline && <span className="text-4xl md:text-6xl tracking-tight">MSM.digital</span>}
            </div>

            {/* The eyebrow decrypts only once the headline has finished flickering. */}
            {hasVisibleText(eyebrow) && (
              <DecryptRotator
                text={[eyebrow]}
                variant="headline"
                as="p"
                delayMs={eyebrowDelayMs}
                className="msm-headline text-msm-cyan text-xl md:text-2xl tracking-tight pb-3"
              />
            )}

            {/* Authored headlines flicker in word by word; the rotating words
                keep the signature decrypt effect. */}
            {editorialHeadline ? (
              <FlickerWords
                text={editorialHeadline}
                className="relative max-w-[40ch] whitespace-pre-line text-3xl md:text-5xl leading-tight pb-6"
              />
            ) : words.length > 0 && <DecryptRotator text={words} />}

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
