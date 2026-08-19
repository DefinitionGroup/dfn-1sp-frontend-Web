"use client";
import React from "react";
import StaggeredFadeIn from "@flzr/components/ui/StaggeredFadeIn";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
import { hasVisibleNode, hasVisibleText } from "@1sp/utils/text-content";
type ContentSectionData = {
  title?: string;
  introHeading?: string;
  introSubheading?: string;
  content?: PortableTextBlock[];
  contentSize?: string;
  columnSpan?: string;
  paddingY?: string;
  navPointName?: string;
  hideFromNav?: boolean;
  presentation?: "default" | "globeOverlay";
};

const contentSpanClasses: Record<string, string> = {
  "6": "col-span-6",
  "8": "col-span-8",
  "10": "col-span-10",
  "12": "col-span-12",
};

const paddingClasses: Record<string, string> = {
  "8": "py-8",
  "16": "py-16",
  "24": "py-24",
  "32": "py-32",
};

function ContentSection({ data }: { data: ContentSectionData }) {
  const {
    title,
    introHeading,
    introSubheading,
    content,
    contentSize = "lg",
    columnSpan = "8",
    paddingY = "16",
    navPointName,
    hideFromNav = false,
    presentation = "default",
  } = data || {};

  const contentSpanClass = contentSpanClasses[columnSpan] ?? contentSpanClasses["8"];
  const paddingClass = paddingClasses[paddingY] ?? paddingClasses["16"];
  const isGlobeOverlay = presentation === "globeOverlay";

  if (!content || content.length === 0) return null;

  // Generate section ID from title or intro heading
  const sectionId = title
    ? title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : introHeading
      ? introHeading
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
      : "content-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

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

  // Custom components for PortableText rendering
  const portableTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className={`${getContentClass(contentSize)} text-neutral-700 mb-4`}>
          {children}
        </p>
      ),
      h3: ({ children }: any) => (
        hasVisibleNode(children) ? (
          <h3 className="text-title font-semibold text-neutral-800 mt-8 mb-4">
            {children}
          </h3>
        ) : null
      ),
      h4: ({ children }: any) => (
        <h4 className="text-3xl font-semibold text-neutral-800 mt-6 mb-3">
          {children}
        </h4>
      ),
      h5: ({ children }: any) => (
        <h5 className="text-xl font-semibold text-neutral-800 mt-4 mb-2">
          {children}
        </h5>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-600 my-4">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul
          className={`${getContentClass(contentSize)} text-neutral-700 list-disc list-inside mb-4 space-y-2`}
        >
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol
          className={`${getContentClass(contentSize)} text-neutral-700 list-decimal list-inside mb-4 space-y-2`}
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
        <strong className="font-bold text-neutral-900">{children}</strong>
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

  return (
    <>
      {/* Introduction Section (if provided) */}
      {(hasVisibleText(introHeading) || hasVisibleText(introSubheading)) && (
        <div className="grid grid-cols-12 z-1 mx-auto container relative font-flzr">
          <div className="z-1 grid gap-8 col-span-12 pt-12 mt-24 col-start-1 container mx-auto row-start-1 grid-cols-12">
            <div className="z-1 col-span-12 col-start-1">
              <div className="flex flex-col items-start gap-2  justify-center w-full">
                {hasVisibleText(introHeading) && (
                  <StaggeredSlideUp
                    delay={0.59}
                    staggerDelay={0.03}
                    distance={100}
                    className="max-w-full md:max-w-2/4"
                  >
                    <h2 className="text-section-lead text-neutral-700 font-flzr">
                      {introHeading}
                    </h2>
                  </StaggeredSlideUp>
                )}
                {hasVisibleText(introSubheading) && (
                  <StaggeredSlideUp
                    delay={0.65}
                    staggerDelay={0.03}
                    distance={100}
                    className="max-w-full md:max-w-2/4 "
                  >
                    <h2 className="text-section-lead text-neutral-400 font-flzr">
                      {introSubheading}
                    </h2>
                  </StaggeredSlideUp>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <section
        id={sectionId}
        {...navPointDataAttr}
        className={`grid grid-cols-12 mx-auto container font-flzr ${
          isGlobeOverlay
            ? "flzr-content-section--globe-overlay absolute inset-x-0 top-0 z-20"
            : "relative z-1"
        }`}
      >
        <div
          className={`z-1 grid gap-8 col-span-12 ${paddingClass} col-start-1 container mx-auto row-start-1 grid-cols-12 ${
            isGlobeOverlay ? "px-4 sm:px-6 lg:px-8" : ""
          }`}
        >
          <div className={`z-1 ${contentSpanClass} col-start-1 pt-8`}>
            {/* Optional section title */}
            {hasVisibleText(title) && (
              <StaggeredFadeIn viewThreshold={0.01}>
                <h2 className="text-section-title mb-12 text-flzr-violet">{title}</h2>
              </StaggeredFadeIn>
            )}

            {/* Content */}
            <StaggeredFadeIn viewThreshold={0.01}>
              <div className="w-full max-w-[120ch]">
                <PortableText
                  value={content}
                  components={portableTextComponents}
                />
              </div>
            </StaggeredFadeIn>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContentSection;
