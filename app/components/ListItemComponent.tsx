"use client";
import React from "react";
import { cn } from "@/app/lib/utils";

interface ListItemProps {
  children: React.ReactNode;
  fontWeight?: "normal" | "medium" | "bold";
  color?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

function ListItemComponent({
  children,
  fontWeight = "normal",
  color = "gray-100",
  size = "small",
  className,
}: ListItemProps) {
  const textSizeClass =
    size === "small"
      ? "text-base"
      : size === "medium"
      ? "text-2xl"
      : "text-5xl";

  return (
    <div className="pb-2">
      <p
        className={cn(
          `${textSizeClass} font-${fontWeight} text-${color}`,
          className
        )}>
        {children}
      </p>
      <div className="w-full h-px bg-gray-100 mt-4"></div>
    </div>
  );
}

export default ListItemComponent;
