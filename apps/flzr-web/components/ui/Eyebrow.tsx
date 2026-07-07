import React from "react";
import { cn } from "@1sp/utils/cn";

interface EyebrowProps {
  children: React.ReactNode;
  /** Show the pulsing violet status dot before the label */
  dot?: boolean;
  className?: string;
}

/**
 * Telemetry eyebrow — 12px uppercase Geist Mono label with optional
 * status dot. The flzr signature micro-detail; place above section
 * headings and on data readouts.
 */
function Eyebrow({ children, dot = true, className }: EyebrowProps) {
  return (
    <p className={cn("eyebrow-mono flex items-center gap-2", className)}>
      {dot ? <span className="status-dot self-start mt-0.5" aria-hidden="true" /> : null}
      {children}
    </p>
  );
}

export default Eyebrow;
