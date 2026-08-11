"use client";

import React from "react";
import type { HeroShowtime as HeroShowtimeType } from "@1sp/sanity-types";

import HeaderImageVideoComp2 from "@msm/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import StaggeredSlideUp from "@msm/components/ui/StaggeredSlideUp";
import Button2 from "@msm/components/ui/Button2";
import MixedType from "@msm/components/ui/MixedType";

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
      className="grid grid-cols-12 z-1 mx-auto min-h-[85vh] relative font-aspekta text-white"
    >
      {/* Background media wrapper */}
      <HeaderImageVideoComp2
        useVideo={shouldUseVideo}
        imageSrc={imageUrl}
        enableParallax={true}
        videoSrc={videoUrl}
      />

      <div className="z-1 grid col-span-12 py-section gap-responsive  col-start-1 container-responsive row-start-1 grid-cols-12">
        {/* Left column */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5  col-start-1 flex flex-col px-4 md:px-8 justify-center  ">
          <StaggeredSlideUp
            className="flex flex-col items-start  justify-center"
            delay={0.5}
            staggerDelay={0.2}
            duration={0.75}
            distance={80}
          >
            {heading ? (
              <HeadingTag className="text-4xl md:text-6xl iphone-landscape:!text-4xl font-aspekta leading-none pb-2">
                <MixedType text={heading} />
              </HeadingTag>
            ) : null}
            {subheading ? (
              <p className="text-xl iphone-landscape:!text-base text-gray-100  max-w-sm mx-auto">
                {subheading}
              </p>
            ) : null}
          </StaggeredSlideUp>
        </div>

        {/* [TODO] Right column */}
        <div className="col-span-12 md:col-span-7  md:col-start-6 flex flex-col items-start  justify-center">
          {Array.isArray(paragraphs) &&
            paragraphs.length > 0 &&
            paragraphs.map((p, idx) => <p className="mb-4 text-lg" key={`para-${idx}`}>{p}</p>)}

          {ctaButtons.length > 0 && (
            <div className="mt-8 flex flex-wrap min-w-[140px] items-start justify-start gap-4 md:gap-8">
              {ctaButtons.map((btn, idx) => {
                const isExternal = /^https?:\/\//.test(btn.href);

                return (
                  <Button2
                    key={`cta-${idx}`}
                    variant={btn.variant as any}
                    text={btn.text}
                    className="w-fit min-w-[140px] text-sm"
                    href={btn.href}
                    aria-label={btn.text || "CTA"}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroShowtime;
