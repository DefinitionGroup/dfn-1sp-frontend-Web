"use client";

import { useInView } from "motion/react";
import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@1sp/utils/cn";

const SelectionSequenceContext = createContext<boolean | null>(null);
const SELECTION_STAGGER_MS = 200;

/** One viewport trigger and one timeline: badge at index 0, then cards. */
export function SelectionSequence({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, { once: true, amount: "some" });
  return (
    <SelectionSequenceContext.Provider value={entered}>
      <div ref={ref} className={className}>{children}</div>
    </SelectionSequenceContext.Provider>
  );
}

/** Shared MSM drawing signature for badges and interactive cards. */
export default function SelectionFrame({ children, className, contentClassName, delay = 0, sequenceIndex = 0, transientCrosses = false }: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  sequenceIndex?: number;
  transientCrosses?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ownEntered = useInView(ref, { once: true, amount: 0.15 });
  const sequenceEntered = useContext(SelectionSequenceContext);
  const entered = sequenceEntered ?? ownEntered;
  return (
    <div ref={ref} data-entered={entered} data-transient-crosses={transientCrosses || undefined} className={cn("msm-badge relative", className)}
      style={{ "--msm-draw-offset": `${delay + sequenceIndex * SELECTION_STAGGER_MS}ms` } as CSSProperties}>
      {(["left", "right"] as const).map((origin) => (
        <div key={origin} aria-hidden="true" data-origin={origin} className="msm-badge-selection">
          <svg className="msm-badge-frame" width="100%" height="100%">
            <rect x="0.5" y="0.5" width="100%" height="100%" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="msm-badge-cross font-mono text-xs leading-none">+</span>
          <span className="msm-badge-handle"><span className="msm-badge-cross font-mono text-xs leading-none">+</span></span>
        </div>
      ))}
      <div className={cn("msm-badge-content", contentClassName)}>{children}</div>
    </div>
  );
}
