"use client";

import React from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";

interface GridBackgroundProps {
  className?: string;
  columns?: number;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  viewport?: {
    once?: boolean;
    amount?: number;
  };
}

const GridBackground: React.FC<GridBackgroundProps> = ({
  className = "",
  columns = 12,
  delay = 0,
  staggerDelay = 0.08,
  duration = 0.6,
  viewport = { once: true, amount: 0.1 },
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, viewport);

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
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  const columnVariants = {
    hidden: {
      opacity: 0,
      scaleY: 0,
    },
    visible: {
      opacity: 0.4,
      scaleY: 1,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`z-0 grid col-span-12 col-start-1 row-start-1 grid-cols-12 gap-4   divide-x border-x border-x-dashed border-neutral-300 divide-dashed  ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}>
      {Array.from({ length: columns }, (_, index) => (
        <motion.div
          key={index}
          className="col-span-1 relative origin-top "
          variants={columnVariants}
        />
      ))}
    </motion.div>
  );
};

export default GridBackground;
