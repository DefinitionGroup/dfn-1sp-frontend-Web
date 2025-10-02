"use client";

import { motion, Variants } from "motion/react";

export default function AnimatedPathIcon({
  delay = 0,
  duration = 1.5,
  strokeColor = "white",
  strokeWidth = 1,
}: {
  delay?: number;
  duration?: number;
  strokeColor?: string;
  strokeWidth?: number;
}) {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const customDelay = i * 0.5 + delay;
      return {
        pathLength: 1.2,
        opacity: 1,
        transition: {
          pathLength: {
            delay: customDelay,
            type: "spring",
            duration,
            bounce: 0,
          },
          opacity: { delay: customDelay, duration: 0.01 },
        },
      };
    },
  };

  return (
    <motion.svg
      initial="hidden"
      animate="visible"
      style={image}
      viewBox="0 0 20 23"
      fill="none"
      className={"w-8 h-8"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="9.88574"
        cy="12.6211"
        r="9.16895"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        custom={1}
        stroke-linecap="round"
        variants={draw}
      />
      <motion.line
        x1="10.2197"
        y1="12.3437"
        x2="14.9804"
        y2="7.58301"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        stroke-linecap="round"
        custom={2}
        variants={draw}
      />
      <motion.line
        x1="6.48633"
        y1="0.550781"
        x2="13.2189"
        y2="0.550781"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        stroke-linecap="round"
        variants={draw}
      />
    </motion.svg>
  );
}

/**
 * ==============   Styles   ================
 */

const image: React.CSSProperties = {
  maxWidth: "80vw",
};

const shape: React.CSSProperties = {
  strokeWidth: 10,
  strokeLinecap: "round",
  fill: "transparent",
};
