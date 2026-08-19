"use client";

import React, { useRef } from "react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
import { assetUrl, optimizedVideoUrl } from "@1sp/utils/cloudinary";
import type { CloudinaryAsset } from "@1sp/sanity-types";
import { hasVisibleNode, hasVisibleText } from "@1sp/utils/text-content";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const EASE_FLZR = [0.62, 0.05, 0.01, 0.99] as const;
const MEDIA_REVEAL_DURATION = 1.15;
const TYPE_START_DELAY = 0.4;
const TYPE_REVEAL_DURATION = 0.85;
const WORD_STAGGER = 0.09;
const DIVIDER_START_DELAY = 0.82;
const BODY_START_DELAY = 0.96;
const BODY_STAGGER = 0.13;

type TwoColContentSectionData = {
  title?: string;
  showTitle?: boolean;
  titleColor?: "neutral-700" | "neutral-400" | "white";
  content?: PortableTextBlock[];
  contentSize?: string;
  useVideo?: boolean;
  image?: CloudinaryAsset;
  video?: CloudinaryAsset;
  mediaAlt?: string;
  reverseColumns?: boolean;
  backgroundColor?: "white" | "neutral-100" | "neutral-400" | "neutral-700" | "black";
  paddingY?: string;
  navPointName?: string;
  hideFromNav?: boolean;
};

function isVideoUrl(url?: string) {
  return !!url && (/\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url));
}

