import React from "react";
import { cn } from "@1sp/utils/cn";

interface MixedTypeProps {
  text: string;
  className?: string; // Base class for the Sans text (e.g., font-flzr)
  serifClassName?: string; // Class for the *emphasized* Serif text
}

export default function MixedType({
  text,
  className,
  serifClassName = "font-nyghtserif italic",
}: MixedTypeProps) {
  if (!text) return null;

  // Split by asterisks.
  // "Hello *World* here" -> ["Hello ", "World", " here"]
  const parts = text.split("*");

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Even indices are standard text, Odd indices are *emphasized*
        const isSerif = index % 2 === 1;
        return (
          <span
            key={index}
            className={cn(isSerif ? serifClassName : "")}
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}
