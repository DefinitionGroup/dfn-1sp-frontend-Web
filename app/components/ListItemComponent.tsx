"use client";
import React from "react";
import { cn } from "@/app/lib/utils";

interface ListItemProps {
  children: React.ReactNode;
  fontWeight?: "normal" | "medium" | "bold";
  color?:
    | "gray-50"
    | "gray-100"
    | "gray-200"
    | "gray-300"
    | "gray-400"
    | "white"
    | "black";
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeClasses: Record<NonNullable<ListItemProps["size"]>, string> = {
  small: "text-base",
  medium: "text-2xl",
  large: "text-5xl",
};

const weightClasses: Record<
  NonNullable<ListItemProps["fontWeight"]>,
  string
> = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

const textColorClasses: Record<NonNullable<ListItemProps["color"]>, string> = {
  "gray-50": "text-gray-50",
  "gray-100": "text-gray-100",
  "gray-200": "text-gray-200",
  "gray-300": "text-gray-300",
  "gray-400": "text-gray-400",
  white: "text-white",
  black: "text-black",
};

const lineColorClasses: Record<NonNullable<ListItemProps["color"]>, string> = {
  "gray-50": "bg-gray-50",
  "gray-100": "bg-gray-100",
  "gray-200": "bg-gray-200",
  "gray-300": "bg-gray-300",
  "gray-400": "bg-gray-400",
  white: "bg-white",
  black: "bg-black",
};

function ListItemComponent({
  children,
  fontWeight = "normal",
  color = "gray-100",
  size = "small",
  className,
}: ListItemProps) {
  return (
    <div className="pb-2">
      <p
        className={cn(
          sizeClasses[size],
          weightClasses[fontWeight],
          textColorClasses[color],
          className
        )}>
        {children}
      </p>
      <div className={cn("w-full h-px mt-4", lineColorClasses[color])} />
    </div>
  );
}

export default ListItemComponent;
