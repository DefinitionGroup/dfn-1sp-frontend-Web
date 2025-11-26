"use client";

import React from "react";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { assetUrl } from "@/utils/utils";
import TypewriterRotator from "../ui/TypewriterRotator";
import type {
  OneSPHeader,
  CloudinaryAsset,
  ParagraphLine,
  FontSize,
} from "@/types/sanity.types";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

/** --- helpers --- */
function isVideoUrl(url?: string) {
  return !!url && (/\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url));
}

const sizeToClass: Record<FontSize | string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

function pickFontSize(fs?: ParagraphLine["fontSize"]): FontSize {
  if (!fs) return "base";
  if (typeof fs === "string") return fs as FontSize;
  return (fs.size as FontSize) || "base";
}

function highlightInline(text: string, highlight?: string) {
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
  const mediaUrl = assetUrl(step.media as CloudinaryAsset | undefined);
  const useVideo = isVideoUrl(mediaUrl);

  const eyebrow = step.eyebrow ?? "Welcome at 1SP";
  const words = Array.isArray(step.rotatingText) ? step.rotatingText : [];
  const lines = Array.isArray(step.paragraphs) ? step.paragraphs : [];
  const highlight = step.highlight;
  const navPointName = step.navPointName;

  const leftMark = step.cornerLeftText ?? "SUPER*";
  const rightMark = step.cornerRightText ?? "/ 1SP";

  // Generate section ID from eyebrow or default
  const sectionId = eyebrow
    ? eyebrow
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "header-section";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};
  const anyContainsHighlight =
    !!highlight &&
    lines.some((ln) => {
      const t = typeof ln === "string" ? ln : ln?.text || "";
      const normalizedHighlight = highlight
        .trim()
        .replace(/^[^\w]+|[^\w]+$/g, "");
      if (!normalizedHighlight) return false;
      return t.toLowerCase().includes(normalizedHighlight.toLowerCase());
    });

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="relative h-screen md:h-[90vh] overflow-hidden"
    >
      {/* Background media */}
      {mediaUrl && (
        <HeaderImageVideoComp2
          useVideo={useVideo}
          videoSrc={useVideo ? mediaUrl : undefined}
          imageSrc={!useVideo ? mediaUrl : undefined}
          enableParallax={!!step.enableParallax}
        />
      )}

      {/* Foreground content */}
      <div className="absolute bottom-24 md:relative z-10 container md:mt-[45vh] mx-auto">
        <StaggeredSlideUp className="px-12 md:px-4  space-y-6 max-w-full">
          {eyebrow && (
            <h1 className="text-neutral-50 uppercase pb-2 text-xs border-b font-bold max-w-3/4">
              {eyebrow}
            </h1>
          )}

          {/* Typewriter words */}
          {words.length > 0 && <TypewriterRotator text={words} />}

          {/* Paragraph lines with optional highlight + sizes */}
          {lines.map((ln, i) => {
            const text = typeof ln === "string" ? ln : ln?.text || "";
            const size =
              typeof ln === "string"
                ? i === 0
                  ? "lg"
                  : "base"
                : pickFontSize(ln?.fontSize);

            // If no paragraph contains the highlight, append it to the last paragraph
            if (!anyContainsHighlight && highlight && i === lines.length - 1) {
              const highlightText = highlight.trim();
              return (
                <p
                  key={`p-${i}`}
                  className={[
                    "text-neutral-50 pt-2",
                    sizeToClass[size] || "text-base",
                    i === 0 ? "max-w-2/3" : "",
                  ].join(" ")}
                >
                  {text}{" "}
                  <span className="bg-gradient-to-r from-lime-300 to-lime-500 bg-clip-text text-transparent font-bold">
                    {highlightText}
                  </span>
                </p>
              );
            }

            return (
              <p
                key={`p-${i}`}
                className={[
                  "text-neutral-50",
                  sizeToClass[size] || "text-base",
                  i === 0 ? "max-w-3/4 md:max-w-1/3" : "",
                ].join(" ")}
              >
                {highlightInline(text, highlight)}
              </p>
            );
          })}
        </StaggeredSlideUp>
      </div>

      {/* Corner labels */}
      {leftMark && (
        <div className="absolute bottom-[22px] left-[24px] text-white text-xxs font-bold -rotate-90 origin-bottom-left">
          {leftMark}
        </div>
      )}
      {rightMark && (
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-bold">
          {rightMark}
        </div>
      )}
    </section>
  );
}

export default withDebugBadge(OneSPHeaderStep, "pg-Header");
