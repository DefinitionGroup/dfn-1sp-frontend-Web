"use client";
import React from "react";
import { cn } from "@/app/lib/utils";
import StaggeredSlideUp from "./StaggeredSlideUp";

interface ListContainerProps {
  children: React.ReactNode;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

function ListContainerComponent({
  children,
  delay = 0.6,
  staggerDelay = 0.1,
  duration = 0.7,
  distance = 22,
  className,
}: ListContainerProps) {
  return (
    <div className={cn("lg:col-span-8 text-gray-100", className)}>
      <StaggeredSlideUp
        delay={delay}
        staggerDelay={staggerDelay}
        duration={duration}
        distance={distance}>
        {children}
      </StaggeredSlideUp>
    </div>
  );
}

export default ListContainerComponent;
