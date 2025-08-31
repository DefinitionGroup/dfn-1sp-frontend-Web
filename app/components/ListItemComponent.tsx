"use client";
import React from "react";
import { cn } from "@/app/lib/utils";

interface ListItemProps {
  children: React.ReactNode;
  fontWeight?: "normal" | "medium" | "bold";
  color?: string;
  className?: string;
}

function ListItemComponent({
  children,
  fontWeight = "normal",
  color = "gray-100",
  className,
}: ListItemProps) {
  return (
    <div className="pb-2">
      <p
        className={cn(
          `text-body-md font-${fontWeight} text-${color}`,
          className
        )}>
        {children}
      </p>
      <div className="w-full h-px bg-gray-100 mt-4"></div>
    </div>
  );
}

export default ListItemComponent;
