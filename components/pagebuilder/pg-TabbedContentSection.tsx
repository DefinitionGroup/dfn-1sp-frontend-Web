"use client";
import React, { useState } from "react";
import GridBackground from "@/components/ui/GridBackground";
import StaggeredFadeIn from "@/components/ui/StaggeredFadeIn";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

type TabbedContentSectionData = {
  title?: string;
  introHeading?: string;
  introSubheading?: string;
  tab1Label?: string;
  tab2Label?: string;
  content1?: PortableTextBlock[];
  content2?: PortableTextBlock[];
  contentSize?: string;
  columnSpan?: string;
  showGridBackground?: boolean;
  paddingY?: string;
  navPointName?: string;
  hideFromNav?: boolean;
};

function TabbedContentSection({ data }: { data: TabbedContentSectionData }) {
  const {
    title,
    introHeading,
    introSubheading,
    tab1Label = "Tab 1",
    tab2Label = "Tab 2",
    content1,
    content2,
    contentSize = "lg",
    columnSpan = "8",
    showGridBackground = true,
    paddingY = "16",
    navPointName,
    hideFromNav = false,
  } = data || {};

  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  if ((!content1 || content1.length === 0) && (!content2 || content2.length === 0)) return null;

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
      : "tabbed-content-section";

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

  // Get current content based on active tab
  const currentContent = activeTab === 1 ? content1 : content2;

  return (
    <>
      {/* Introduction Section (if provided) */}
      {(introHeading || introSubheading) && (
        <div className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta">
          {showGridBackground && <GridBackground />}
          <div className="z-1 grid gap-8 col-span-12 pt-12 mt-24 col-start-1 container mx-auto row-start-1 grid-cols-12">
            <div className="z-1 col-span-12 col-start-1">
              <div className="flex flex-col items-start gap-2 justify-center w-full">
                {introHeading && (
                  <StaggeredSlideUp
                    delay={0.59}
                    staggerDelay={0.03}
                    distance={100}
                    className="max-w-full md:max-w-2/4"
                  >
                    <h2 className="text-5xl leading-none text-neutral-700 font-aspekta">
                      {introHeading}
                    </h2>
                  </StaggeredSlideUp>
                )}
                {introSubheading && (
                  <StaggeredSlideUp
                    delay={0.65}
                    staggerDelay={0.03}
                    distance={100}
                    className="max-w-full md:max-w-2/4"
                  >
                    <h2 className="text-5xl leading-none text-neutral-400 font-aspekta">
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

            {/* Tab Navigation */}
            <StaggeredFadeIn>
              <div className="flex gap-1 mb-8 border-b border-neutral-200">
                <button
                  onClick={() => setActiveTab(1)}
                  className={`
                    relative px-6 py-3 text-lg font-medium transition-colors duration-200
                    ${activeTab === 1
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-600"
                    }
                  `}
                >
                  {tab1Label}
                  {activeTab === 1 && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab(2)}
                  className={`
                    relative px-6 py-3 text-lg font-medium transition-colors duration-200
                    ${activeTab === 2
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-600"
                    }
                  `}
                >
                  {tab2Label}
                  {activeTab === 2 && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            </StaggeredFadeIn>

            {/* Content with Animation */}
            <div className="w-full md:w-2/4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {currentContent && currentContent.length > 0 ? (
                    <PortableText
                      value={currentContent}
                      components={portableTextComponents}
                    />
                  ) : (
                    <p className="text-neutral-400 italic">No content available for this tab.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default TabbedContentSection;
