"use client";
import React from "react";
import { cn } from "@1sp/utils/cn";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { hasVisibleText } from "@1sp/utils/text-content";

interface CtaMiniProps {
  heading: string;
  paragraph: string;
  buttonText: string;
  buttonVariant?: "default" | "black" | "lime" | "limesmall";
  url?: string;
  align?: "left" | "right" | "center";
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  showButton?: boolean;
}

const buttonVariantStyles: Record<
  NonNullable<CtaMiniProps["buttonVariant"]>,
  string
> = {
  default:
    "border-white/30 text-white bg-transparent hover:bg-slate-100 hover:text-slate-900",
  black:
    "border-neutral-800/40 bg-neutral-900 text-white hover:bg-neutral-800",
  lime:
    "border-lime-500/40 bg-lime-400 text-neutral-900 hover:bg-neutral-900 hover:text-white",
  limesmall:
    "border-lime-500/40 bg-lime-400 text-neutral-900 hover:bg-neutral-900 hover:text-white",
};

function CtaMiniComponent({
  heading,
  paragraph,
  buttonText,
  buttonVariant = "default",
  url = "",
  align = "left",
  delay = 0.6,
  staggerDelay = 0.1,
  duration = 0.5,
  distance = 22,
  className,
  showButton = true,
}: CtaMiniProps) {
  const finalUrl = url?.trim() || "";
  const hasValidUrl = finalUrl.length > 0 && finalUrl !== "#";
  const isExternal = /^(https?:|mailto:|tel:)/.test(finalUrl);
  const safeButtonVariant: NonNullable<CtaMiniProps["buttonVariant"]> =
    buttonVariant in buttonVariantStyles ? buttonVariant : "default";
  const hasTextContent = hasVisibleText(heading) || hasVisibleText(paragraph);

  if (showButton ? (!hasVisibleText(heading) || !hasVisibleText(buttonText) || !hasValidUrl) : !hasTextContent) {
    return null;
  }

  const alignClass =
    align === "center"
      ? "items-center"
      : align === "right"
        ? "items-end"
        : "items-start";
  const textAlignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <StaggeredSlideUp
      className={cn(`flex flex-col ${alignClass}`, className)}
      delay={delay}
      staggerDelay={staggerDelay}
      duration={duration}
      distance={distance}
    >
      {hasVisibleText(heading) ? (
        <h3
          className={`text-xl leading-normal mb-0 md:mb-4 tracking-tight font- ${textAlignClass}`}
        >
          {heading}
        </h3>
      ) : null}
      <p className={`md:text-sm mb-2 md:mb-8 ${textAlignClass}`}>{paragraph}</p>
      {showButton ? (
        buttonText && hasValidUrl ? (
          <div className="mb-8 w-full md:w-auto md:min-w-[180px]">
            <Link
              href={finalUrl}
              className={cn(
                "inline-flex w-full md:w-fit items-center justify-between gap-3 rounded-xs border font-medium tracking-wider transition-colors duration-200",
                "text-[10px] sm:text-xxs md:text-xxs",
                buttonVariant === "limesmall"
                  ? "px-3 py-2 md:px-4 md:py-2"
                  : "px-3 py-2.5 md:px-4 md:py-3",
                buttonVariantStyles[safeButtonVariant]
              )}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer nofollow" : undefined}
            >
              <span>{buttonText}</span>
              <ArrowRightIcon size={14} className="-rotate-45 shrink-0" />
            </Link>
          </div>
        ) : null
      ) : null}
    </StaggeredSlideUp>
  );
}

export default CtaMiniComponent;
