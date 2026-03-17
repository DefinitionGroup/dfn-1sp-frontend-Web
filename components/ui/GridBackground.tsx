"use client";

import React from "react";
import { motion } from "motion/react";
import { useRobustInView } from "@/hooks/use-robust-in-view";

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
  const { isInView } = useRobustInView(ref, {
    once: viewport.once,
    amount: viewport.amount,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
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
      className={`z-0 hidden md:grid col-span-12 col-start-1 row-start-1 grid-cols-6  divide-x border-x  border-neutral-100 divide divide-neutral-200/50 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {Array.from({ length: columns }, (_, index) => (
        <motion.div
          key={index}
          className="col-span-2 md:col-span-1 relative origin-top "
          variants={columnVariants}
        />
      ))}
    </motion.div>
  );
};

export default GridBackground;
