"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

/**
 * Technical corner markers — four "+" glyphs at the corners of a container
 * (Vast Space blueprint grammar). Purely decorative: aria-hidden, no
 * pointer events. Parent must be `position: relative`.
 *
 * System pattern: used to frame components without borders (hero sections,
 * badges, media frames). Size and color come via className (defaults:
 * cyan/40, text-base); density comes via inset.
 */
type MarkerFlickerSettings = {
  duration: number;
  pronounced: boolean;
};

const markerFlickerVariants: Variants = {
  hidden: (settings?: MarkerFlickerSettings) => ({
    opacity: 0,
    transform: settings?.pronounced ? "scale(0.45)" : "scale(0.7)",
  }),
  visible: (settings?: MarkerFlickerSettings) => ({
    opacity: settings?.pronounced
      ? [0, 1, 0.02, 1, 0.08, 1]
      : [0, 1, 0.12, 1, 0.32, 1],
    transform: settings?.pronounced
      ? [
          "scale(0.45)",
          "scale(1.28)",
          "scale(0.78)",
          "scale(1.16)",
          "scale(0.9)",
          "scale(1)",
        ]
      : [
          "scale(0.7)",
          "scale(1.08)",
          "scale(0.9)",
          "scale(1.03)",
          "scale(0.96)",
          "scale(1)",
        ],
    transition: {
      duration: settings?.duration ?? 0.44,
      times: [0, 0.14, 0.28, 0.48, 0.65, 1],
      ease: "linear",
    },
  }),
};

export default function CornerMarkers({
  className = "text-msm-cyan/40 text-base",
  inset = "1rem",
  animateOnView = false,
  animationDelay = 0,
  stagger = 0.16,
  flickerDuration = 0.44,
  pronounced = false,
  visible,
}: {
  className?: string;
  inset?: string;
  animateOnView?: boolean;
  animationDelay?: number;
  stagger?: number;
  flickerDuration?: number;
  pronounced?: boolean;
  /**
   * Optional controlled visibility for components that already own a robust
   * in-view state. When omitted, the markers observe their own viewport entry.
   */
  visible?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const flickerSettings: MarkerFlickerSettings = {
    duration: flickerDuration,
    pronounced,
  };
  const positions: Array<[string, string]> = [
    ["top", "left"],
    ["top", "right"],
    ["bottom", "right"],
    ["bottom", "left"],
  ];

  const markers = positions.map(([v, h]) => {
    const markerKey = `${v}-${h}`;
    const markerProps = {
      className: `absolute font-mono leading-none ${className}`,
      style: { [v]: inset, [h]: inset } as React.CSSProperties,
    };

    return animateOnView && !prefersReducedMotion ? (
      <motion.span
        key={markerKey}
        {...markerProps}
        custom={flickerSettings}
        variants={markerFlickerVariants}
      >
        +
      </motion.span>
    ) : (
      <span key={markerKey} {...markerProps}>
        +
      </span>
    );
  });

  if (animateOnView && !prefersReducedMotion) {
    const controlledAnimation =
      typeof visible === "boolean"
        ? { animate: visible ? "visible" : "hidden" }
        : { whileInView: "visible" as const };

    return (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 select-none"
        initial="hidden"
        {...controlledAnimation}
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: animationDelay,
              staggerChildren: stagger,
            },
          },
        }}
      >
        {markers}
      </motion.div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 select-none">
      {markers}
    </div>
  );
}
