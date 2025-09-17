import React from "react";
import { motion } from "motion/react";

interface StaggeredFadeInProps {
  children: React.ReactNode[];
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

const StaggeredFadeIn: React.FC<StaggeredFadeInProps> = ({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.15,
  duration = 0.6,
  direction = "up",
  distance = 20,
}) => {
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
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Custom easing for smooth animation
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants} className="w-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredFadeIn;
