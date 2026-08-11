"use client";

import React, { useRef } from "react";
import StaggeredFadeIn from "@renaissance/components/ui/StaggeredFadeIn";
import StaggeredSlideUp from "@renaissance/components/ui/StaggeredSlideUp";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
import { assetUrl, optimizedVideoUrl } from "@1sp/utils/cloudinary";
import type { CloudinaryAsset } from "@1sp/sanity-types";
import { hasVisibleNode, hasVisibleText } from "@1sp/utils/text-content";

import { motion, useScroll, useTransform } from "motion/react";

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

function TwoColContentSection({ data }: { data: TwoColContentSectionData }) {
  const {
    title,
    showTitle = false,
    titleColor = "neutral-700",
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

  const bgClass = bgColorMap[backgroundColor] || "bg-white";
  const textColors = textColorMap[backgroundColor] || textColorMap.white;
  const paddingClass = paddingYMap[paddingY] || "py-16";

  // Title color classes
  const titleColorMap: Record<string, string> = {
    "neutral-700": "text-neutral-700",
    "neutral-400": "text-neutral-400",
    white: "text-white",
  };
  const titleColorClass = titleColorMap[titleColor] || "text-neutral-700";

  const getContentClass = (size?: string) => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "base":
        return "text-base";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      default:
        return "text-lg";
    }
  };

  // Custom components for PortableText rendering
  const portableTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className={`${getContentClass(contentSize)} ${textColors.secondary} mb-4`}>
          {children}
        </p>
      ),
      h2: ({ children }: any) => (
        hasVisibleNode(children) ? (
          <h2 className={`text-4xl md:text-5xl font-semibold ${textColors.primary} mt-8 mb-4`}>
            {children}
          </h2>
        ) : null
      ),
      h3: ({ children }: any) => (
        hasVisibleNode(children) ? (
          <h3 className={`text-3xl md:text-4xl font-semibold ${textColors.primary} mt-8 mb-4`}>
            {children}
          </h3>
        ) : null
      ),
      h4: ({ children }: any) => (
        <h4 className={`text-2xl md:text-3xl font-semibold ${textColors.primary} mt-6 mb-3`}>
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5 className={`text-xl font-semibold ${textColors.primary} mt-4 mb-2`}>
          {children}
        </h5>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className={`border-l-4 border-neutral-300 pl-4 italic ${textColors.secondary} my-4`}>
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul
          className={`${getContentClass(contentSize)} ${textColors.secondary} list-disc list-inside mb-4 space-y-2`}
        >
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol
          className={`${getContentClass(contentSize)} ${textColors.secondary} list-decimal list-inside mb-4 space-y-2`}
        >
          {children}
        </ol>
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
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            {children}
          </Link>
        );
      },
    },
  };

  // Media component with parallax
  const MediaColumn = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start end", "end start"],
    });
    // Parallax: image moves slower than scroll (creates depth effect)
    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
      <div ref={containerRef} className="col-span-12 md:col-span-6 w-full md:w-1/2 relative">
        <StaggeredFadeIn>
          <div className="relative aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/3] overflow-hidden ">
            {isVideo && mediaUrl ? (
              <motion.video
                src={optimizedVideoUrl(mediaUrl, { maxWidth: 960 })}
                className="w-full h-[150%] object-cover absolute -top-8 left-0"
                style={{ y }}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : mediaUrl ? (
              <motion.img
                src={mediaUrl}
                alt={mediaAlt || title || "Content image"}
                className="w-full h-[150%] object-cover absolute -top-8 left-0"
                style={{ y }}
              />
            ) : (
              <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                <span className="text-neutral-400">No media</span>
              </div>
            )}
          </div>
        </StaggeredFadeIn>
      </div>
    );
  };

  // Content column
  const ContentColumn = () => (
    <div className="col-span-12 md:col-span-6 flex flex-col   justify-start">
      <StaggeredSlideUp className="flex-col justify-start ">
        {showTitle && hasVisibleText(title) && (
          <h2 className={`text-2xl md:text-4xl ${titleColorClass} mb-6 md:mb-8`}>
            {title}
          </h2>
        )}
        <div className="prose max-w-[56ch] prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline prose-a:transition-colors">
          <PortableText value={content!} components={portableTextComponents} />
        </div>
      </StaggeredSlideUp>
    </div>
  );

  return (
    <section
      id={sectionId}
      className={`relative ${bgClass} overflow-hidden`}
      {...navPointDataAttr}
    >
      <div className="relative mx-auto container ">
        <div className="grid grid-cols-12 gap-6 md:gap-12 items-center">
          {/* Two columns with configurable order */}
          {reverseColumns ? (
            <div className={`flex flex-col md:flex-row-reverse col-span-12 md:col-span-12 gap-8 md:gap-12 ${paddingClass} `}>
              <MediaColumn />
              <ContentColumn />
            </div>
          ) : (
            <div className={`flex flex-col md:flex-row-reverse col-span-12 md:col-span-12 gap-8 md:gap-12 ${paddingClass} `}>

              <ContentColumn />
              <MediaColumn />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TwoColContentSection;
