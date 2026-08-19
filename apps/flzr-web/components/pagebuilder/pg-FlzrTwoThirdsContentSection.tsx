"use client";

import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type {
  CloudinaryAsset,
  FlzrTwoThirdsContentSection as FlzrTwoThirdsContentSectionData,
} from "@1sp/sanity-types";
import {
  assetUrl,
  cloudinaryPosterUrl,
  ctaToButtonProps,
  isVideoAsset,
  optimizedImageUrl,
} from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";
import { motion, useReducedMotion } from "motion/react";
import Button2 from "@flzr/components/ui/Button2";

const EASE_FLZR = [0.62, 0.05, 0.01, 0.99] as const;

type MediaAsset = CloudinaryAsset & {
  format?: string;
  resource_type?: string;
};

type Props = {
  data: FlzrTwoThirdsContentSectionData;
  inheritSectionSurface?: boolean;
};

export default function FlzrTwoThirdsContentSection({
  data,
  inheritSectionSurface = false,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const {
    headline,
    subheadline,
    body = [],
    image,
    imageAlt = "",
    cta,
    navPointName,
    hideFromNav = false,
  } = data || {};

  if (!hasVisibleText(headline) || !hasVisibleText(subheadline) || body.length === 0) {
    return null;
  }

  const media = image as MediaAsset | undefined;
  const sourceUrl = assetUrl(media);
  const imageUrl = isVideoAsset(media, sourceUrl)
    ? cloudinaryPosterUrl(sourceUrl, {
        aspectRatio: "4:5",
        frame: "auto",
        maxWidth: 800,
        quality: "auto",
      })
    : optimizedImageUrl(sourceUrl, {
        crop: "fill",
        gravity: "auto",
        height: 1000,
        quality: "auto",
        width: 800,
      });
  const button = ctaToButtonProps(cta);
  const sectionId = headline
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const shellClass = inheritSectionSurface
    ? "w-full"
    : "mx-auto w-full max-w-[1480px] px-4 py-16 sm:px-6 lg:px-8";

  const textVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: EASE_FLZR,
      },
    },
  };

  const mediaVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1, clipPath: "inset(0 0 0% 0 round 1rem)" }
      : { opacity: 0, clipPath: "inset(0 0 14% 0 round 1rem)" },
    visible: {
      opacity: 1,
      clipPath: "inset(0 0 0% 0 round 1rem)",
      transition: {
        duration: prefersReducedMotion ? 0 : 1,
        delay: prefersReducedMotion ? 0 : 0.12,
        ease: EASE_FLZR,
      },
    },
  };

  return (
    <section
      id={sectionId || "flzr-two-thirds-content"}
      data-component="flzr-two-thirds-content-section"
      {...(navPointName ? { "data-navpoint-name": navPointName } : {})}
      {...(hideFromNav ? { "data-nav-hidden": "true" } : {})}
      className={`relative font-flzr ${shellClass}`}
    >
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3 lg:gap-12 xl:gap-16">
        <motion.div
          className="flex flex-col items-start lg:col-span-2"
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ amount: 0.2, once: true }}
          transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.11 }}
        >
          <motion.h2
            className="text-balance text-section-title text-flzr-violet"
            variants={textVariants}
          >
            {headline}
          </motion.h2>

          <motion.p
            className="mt-8 whitespace-pre-line text-[30px] leading-[1.15] text-neutral-600 sm:text-[36px]"
            variants={textVariants}
          >
            {subheadline}
          </motion.p>

          <motion.div
            className="mt-8"
            variants={textVariants}
          >
            <PortableText
              value={body as PortableTextBlock[]}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="mb-5 text-[22px] leading-[1.4] text-neutral-600 last:mb-0">
                      {children}
                    </p>
                  ),
                },
                marks: {
                  strong: ({ children }) => (
                    <strong className="font-semibold text-neutral-900">{children}</strong>
                  ),
                  em: ({ children }) => <em>{children}</em>,
                },
              }}
            />
          </motion.div>

          {button ? (
            <motion.div className="mt-10" variants={textVariants}>
              <Button2
                href={button.href}
                text={button.text}
                variant={(button.variant as any) || "violet"}
              />
            </motion.div>
          ) : null}
        </motion.div>

        {imageUrl ? (
          <motion.figure
            className="w-full lg:col-span-1"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ amount: 0.2, once: true }}
            variants={mediaVariants}
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
                decoding="async"
                loading="lazy"
              />
            </div>
          </motion.figure>
        ) : null}
      </div>
    </section>
  );
}
