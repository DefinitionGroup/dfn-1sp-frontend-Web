"use client";

import React, { useRef, useId } from "react";
import { motion, useInView } from "motion/react";

const EASING_MAP = {
  smooth: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
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
  variants,
  index,
}: {
  children: React.ReactNode;
  variants: any;
  index: number;
}) => (
  <div className="relative overflow-hidden">
    <motion.div
      variants={variants}
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)", // Force GPU layer
      }}
    >
      {children}
    </motion.div>
  </div>
));

StaggeredItem.displayName = "StaggeredItem";

const StaggeredSlideUp: React.FC<StaggeredSlideUpProps> = ({
  children,
  className = "",
  delay = 0.1,
  staggerDelay = 0.06,
  duration = 0.4,
  distance = 20,
  easing = "spring",
  threshold = 0.15,
  rootMargin = "0px 0px -30px 0px",
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

  // Determine if we should animate
  const shouldAnimate = animateImmediately || isInView;

  // Memoize variants to prevent recreation on each render
  const containerVariants = React.useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }),
    [delay, staggerDelay]
  );

  const itemVariants = React.useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: distance,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          ease: EASING_MAP[easing],
        },
      },
    }),
    [distance, duration, easing]
  );

  // Normalize children to array
  const childArray = React.useMemo(() => {
    if (!children) return [];
    return Array.isArray(children) ? children : [children];
  }, [children]);

  if (childArray.length === 0) {
    return <div className={className} />;
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      style={debug ? { border: "2px dashed red", padding: "4px" } : undefined}
    >
      {debug && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 z-50">
          ID: {id.slice(0, 6)} | InView: {isInView ? "Y" : "N"}
        </div>
      )}
      {childArray.map((child, index) => (
        <StaggeredItem
          key={`${id}-${index}`}
          variants={itemVariants}
          index={index}
        >
          {child}
        </StaggeredItem>
      ))}
    </motion.div>
  );
};

export default StaggeredSlideUp;