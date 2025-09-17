"use client";
import React from "react";
import { cn } from "@/app/lib/utils";
import StaggeredSlideUp from "./StaggeredSlideUp";
import Button2 from "./Button2";

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
}

function CtaMiniComponent({
  heading,
  paragraph,
  buttonText,
  buttonVariant = "default",
  url = "#",
  align = "left",
  delay = 0.6,
  staggerDelay = 0.1,
  duration = 0.5,
  distance = 22,
  className,
}: CtaMiniProps) {
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
      distance={distance}>
      <h3
        className={`text-2xl leading-none mb-4 font-semibold ${textAlignClass}`}>
        {heading}
      </h3>
      <p className={`text-xs mb-8 ${textAlignClass}`}>{paragraph}</p>
      <div className="text-xs  mb-8 min-w-[120px]  w-full  ">
        <Button2
          variant={buttonVariant}
          className="w-full"
          text={buttonText}
          href={url}
        />
      </div>
    </StaggeredSlideUp>
  );
}

export default CtaMiniComponent;
