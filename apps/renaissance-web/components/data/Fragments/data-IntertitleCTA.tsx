"use client";
import React from "react";
import Link from "next/link";
import StaggeredSlideUp from "@renaissance/components/ui/StaggeredSlideUp";
import Button2 from "@renaissance/components/ui/Button2";
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
  buttonText?: string;
  buttonVariant?: "default" | "black" | "violet" | "violetsmall";
  href?: string;
  staggeredProps?: Partial<StaggeredSlideUpProps>;
  containerClassName?: string;
  alignment?: "center" | "left";
  showButton?: boolean;
}

const IntertitleCTA: React.FC<IntertitleCTAProps> = ({
  title,
  subtitle,
  buttonText,
  buttonVariant = "violet",
  href,
  staggeredProps = {},
  containerClassName = "flex-col w-full min-w-64 justify-center mx-auto ",
  alignment = "center",
  showButton = true,
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

  return (
    <div className={containerClassName}>
      <StaggeredSlideUp {...defaultStaggeredProps}>
        {hasVisibleText(title) ? <h3 className={titleClass}>{title}</h3> : null}
        <p className={subtitleClass}>{subtitle}</p>
      </StaggeredSlideUp>
      {showButton && href && buttonText && (
        <Link href={href} className={buttonContainerClass}>
          <Button2 text={buttonText} variant={buttonVariant} />
        </Link>
      )}
    </div>
  );
};

export default IntertitleCTA;
