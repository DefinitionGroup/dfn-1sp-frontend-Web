"use client";

import React from "react";
import type { HeroShowtime as HeroShowtimeType } from "@1sp/sanity-types";

import HeaderImageVideoComp2 from "@renaissance/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import Button2 from "@renaissance/components/ui/Button2";
import MixedType from "@renaissance/components/ui/MixedType";

import { assetUrl, ctaToButtonProps } from "@1sp/utils/cloudinary";

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
  const ctaButtons = (Array.isArray(additionalContent) ? additionalContent : [])
    .map((cta) => ctaToButtonProps(cta))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof ctaToButtonProps>>>;

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
      } relative z-1 min-h-[calc(100svh-5rem)] overflow-hidden bg-renaissance-ink font-renaissance text-white md:min-h-[calc(100svh-7rem)]`}
    >
      <HeaderImageVideoComp2
        useVideo={shouldUseVideo}
        imageSrc={imageUrl}
        imageAlt="A vivid game world with an airborne space explorer"
        enableParallax
        videoSrc={videoUrl}
        opacity={0.46}
        isHero
        className="!mt-0"
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[7%] z-[3] hidden w-[26%] -skew-x-[18deg] border-x border-white/18 bg-[linear-gradient(135deg,rgba(153,187,186,0.12),rgba(255,255,255,0.02))] lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute -right-[11%] top-[16%] z-[3] h-[42%] w-[44%] rotate-[8deg] bg-[linear-gradient(125deg,transparent,rgba(219,229,229,0.18),transparent)] blur-2xl"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1480px] flex-col justify-end px-5 pb-8 pt-28 sm:px-8 sm:pb-10 md:min-h-[calc(100svh-7rem)] lg:px-12 lg:pb-12">
        <div className="flex w-full animate-fade-in-up flex-col motion-reduce:animate-none">
          <div className="grid items-end gap-7 border-t border-white/35 pt-7 md:grid-cols-12 md:gap-10 md:pt-9">
            {heading ? (
              <HeadingTag className="renaissance-display whitespace-pre-line text-balance text-[clamp(2.55rem,6.2vw,6rem)] font-bold leading-[0.88] text-white md:col-span-8">
                <MixedType
                  text={heading}
                  serifClassName="font-renaissance italic text-renaissance-teal"
                />
              </HeadingTag>
            ) : null}

            <div className="flex flex-col items-start md:col-span-4 md:pb-1">
              {subheading ? (
                <p className="text-balance text-xl font-semibold leading-[1.12] text-white sm:text-2xl">
                  {subheading}
                </p>
              ) : null}

              {Array.isArray(paragraphs) && paragraphs.length > 0 ? (
                <div className="mt-4 flex max-w-[38em] flex-col text-white/74">
                  {paragraphs.map((paragraph, index) => (
                    <p className="mb-3 text-base leading-[1.45]" key={`para-${index}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}

              {ctaButtons.length > 0 ? (
                <div className="mt-5 flex flex-wrap items-start gap-3">
                  {ctaButtons.map((button, index) => {
                    const isExternal = /^(?:https?:|mailto:|tel:)/.test(button.href);

                    return (
                      <Button2
                        key={`cta-${index}`}
                        variant={button.variant as any}
                        text={button.text}
                        className="w-fit min-w-[140px]"
                        href={button.href}
                        aria-label={button.text || "CTA"}
                        {...(isExternal && /^https?:/.test(button.href)
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroShowtime;
