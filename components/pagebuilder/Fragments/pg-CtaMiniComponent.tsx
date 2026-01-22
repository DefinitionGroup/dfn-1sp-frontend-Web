"use client";
import React from "react";
import { cn } from "@/lib/utils";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Button2 from "@/components/ui/Button2";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
import { useParams } from "next/navigation";

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
  const finalUrl = url || "#";

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
      <h3
        className={`text-xl leading-normal mb-0 md:mb-4 tracking-tight font- ${textAlignClass}`}
      >
        {heading}
      </h3>
      <p className={`md:text-sm mb-2 md:mb-8 ${textAlignClass}`}>{paragraph}</p>
      {showButton ? (
        buttonText && finalUrl && finalUrl !== "#" ? (
          <div className="md:text-xs mb-8 min-w-[180px] w-full">
            <Button2
              variant={buttonVariant}
              className="w-full text-xxs"
              text={buttonText}
              href={finalUrl}
            />
          </div>
        ) : (
          <div className="md:text-xs mb-8 text-red-500">
            {!buttonText && "Missing buttonText"}
            {!finalUrl && "Missing URL"}
            {finalUrl === "#" && "URL is #"}
          </div>
        )
      ) : null}
    </StaggeredSlideUp>
  );
}

export default withDebugBadge(CtaMiniComponent, "fragment-CtaMiniComponent", {
  badgeClassName: "bg-black/60 text-red-200 border-red-500/60",
});
