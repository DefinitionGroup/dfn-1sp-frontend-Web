"use client";

import React from "react";
import type { HeroShowtime as HeroShowtimeType } from "@/types/sanity.types";

import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Button2 from "../ui/Button2";

import { assetUrl, resolveLink, ctaToButtonProps } from "@/utils/utils";

export default function HeroShowtime({ data }: { data: HeroShowtimeType }) {
  const {
    useVideo = false,
    backgroundImage,
    backgroundVideo,
    heading = "Show Time",
    subheading = "Your subheading here",
    paragraphs = [],
    additionalContent = [],
    navPointName,
  } = (data || {}) as HeroShowtimeType;

  const imageUrl = assetUrl(backgroundImage) || "/hr.png";
  const videoUrl = assetUrl(backgroundVideo);

  // Generate section ID from heading or use a default
  const sectionId = heading
    ? heading
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "hero-section";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  return (
    <section
      id={sectionId}
      {...navPointDataAttr}
      className="grid grid-cols-12 z-1 mx-auto relative font-aspekta text-white"
    >
      {/* Background media wrapper */}
      <HeaderImageVideoComp2
        useVideo={!!useVideo && !!videoUrl}
        imageSrc={imageUrl}
        enableParallax={true}
        videoSrc={videoUrl}
      />

      <div className="z-1 grid col-span-12 py-24 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
        {/* Left column */}
        <div className="col-span-12 md:col-span-3 col-start-1">
          <StaggeredSlideUp
            className="flex flex-col items-start justify-start"
            delay={0.0}
            staggerDelay={0.1}
            duration={0.5}
            distance={80}
          >
            {heading ? (
              <h2 className="text-5xl md:text-7xl font-nyghtserif font-semibold tracking-tight leading-compress pb-8">
                {heading}
              </h2>
            ) : null}
            {subheading ? (
              <p className="text-xl text-gray-100  max-w-2xs mx-auto">
                {subheading}
              </p>
            ) : null}
          </StaggeredSlideUp>
        </div>

        {/* Right column */}
        <div className="col-span-12 md:col-span-9 md:col-start-4">
          {Array.isArray(paragraphs) &&
            paragraphs.length > 0 &&
            paragraphs.map((p, idx) => <p key={`para-${idx}`}>{p}</p>)}

          {Array.isArray(additionalContent) && additionalContent.length > 0 && (
            <div className="mt-8 flex flex-wrap items-start justify-start gap-4 md:gap-8">
              {additionalContent.map((cta: any, idx: number) => {
                const btn = ctaToButtonProps(cta);
                const href = resolveLink(cta?.link);
                const isExternal = /^https?:\/\//.test(href);

                return (
                  <Button2
                    key={`cta-${idx}`}
                    variant={btn.variant as any}
                    text={btn.text}
                    className="w-fit"
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
        </div>
      </div>
    </section>
  );
}
