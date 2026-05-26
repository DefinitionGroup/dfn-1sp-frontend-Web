"use client";
import React from "react";
import StaggeredSlideUp from "@flzr/components/ui/StaggeredSlideUp";
import Button2 from "@flzr/components/ui/Button2";
import Link from "next/link";
import { resolveLink } from "@1sp/utils/cloudinary";
import { useParams } from "next/navigation";
import type { CTA } from "@1sp/sanity-types";
import GridBackground from "@flzr/components/ui/GridBackground";
import { hasVisibleText } from "@1sp/utils/text-content";

interface StaggeredSlideUpProps {
  className?: string;
  delay?: number;
  debug?: boolean;
  easing?: "smooth" | "spring" | "ease-out" | "bounce";
  staggerDelay?: number;
  duration?: number;
  distance?: number;
}

interface IntertitleCTAProps {
  title: string;
  subtitle: string;
  cta?: CTA;
  staggeredProps?: Partial<StaggeredSlideUpProps>;
  containerClassName?: string;
  alignment?: "center" | "left";
  paddingTop?: "0" | "12" | "24" | "48";
  navPointName?: string;
  hideFromNav?: boolean;
}

const IntertitleCTA: React.FC<IntertitleCTAProps> = ({
  title,
  subtitle,
  cta,
  staggeredProps = {},
  containerClassName = "flex-col w-full  md:min-w-64 justify-center mx-auto ",
  alignment = "center",
  paddingTop = "0",
  navPointName,
  hideFromNav = false,
}) => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isLeftAligned = alignment === "left";

  // Padding top classes
  const paddingTopMap: Record<string, string> = {
    "0": "",
    "12": "pt-12",
    "24": "pt-24",
    "48": "pt-48",
  };
  const paddingTopClass = paddingTopMap[paddingTop] || "";

  const defaultStaggeredProps: StaggeredSlideUpProps = {
    className: `flex flex-col ${isLeftAligned ? "items-start" : "items-center"} font-normal justify-center  w-full min-w-full `,
    delay: 0.0,
    debug: false,
    easing: "smooth",
    staggerDelay: 0.1,
    duration: 0.5,
    distance: 20,
    ...staggeredProps,
  };

  const titleClass = `text-2xl  md:text-4xl text-gray-700 ${isLeftAligned ? "text-left" : "text-center"} leading-[1.2]`;
  const subtitleClass = `text-2xl  md:text-4xl text-gray-400 leading-snug ${isLeftAligned ? "text-left" : "text-center"}`;
  const buttonContainerClass = `w-fit min-w-40 ${isLeftAligned ? "self-start" : "mx-auto"} mt-8 block`;

  // Resolve CTA link and props
  let buttonHref = cta?.link ? resolveLink(cta.link) : undefined;
  // Fix URL to include locale if it's an internal link
  if (
    buttonHref &&
    buttonHref.startsWith("/") &&
    !buttonHref.startsWith(`/${locale}`)
  ) {
    buttonHref = `/${locale}${buttonHref}`;
  }
  const buttonText = cta?.text;
  const buttonVariant =
    (cta?.variant as "default" | "black" | "violet" | "violetsmall") || "violet";

  // Generate section ID from title
  const sectionId = title
    ? title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    : "intertitle-section";

  // Store nav-related data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  return (
    <div id={sectionId} {...navPointDataAttr} className={`${containerClassName} `}>
      <div className="grid z-1 mx-auto container relative font-aspekta">
        {/* Background grid (optional visual helper) */}
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className={`z-1   py-12 col-span-8   col-start-3  container mx-auto row-start-1 grid-cols-12 ${paddingTopClass}`}>
          <StaggeredSlideUp {...defaultStaggeredProps}>
            {hasVisibleText(title) ? <h3 className={titleClass}>{title}</h3> : null}
            <p className={subtitleClass}>{subtitle}</p>
          </StaggeredSlideUp>
          {buttonHref && buttonText && (
            <div className={buttonContainerClass}>
              <Button2
                text={buttonText}
                variant={buttonVariant}
                href={buttonHref}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntertitleCTA;
