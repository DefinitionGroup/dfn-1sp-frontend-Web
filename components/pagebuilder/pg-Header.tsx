"use client";

import React from "react";
import HeroVideoComp from "@/components/pagebuilder/Fragments/HeroVideoComp";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { assetUrl } from "@/utils/utils";
import TypewriterRotator from "../ui/TypewriterRotator";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type {
  OneSPHeader,
  CloudinaryAsset,
} from "@/types/sanity.types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SMALL_TOUCH_LANDSCAPE_MEDIA_QUERY } from "@/lib/responsive";
import { hasVisibleText } from "@/lib/text-content";

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
      <span className="bg-gradient-to-r from-lime-300 to-lime-500 bg-clip-text text-transparent font-bold">
        {matched}
      </span>
      {after}
    </>
  );
}

/** --- component --- */
function OneSPHeaderStep({ step }: { step: OneSPHeader }) {
  const isIphoneLandscape = useIphoneLandscape();
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
        <p className={`text-neutral-50 ${paragraphSizeClass} iphone-landscape:max-w-[66.6667%] lg:max-w-[50%]`}>
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
              <p className={`text-neutral-500 ${paragraphSizeClass} iphone-landscape:max-w-1/2  lg:max-w-1/2`}>
                {highlighted}
              </p>
            );
          }
          return (
            <p className={`text-neutral-500 ${paragraphSizeClass} iphone-landscape:max-w-1/2  lg:max-w-1/2`}>
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
      {seoTitle && <h1 className="sr-only">{seoTitle}</h1>}

      {/* Background media */}
      {mediaUrl && (
        <HeroVideoComp
          useVideo={useVideo}
          videoSrc={useVideo ? mediaUrl : undefined}
          imageSrc={!useVideo ? mediaUrl : undefined}
        />
      )}

      {/* Foreground content */}
      <div className="absolute bottom-24 md:bottom-24 iphone-landscape:bottom-0 md:relative z-10  max-w-9xl container md:mt-[50vh] iphone-landscape:mt-[50vh] mx-auto">
        <StaggeredSlideUp
          className="px-4 md:px-4 space-y-1 container mx-auto  "
          delay={1}
          staggerDelay={0.08}
          duration={0.5}
          distance={20}
          easing="spring"
          rootMargin="0px 0px -20px 0px"
          once={true}
          animateImmediately={true}
        >
          {hasVisibleText(eyebrow) && (
            <h3 className="text-neutral-50 uppercase  text-xs iphone-landscape:text-xxs border-b pb-1 border-white/50 font-medium max-w-1/4">
              {eyebrow}
            </h3>
          )}

          {/* Typewriter words */}
          {words.length > 0 && <TypewriterRotator text={words} />}

          {/* Desktop paragraphs (rich text) */}
          {paragraphs.length > 0 && (
            <div className="hidden md:block iphone-landscape:!hidden space-y-4 text-neutral-50 ">
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
        </StaggeredSlideUp>
      </div>

      {/* Corner labels */}
      {leftMark && (
        <div className="absolute bottom-[28px] left-[14px] text-white text-[7px] font-bold -rotate-90 origin-bottom-left">
          {leftMark}
        </div>
      )}
      {rightMark && (
        <div className="absolute bottom-[28px] right-[12px] text-white text-[7px] text-eyebrow font-bold">
          {rightMark}
        </div>
      )}
    </section>
  );
}

export default OneSPHeaderStep;
