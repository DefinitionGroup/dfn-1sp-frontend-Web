"use client";

import React, { useRef, useId } from "react";
import { motion, useInView } from "motion/react";

const EASING_MAP = {
  smooth: [0.33, 1, 0.68, 1] as [number, number, number, number],
  spring: [0.16, 1, 0.3, 1] as [number, number, number, number],
  "ease-out": [0, 0, 0.2, 1] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
};

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
  easing?: "smooth" | "spring" | "ease-out" | "bounce";
  /** Intersection Observer threshold (0-1) */
  threshold?: number;
  /** Root margin for Intersection Observer */
  rootMargin?: string;
  /** Whether to trigger animation only once */
  once?: boolean;
  /** Enable debug mode to visualize trigger state */
  debug?: boolean;
  /** Skip viewport detection - animate immediately */
  animateImmediately?: boolean;
}

// Memoized item component to prevent unnecessary re-renders
const StaggeredItem = React.memo(({
  children,
  index,
  isVisible,
  delay,
  staggerDelay,
  duration,
  distance,
  easing,
}: {
  children: React.ReactNode;
  index: number;
  isVisible: boolean;
  delay: number;
  staggerDelay: number;
  duration: number;
  distance: number;
  easing: [number, number, number, number];
}) => {
  const itemDelay = delay + index * staggerDelay;

  return (
    <motion.div
      className="relative"
      initial={{ clipPath: "inset(50% 0% 0% 0%)" }}
      animate={
        isVisible
          ? { clipPath: "inset(0% 0% 0% 0%)" }
          : { clipPath: "inset(20% 0% 0% 0%)" }
      }
      transition={{
        duration,
        delay: itemDelay,
        ease: easing,
      }}
    >
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
        style={{
          willChange: "transform, opacity",
          transform: "translateZ(0)", // Force GPU layer
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
});

StaggeredItem.displayName = "StaggeredItem";

const StaggeredSlideUp: React.FC<StaggeredSlideUpProps> = ({
  children,
  className = "",
  delay = 0.1,
  staggerDelay = 0.06,
  duration = 0.4,
  distance = 10,
  easing = "spring",
  threshold = 0.15,
  rootMargin = "0px 0px -10px 0px",
  once = true,
  debug = false,
  animateImmediately = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId(); // Unique ID to prevent animation conflicts

  // Single source of truth for viewport detection
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: rootMargin as `${number}px ${number}px ${number}px ${number}px`,
  });

  // Determine if animation should be active
  const shouldAnimate = animateImmediately || isInView;

  // Convert children to array for mapping
  const childArray = React.Children.toArray(children);

  // Get the easing curve
  const easingCurve = EASING_MAP[easing];

  return (
    <div ref={ref} className={className} data-stagger-id={id}>
      {debug && (
        <div
          className={`fixed top-4 right-4 z-50 px-3 py-1 rounded text-xs font-mono ${shouldAnimate ? "bg-green-500" : "bg-red-500"
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
          duration={duration}
          distance={distance}
          easing={easingCurve}
        >
          {child}
        </StaggeredItem>
      ))}
    </div>
  );
};

export default StaggeredSlideUp;