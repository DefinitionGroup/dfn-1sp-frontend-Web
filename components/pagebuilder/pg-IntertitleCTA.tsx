"use client";
import React from "react";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Button2 from "@/components/ui/Button2";
import { Link } from "next-view-transitions";
import { resolveLink } from "@/utils/utils";
import type { CTA } from "@/types/sanity.types";

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
  navPointName?: string;
}

const IntertitleCTA: React.FC<IntertitleCTAProps> = ({
  title,
  subtitle,
  cta,
  staggeredProps = {},
  containerClassName = "flex-col w-full min-w-64 justify-center mx-auto mt-8 mb-16",
  alignment = "center",
  navPointName,
}) => {
  const isLeftAligned = alignment === "left";

  const defaultStaggeredProps: StaggeredSlideUpProps = {
    className: `flex flex-col ${isLeftAligned ? "items-start" : "items-center"} font-normal justify-center`,
    delay: 0.0,
    debug: false,
    easing: "smooth",
    staggerDelay: 0.1,
    duration: 0.5,
    distance: 20,
    ...staggeredProps,
  };

  const titleClass = `text-2xl text-gray-700 ${isLeftAligned ? "text-left" : "text-center"} leading-[1.2]`;
  const subtitleClass = `text-2xl text-gray-500 leading-snug ${isLeftAligned ? "text-left" : "text-center"}`;
  const buttonContainerClass = `w-fit min-w-40 ${isLeftAligned ? "self-start" : "mx-auto"} mt-8 block`;

  // Resolve CTA link and props
  const buttonHref = cta?.link ? resolveLink(cta.link) : undefined;
  const buttonText = cta?.text;
  const buttonVariant =
    (cta?.variant as "default" | "black" | "lime" | "limesmall") || "lime";

  // Generate section ID from title
  const sectionId = title
    ? title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "intertitle-section";

  // Store the navPointName in a data attribute if provided
  const navPointDataAttr = navPointName
    ? { "data-navpoint-name": navPointName }
    : {};

  return (
    <div id={sectionId} {...navPointDataAttr} className={containerClassName}>
      <StaggeredSlideUp {...defaultStaggeredProps}>
        <h3 className={titleClass}>{title}</h3>
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
  );
};

export default IntertitleCTA;
