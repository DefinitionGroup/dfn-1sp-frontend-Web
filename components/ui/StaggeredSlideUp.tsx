"use client";

import React, { useRef } from "react";
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
  /** Height of the reveal mask */
  maskHeight?: string;
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

const StaggeredSlideUp: React.FC<StaggeredSlideUpProps> = ({
  children,
  className = "",
  delay = 0.1,
  staggerDelay = 0.08,
  duration = 0.5,
  distance = 24,
  maskHeight = "120%",
  easing = "spring",
  threshold = 0.2,
  rootMargin = "0px 0px -50px 0px",
  once = true,
  debug = false,
  animateImmediately = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Single source of truth for viewport detection
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: rootMargin as `${number}px ${number}px ${number}px ${number}px`,
  });

  // Determine if we should animate
  const shouldAnimate = animateImmediately || isInView;

  const containerVariants = React.useMemo(
    () => ({
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
          when: "beforeChildren" as const,
        },
      },
    }),
    [delay, staggerDelay]
  );

  const itemVariants = React.useMemo(
    () => ({
      hidden: { opacity: 0, y: distance },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, ease: EASING_MAP[easing] },
      },
    }),
    [distance, duration, easing]
  );

  const maskVariants = React.useMemo(
    () => ({
      hidden: { y: 0 },
      visible: {
        y: `-${maskHeight}`,
        transition: {
          duration: duration * 0.8,
          ease: EASING_MAP[easing],
          delay: 0.05,
        },
      },
    }),
    [maskHeight, duration, easing]
  );

  // Handle single child or no children
  if (!Array.isArray(children) || children.length === 0) {
    if (!Array.isArray(children) && children) {
      return (
        <motion.div
          ref={ref}
          className={`relative ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate={shouldAnimate ? "visible" : "hidden"}
          style={
            debug ? { border: "2px dashed red", padding: "4px" } : undefined
          }
        >
          {debug && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 z-50">
              InView: {isInView ? "Y" : "N"}
            </div>
          )}
          <div className="relative overflow-hidden">
            <motion.div variants={itemVariants} className="relative z-10">
              {children}
            </motion.div>
            <motion.div
              variants={maskVariants}
              className="absolute inset-0 z-20 pointer-events-none"
              style={{ height: maskHeight }}
            />
          </div>
        </motion.div>
      );
    }
    return <div className={className}></div>;
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
          InView: {isInView ? "Y" : "N"}
        </div>
      )}
      {children.map((child, index) => (
        <div key={index} className="relative overflow-hidden">
          <motion.div variants={itemVariants} className="relative z-10">
            {child}
          </motion.div>
          <motion.div
            variants={maskVariants}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ height: maskHeight }}
          />
        </div>
      ))}
    </motion.div>
  );
};

export default StaggeredSlideUp;
