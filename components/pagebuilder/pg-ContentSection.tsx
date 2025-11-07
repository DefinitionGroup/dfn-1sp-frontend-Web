"use client";
import React from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredFadeIn from "@/components/ui/StaggeredFadeIn";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
type ContentSectionData = {
  title?: string;
  introHeading?: string;
  introSubheading?: string;
  content?: PortableTextBlock[];
  contentSize?: string;
  columnSpan?: string;
  showGridBackground?: boolean;
  paddingY?: string;
};

export default function ContentSection({ data }: { data: ContentSectionData }) {
  const {
    title,
    introHeading,
    introSubheading,
    content,
    contentSize = "lg",
    columnSpan = "8",
    showGridBackground = true,
    paddingY = "16",
  } = data || {};

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
        <p className={`${getContentClass(contentSize)} text-neutral-700 mb-4`}>
          {children}
        </p>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-5xl font-semibold text-neutral-800 mt-8 mb-4">
          {children}
        </h3>
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
        <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono text-neutral-800">
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
      {(introHeading || introSubheading) && (
        <div className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta">
          {showGridBackground && <GridBackground />}
          <div className="z-1 grid gap-8 col-span-12 py-16 col-start-1 container mx-auto row-start-1 grid-cols-12">
            <div className="z-1 col-span-12 col-start-1">
              <div className="flex flex-col items-start gap-8 justify-center w-full">
                {introHeading && (
                  <StaggeredSlideUp
                    delay={0.59}
                    staggerDelay={0.03}
                    distance={100}
                    className="max-w-2/4"
                  >
                    <h2 className="text-7xl leading-none text-neutral-700 pb-3 font-aspekta">
                      {introHeading}
                    </h2>
                  </StaggeredSlideUp>
                )}
                {introSubheading && (
                  <StaggeredSlideUp
                    delay={0.65}
                    staggerDelay={0.03}
                    distance={100}
                    className="max-w-2/4"
                  >
                    <h2 className="text-7xl leading-none text-neutral-500 pb-3 font-aspekta">
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
        className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta"
      >
        {showGridBackground && <GridBackground />}
        <div
          className={`z-1 grid gap-8 col-span-12 py-${paddingY} col-start-1 container mx-auto row-start-1 grid-cols-12`}
        >
          <div className={`z-1 col-span-${columnSpan} col-start-1`}>
            {/* Optional section title */}
            {title && (
              <StaggeredFadeIn>
                <h2 className="text-6xl mb-12 text-neutral-800">{title}</h2>
              </StaggeredFadeIn>
            )}

            {/* Content */}
            <StaggeredFadeIn>
              <div className="w-full">
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
