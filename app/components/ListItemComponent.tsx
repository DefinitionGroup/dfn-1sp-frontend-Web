"use client";
import React from "react";
import { cn } from "@/app/lib/utils";

interface ListItemProps {
  children: React.ReactNode;
  fontWeight?: "normal" | "medium" | "bold";
  linecolor?:
    | "gray-50"
    | "gray-100"
    | "gray-200"
    | "gray-300"
    | "gray-400"
    | "gray-500"
    | "gray-600"
    | "gray-700"
    | "violet-500"
    | "violet-600"
    | "violet-700"
    | "white"
    | "black";
  color?:
    | "gray-50"
    | "gray-100"
    | "gray-200"
    | "gray-300"
    | "gray-400"
    | "gray-500"
    | "gray-600"
    | "gray-700"
    | "violet-500"
    | "violet-600"
    | "violet-700"
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
  "gray-500": "text-gray-500",
  "gray-600": "text-gray-600",
  "gray-700": "text-gray-700",
  "violet-500": "text-violet-500",
  "violet-600": "text-violet-600",
  "violet-700": "text-violet-700",
  white: "text-white",
  black: "text-black",
};

const lineColorClasses: Record<NonNullable<ListItemProps["color"]>, string> = {
  "gray-50": "bg-gray-50",
  "gray-100": "bg-gray-100",
  "gray-200": "bg-gray-200",
  "gray-300": "bg-gray-300",
  "gray-400": "bg-gray-400",
  "gray-500": "bg-gray-500",
  "gray-600": "bg-gray-600",
  "gray-700": "bg-gray-700",
  "violet-500": "bg-violet-500",
  "violet-600": "bg-violet-600",
  "violet-700": "bg-violet-700",
  white: "bg-white",
  black: "bg-black",
};

function ListItemComponent({
  children,
  fontWeight = "normal",
  color = "gray-100",
  size = "small",
  linecolor = "violet-600",
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
        )}
      >
        {children}
      </p>
      <div className={cn("w-full h-px mt-4", lineColorClasses[linecolor])} />
    </div>
  );
}

export default ListItemComponent;
