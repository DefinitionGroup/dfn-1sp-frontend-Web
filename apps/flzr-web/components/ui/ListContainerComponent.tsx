"use client";
import React from "react";
import { cn } from "@1sp/utils/cn";
import StaggeredSlideUp from "./StaggeredSlideUp";

interface ListContainerProps {
  children: React.ReactNode;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  /** Visual variant */
  variant?: "default" | "compact" | "spacious";
}

function ListContainerComponent({
  children,
  delay = 0.6,
  staggerDelay = 0.1,
  duration = 0.7,
  distance = 22,
  className,
  variant = "default",
}: ListContainerProps) {
  const variantClasses = {
    default: "space-y-1",
    compact: "space-y-0",
    spacious: "space-y-2 sm:space-y-3",
  };

  return (
    <div className={cn("w-full", variantClasses[variant], className)}>
      <StaggeredSlideUp
        delay={delay}
        staggerDelay={staggerDelay}
        duration={duration}
        distance={distance}
      >
        {children}
      </StaggeredSlideUp>
    </div>
  );
}

export default ListContainerComponent;
