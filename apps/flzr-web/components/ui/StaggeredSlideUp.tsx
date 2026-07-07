"use client";

import React, { useRef, useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRobustInView } from "@1sp/utils/hooks/use-robust-in-view";

// ─── Easing presets ──────────────────────────────────────────────────
type EasingPreset = "smooth" | "spring" | "ease-out" | "bounce";
type Cubic = [number, number, number, number];

const EASING: Record<EasingPreset, Cubic> = {
  smooth: [0.33, 1, 0.68, 1],
  spring: [0.16, 1, 0.3, 1],
  "ease-out": [0, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// ─── Props (public API – unchanged) ─────────────────────────────────
interface StaggeredSlideUpProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  /** Initial delay before animation starts (seconds) */
  delay?: number;
  /** Delay between each child animation (seconds) */
  staggerDelay?: number;
  /** Duration of each child's animation (seconds) */
  duration?: number;
  /** Distance to slide up from (pixels) */
  distance?: number;
  /** Easing function for animations */
  easing?: EasingPreset;
  /** Intersection Observer threshold (0-1) */
  threshold?: number;
  /** Root margin for Intersection Observer */
  rootMargin?: string;
  /** Whether to trigger animation only once */
  once?: boolean;
  /** Enable debug mode to visualize trigger state */
  debug?: boolean;
  /** Skip viewport detection – animate immediately */
  animateImmediately?: boolean;
}

// ─── Per-child item ──────────────────────────────────────────────────
// Clip-path and slide/fade run on two *separate* motion.divs so their
// timing can differ without interfering with each other.
const StaggeredItem = React.memo(
  ({
    children,
    index,
    isVisible,
    delay,
    staggerDelay,
    duration,
    distance,
    easing,
    useClipPath,
  }: {
    children: React.ReactNode;
    index: number;
    isVisible: boolean;
    delay: number;
    staggerDelay: number;
    duration: number;
    distance: number;
    easing: Cubic;
    useClipPath: boolean;
  }) => {
    const itemDelay = delay + index * staggerDelay;

    // Clip-path: reveal from bottom, runs ~40 % longer so it never
    // cuts the content while the slide is still in progress.
    // The final state uses a NEGATIVE inset: inset(0%) keeps clipping at
    // the border box and permanently cuts descenders of tight-leading
    // headlines (line-height <= 1). Expanding past the box ends with no
    // visible clip.
    const clipWrapper = useClipPath ? (
      <motion.div
        initial={{ clipPath: "inset(-20% -5% 100% -5%)" }}
        animate={
          isVisible
            ? { clipPath: "inset(-20% -5% -25% -5%)" }
            : { clipPath: "inset(-20% -5% 100% -5%)" }
        }
        transition={{
          duration: duration * 1.4,
          delay: itemDelay,
          ease: easing,
        }}
      >
        {children}
      </motion.div>
    ) : (
      children
    );

    // Slide-up + fade
    return (
      <motion.div
        initial={{ y: distance, opacity: 0 }}
        animate={
          isVisible
            ? { y: 0, opacity: 1 }
            : { y: distance, opacity: 0 }
        }
        transition={{
          duration,
          delay: itemDelay,
          ease: easing,
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {clipWrapper}
      </motion.div>
    );
  },
);

StaggeredItem.displayName = "StaggeredItem";

// ─── Container ───────────────────────────────────────────────────────
const StaggeredSlideUp: React.FC<StaggeredSlideUpProps> = ({
  children,
  className = "",
  delay = 0.1,
  staggerDelay = 0.06,
  duration = 0.4,
  distance = 10,
  easing = "spring",
  threshold = 0.08,
  rootMargin = "0px 0px 72px 0px",
  once = true,
  debug = false,
  animateImmediately = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const prefersReducedMotion = useReducedMotion();

  const { isInView, isMobile } = useRobustInView(ref, {
    once,
    amount: threshold,
    margin: rootMargin,
  });

  // Only animate when *actually* in the viewport (or explicitly told to)
  const shouldAnimate = animateImmediately || isInView;

  // Reduced-motion: skip to final state instantly
  const effectiveDuration = prefersReducedMotion ? 0.01 : duration;
  const effectiveDistance = prefersReducedMotion ? 0 : distance;
  const shouldUseClipPath = !isMobile && !prefersReducedMotion;

  const easingCurve = EASING[easing];
  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref} className={className} data-stagger-id={id}>
      {debug && (
        <div
          className={`fixed top-4 right-4 z-50 px-3 py-1 text-xs font-mono ${shouldAnimate ? "bg-green-500" : "bg-red-500"
            } text-white`}
        >
          {shouldAnimate ? "IN VIEW" : "OUT OF VIEW"}
        </div>
      )}

      {childArray.map((child, index) => (
        <StaggeredItem
          key={`${id}-${index}`}
          index={index}
          isVisible={shouldAnimate}
          delay={delay}
          staggerDelay={staggerDelay}
          duration={effectiveDuration}
          distance={effectiveDistance}
          easing={easingCurve}
          useClipPath={shouldUseClipPath}
        >
          {child}
        </StaggeredItem>
      ))}
    </div>
  );
};

export default StaggeredSlideUp;