function AnimatedSectionTitle({ title }: { title: string }) {
  const prefersReducedMotion = useReducedMotion();
  const words = title.trim().split(/\s+/);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : TYPE_START_DELAY,
        staggerChildren: prefersReducedMotion ? 0 : WORD_STAGGER,
      },
    },
  };
  const wordVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 0, transform: "translateY(105%)" },
    visible: {
      opacity: 1,
      transform: "translateY(0%)",
      transition: {
        duration: prefersReducedMotion ? 0 : TYPE_REVEAL_DURATION,
        ease: EASE_FLZR,
      },
    },
  };

  return (
    <div>
      <motion.h2
        aria-label={title}
        className="max-w-[11ch] text-balance font-flzr text-display font-bold italic leading-[0.92] text-flzr-violet"
        variants={containerVariants}
      >
        {words.map((word, index) => (
          <React.Fragment key={`${word}-${index}`}>
            <span
              aria-hidden="true"
              className="-mr-[0.18em] inline-block overflow-hidden pb-[0.12em] pr-[0.18em] align-bottom"
            >
              <motion.span
                className="inline-block"
                variants={wordVariants}
                style={{
                  willChange: prefersReducedMotion
                    ? "auto"
                    : "transform, opacity",
                }}
              >
                {word}
              </motion.span>
            </span>
            {index < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </motion.h2>
      <motion.span
        aria-hidden="true"
        className="mt-6 block h-[5px] w-16 origin-left rounded-full bg-flzr-violet md:mt-8"
        variants={{
          hidden: prefersReducedMotion
            ? { opacity: 1, scaleX: 1 }
            : { opacity: 0, scaleX: 0 },
          visible: {
            opacity: 1,
            scaleX: 1,
            transition: {
              duration: prefersReducedMotion ? 0 : 1,
              delay: prefersReducedMotion ? 0 : DIVIDER_START_DELAY,
              ease: EASE_FLZR,
            },
          },
        }}
      />
    </div>
  );
}

function TwoColContentSection({
  data,
  inheritSectionSurface = false,
}: {
  data: TwoColContentSectionData;
  inheritSectionSurface?: boolean;
}) {
  const {
    title,
    showTitle = false,
    content,
    contentSize = "lg",
    useVideo = false,
    image,
    video,
    mediaAlt = "",
    reverseColumns = false,
    backgroundColor = "white",
    paddingY = "16",
    navPointName,
    hideFromNav = false,
  } = data || {};

  const prefersReducedMotion = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });
  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["-6%", "6%"],
  );

  if (!content || content.length === 0) return null;

  // Get media URL
  const mediaAsset = useVideo ? video : image;
  const mediaUrl = assetUrl(mediaAsset);
  const isVideo = useVideo || isVideoUrl(mediaUrl);

  // Generate section ID from title
  const sectionId = title
    ? title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "two-col-content-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  // Background color classes
  const bgColorMap: Record<string, string> = {
    white: "bg-white",
    "neutral-100": "bg-neutral-100",
    "neutral-400": "bg-neutral-400",
    "neutral-700": "bg-neutral-700",
    black: "bg-black",
  };

  // Text color based on background
  const textColorMap: Record<string, { primary: string; secondary: string }> = {
    white: { primary: "text-neutral-900", secondary: "text-neutral-700" },
    "neutral-100": { primary: "text-neutral-900", secondary: "text-neutral-700" },
    "neutral-400": { primary: "text-neutral-900", secondary: "text-neutral-800" },
    "neutral-700": { primary: "text-white", secondary: "text-neutral-200" },
    black: { primary: "text-white", secondary: "text-neutral-300" },
  };

  // Padding Y classes
  const paddingYMap: Record<string, string> = {
    "8": "py-8",
    "16": "py-16",
    "24": "py-24",
    "32": "py-32",
  };

  const bgClass = inheritSectionSurface
    ? "bg-transparent"
    : bgColorMap[backgroundColor] || "bg-white";
  const textColors = textColorMap[backgroundColor] || textColorMap.white;
  const paddingClass = paddingYMap[paddingY] || "py-16";

  const getContentClass = (size?: string) => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "base":
        return "text-base";
      case "lg":
        return "text-section-body";
      case "xl":
        return "text-section-lead";
      default:
        return "text-section-body";
    }
  };

  const contentContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: prefersReducedMotion ? 0 : BODY_START_DELAY,
        staggerChildren: prefersReducedMotion ? 0 : BODY_STAGGER,
      },
    },
  };
  const contentItemVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 0, transform: "translateY(22px)" },
    visible: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: {
        duration: prefersReducedMotion ? 0 : 0.82,
        ease: EASE_FLZR,
      },
    },
  };

  const mediaRevealVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1, clipPath: "inset(0 0 0% 0 round 2.5rem)" }
      : { opacity: 0, clipPath: "inset(0 0 16% 0 round 2.5rem)" },
    visible: {
      opacity: 1,
      clipPath: "inset(0 0 0% 0 round 2.5rem)",
      transition: {
        duration: prefersReducedMotion ? 0 : MEDIA_REVEAL_DURATION,
        ease: EASE_FLZR,
      },
    },
  };

  // Custom components for PortableText rendering
  const portableTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <motion.p
          className={`${getContentClass(contentSize)} ${textColors.secondary} mb-5 leading-[1.55] last:mb-0`}
          variants={contentItemVariants}
        >
          {children}
        </motion.p>
      ),
      h2: ({ children }: any) => (
        hasVisibleNode(children) ? (
          <motion.h2
            className="mb-4 mt-10 text-section-title text-flzr-violet"
            variants={contentItemVariants}
          >
            {children}
          </motion.h2>
        ) : null
      ),
      h3: ({ children }: any) => (
        hasVisibleNode(children) ? (
          <motion.h3
            className="mb-4 mt-10 text-title text-flzr-violet"
            variants={contentItemVariants}
          >
            {children}
          </motion.h3>
        ) : null
      ),
      h4: ({ children }: any) => (
        <motion.h4
          className="mb-3 mt-8 text-section-lead text-flzr-violet"
          variants={contentItemVariants}
        >
          {children}
        </motion.h4>
      ),
      h5: ({ children }: any) => (
        <motion.h5
          className="mb-2 mt-6 text-xl font-semibold text-flzr-violet"
          variants={contentItemVariants}
        >
          {children}
        </motion.h5>
      ),
      blockquote: ({ children }: any) => (
        <motion.blockquote
          className={`my-6 border-l border-flzr-violet pl-5 text-xl italic leading-snug ${textColors.secondary}`}
          variants={contentItemVariants}
        >
          {children}
        </motion.blockquote>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <motion.ul
          className={`${getContentClass(contentSize)} ${textColors.secondary} list-disc list-inside mb-4 space-y-2`}
          variants={contentItemVariants}
        >
          {children}
        </motion.ul>
      ),
      number: ({ children }: any) => (
        <motion.ol
          className={`${getContentClass(contentSize)} ${textColors.secondary} list-decimal list-inside mb-4 space-y-2`}
          variants={contentItemVariants}
        >
          {children}
        </motion.ol>
      ),
    },
    listItem: {
      bullet: ({ children }: any) => <li className="ml-4">{children}</li>,
      number: ({ children }: any) => <li className="ml-4">{children}</li>,
    },
    marks: {
      strong: ({ children }: any) => (
        <strong className={`font-bold ${textColors.primary}`}>{children}</strong>
      ),
      em: ({ children }: any) => <em className="italic">{children}</em>,
      code: ({ children }: any) => (
        <code className="bg-neutral-100 px-2 py-1  text-sm font-mono text-neutral-800">
          {children}
        </code>
      ),
      link: ({ value, children }: any) => {
        const target = value?.blank ? "_blank" : undefined;
        const rel = value?.blank ? "noopener noreferrer" : undefined;
        return (
          <Link
            href={value?.href}
            target={target}
            rel={rel}
            className="text-flzr-violet underline decoration-flzr-violet/40 underline-offset-4 transition-colors hover:text-violet-600"
          >
            {children}
          </Link>
        );
      },
    },
  };

  const contentOrderClass = reverseColumns
    ? "order-2 lg:order-1 lg:pr-10 xl:pr-16"
    : "order-1 lg:order-2 lg:pl-10 xl:pl-16";
  const mediaOrderClass = reverseColumns
    ? "order-1 lg:order-2"
    : "order-2 lg:order-1";

  return (
    <section
      id={sectionId}
      className={`relative overflow-hidden font-flzr ${bgClass}`}
      {...navPointDataAttr}
    >
      <div
        className={`relative mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 ${paddingClass}`}
      >
        <motion.div
          className="grid grid-cols-1 items-center gap-10 pt-10 md:gap-14 md:pt-14 lg:grid-cols-12 lg:gap-8 xl:gap-10"
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          <div
            className={`flex min-w-0 flex-col justify-center lg:col-span-5 ${contentOrderClass}`}
          >
            {showTitle && hasVisibleText(title) ? (
              <AnimatedSectionTitle title={title} />
            ) : null}
            <motion.div
              className={`${showTitle && hasVisibleText(title) ? "mt-8 md:mt-10" : ""} max-w-[68ch] text-pretty`}
              variants={contentContainerVariants}
            >
              <PortableText value={content} components={portableTextComponents} />
            </motion.div>
          </div>

          <motion.div
            ref={mediaRef}
            className={`relative min-w-0 lg:col-span-7 ${mediaOrderClass}`}
            variants={mediaRevealVariants}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-neutral-200 lg:aspect-[6/7] xl:aspect-[4/3]">
              {isVideo && mediaUrl ? (
                <motion.video
                  src={optimizedVideoUrl(mediaUrl, { maxWidth: 1280 })}
                  aria-label={mediaAlt || title || "Content video"}
                  className="absolute -top-[6%] left-0 h-[112%] w-full object-cover"
                  style={{
                    y: mediaY,
                    willChange: prefersReducedMotion ? "auto" : "transform",
                  }}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : mediaUrl ? (
                <motion.img
                  src={mediaUrl}
                  alt={mediaAlt || title || "Content image"}
                  className="absolute -top-[6%] left-0 h-[112%] w-full object-cover"
                  style={{
                    y: mediaY,
                    willChange: prefersReducedMotion ? "auto" : "transform",
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-neutral-500">No media</span>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/20"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default TwoColContentSection;
