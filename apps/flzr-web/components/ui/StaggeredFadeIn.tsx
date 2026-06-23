import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRobustInView } from "@1sp/utils/hooks/use-robust-in-view";

interface StaggeredFadeInProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  triggerOnView?: boolean;
  viewThreshold?: number;
  once?: boolean;
  animate?: "visible" | "hidden";
}

const StaggeredFadeIn: React.FC<StaggeredFadeInProps> = ({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.15,
  duration = 0.6,
  direction = "up",
  distance = 20,
  triggerOnView = true,
  viewThreshold = 0.05,
  once = true,
  animate,
}) => {
  const ref = React.useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { isInView } = useRobustInView(ref, {
    amount: viewThreshold,
    once,
  });
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
      default:
        return { x: 0, y: 0 };
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      ...(prefersReducedMotion ? { x: 0, y: 0 } : getInitialPosition()),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : duration,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Custom easing for smooth animation
      },
    },
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={
        animate !== undefined
          ? animate
          : prefersReducedMotion
            ? "visible"
          : triggerOnView
            ? isInView
              ? "visible"
              : "hidden"
            : "visible"
      }
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={itemVariants} className="w-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredFadeIn;
