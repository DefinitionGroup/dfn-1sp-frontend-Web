"use client";

import React from "react";

type DebugBadgeProps = {
  name: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: React.ReactNode;
  className?: string;
};

const positionClasses: Record<NonNullable<DebugBadgeProps["position"]>, string> = {
  "top-left": "top-4 left-1",
  "top-right": "top-1 right-1",
  "bottom-left": "bottom-1 left-1",
  "bottom-right": "bottom-1 right-1",
};

export default function DebugBadge({
  name,
  position = "top-left",
  children,
  className = "",
}: DebugBadgeProps) {
  // Only render in dev unless explicitly disabled via env
  const isDev = process.env.NODE_ENV === "development";
  const toggle = process.env.NEXT_PUBLIC_DEBUG_BADGES ?? "true";
  const enabled = isDev && toggle !== "false";

  if (!enabled) return <>{children}</>;

  return (
    <div className={`relative ${className}`} data-component={name}>
      {/* Badge */}
      <div
        className={[
          "pointer-events-none select-none",
          "absolute z-[60]",
          positionClasses[position],
          // Visuals
          "text-[10px] leading-none font-medium tracking-wide",
          "px-1.5 py-1 rounded border",
          "bg-black/60 text-emerald-200 border-emerald-500/60",
          "shadow-sm backdrop-blur",
        ].join(" ")}
      >
        {name}
      </div>

      {/* Content */}
      <div className="debug-badge-content">{children}</div>
    </div>
  );
}
