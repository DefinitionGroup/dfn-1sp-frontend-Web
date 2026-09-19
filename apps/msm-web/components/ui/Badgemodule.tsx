"use client";

import { cn } from "@1sp/utils/cn";
import MsmLogoAnimated from "./MsmLogoAnimated";
import SelectionFrame from "./SelectionFrame";

interface BadgemoduleProps {
  text: string;
  subtitle: string;
  /** Retained for compatibility with shared Sanity badge content. */
  numberEl?: string | number;
  className?: string;
  variant?: "default" | "minimal" | "glass";
  size?: "sm" | "md" | "lg";
}

/** Two staggered diagonal selections leave the homepage's small corner crosses. */
export default function Badgemodule({ text, subtitle, className, size = "md" }: BadgemoduleProps) {

  return (
    <SelectionFrame className={cn("msm-square-badge", `msm-square-badge-${size}`, className)} contentClassName="msm-square-badge-content">
        <MsmLogoAnimated size={44} className="msm-square-badge-logo" />
        <div>
          <p className="msm-square-badge-title text-msm-ink">{text}</p>
          {subtitle ? <p className="msm-square-badge-subtitle text-white/65">{subtitle}</p> : null}
        </div>
    </SelectionFrame>
  );
}
