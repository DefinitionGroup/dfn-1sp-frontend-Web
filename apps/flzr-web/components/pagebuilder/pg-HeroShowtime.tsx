"use client";

import React from "react";
import type { HeroShowtime as HeroShowtimeType } from "@1sp/sanity-types";

import HeaderImageVideoComp2 from "@flzr/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import Button2 from "@flzr/components/ui/Button2";
import MixedType from "@flzr/components/ui/MixedType";
import Eyebrow from "@flzr/components/ui/Eyebrow";

import { assetUrl, resolveLink, ctaToButtonProps } from "@1sp/utils/cloudinary";

function isVideoAsset(asset?: unknown, url?: string): boolean {
  const resourceType =
    typeof asset === "object" && asset !== null && "resource_type" in asset
      ? String((asset as { resource_type?: string }).resource_type)
      : "";

  return resourceType === "video" || /\.(mp4|webm|mov)(?:$|\?)/i.test(url ?? "");
}

function HeroShowtime({ data }: { data: HeroShowtimeType }) {
  const {
    useVideo = false,
    backgroundImage,
    backgroundVideo,
    heading = "Show Time",
    headingTag = "h2",
    subheading = "Your subheading here",
    paragraphs = [],
    additionalContent = [],
    fullWidth = false,
    navPointName,
    hideFromNav = false,
  } = (data || {}) as HeroShowtimeType & { hideFromNav?: boolean };

  const backgroundImageUrl = assetUrl(backgroundImage);
  const backgroundImageIsVideo = isVideoAsset(backgroundImage, backgroundImageUrl);
  const imageUrl = backgroundImageIsVideo ? "/hr.png" : backgroundImageUrl || "/hr.png";
  const videoUrl = assetUrl(backgroundVideo) || (backgroundImageIsVideo ? backgroundImageUrl : undefined);
  const shouldUseVideo = Boolean((useVideo || backgroundImageIsVideo) && videoUrl);
  const HeadingTag = headingTag === "h1" ? "h1" : "h2";

  // Generate section ID from heading or use a default
  const sectionId = heading
    ? heading
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "hero-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className={`${
        fullWidth ? "w-full max-w-none" : "container mx-auto"
      } grid grid-cols-12 z-1 min-h-[85vh] relative font-aspekta text-white`}
    >
      {/* Background media wrapper */}
      <HeaderImageVideoComp2
        useVideo={shouldUseVideo}
        imageSrc={imageUrl}
        enableParallax={true}
        videoSrc={videoUrl}
      />

      {/* Single stacked column — eyebrow, headline, paragraphs, CTA.
          Content sits on a frosted glass panel matching the navbar
          (backdrop-blur + rgba(111,111,111,0.4)). */}
      <div className="z-1 col-span-12 col-start-1 row-start-1 flex w-full container mx-auto flex-col justify-end items-start px-4 py-section sm:px-6 lg:px-8">
        <StaggeredSlideUp
          className="flex w-fit max-w-full flex-col items-start rounded-[2.5rem] bg-[rgba(111,111,111,0.4)] backdrop-blur-md px-6 py-8 md:px-12 md:py-12"
          delay={0.5}
          staggerDelay={0.15}
          duration={0.75}
          distance={40}
        >
          {subheading ? (
            <Eyebrow className="pb-4 text-white/80">{subheading}</Eyebrow>
          ) : null}
          {heading ? (
            <HeadingTag className="text-display iphone-landscape:!text-4xl font-aspekta pb-2 text-white">
              <MixedType text={heading} />
            </HeadingTag>
          ) : null}

          {Array.isArray(paragraphs) && paragraphs.length > 0 && (
            <div className="mt-8 flex flex-col max-w-[38em]">
              {paragraphs.map((p, idx) => (
                <p className="mb-4 text-lg" key={`para-${idx}`}>
                  {p}
                </p>
              ))}
            </div>
          )}

          {Array.isArray(additionalContent) && additionalContent.length > 0 && (
            <div className="mt-6 flex flex-wrap items-start justify-start gap-4">
              {additionalContent.map((cta: any, idx: number) => {
                const btn = ctaToButtonProps(cta);
                const href = resolveLink(cta?.link);
                const isExternal = /^https?:\/\//.test(href);

                return (
                  <Button2
                    key={`cta-${idx}`}
                    variant={btn.variant as any}
                    text={btn.text}
                    className="w-fit min-w-[140px]"
                    href={href}
                    aria-label={btn.text || "CTA"}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  />
                );
              })}
            </div>
          )}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}

export default HeroShowtime;
