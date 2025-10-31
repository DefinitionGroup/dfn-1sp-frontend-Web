"use client";

import { Rotate3D } from "lucide-react";
import { motion, Variants } from "motion/react";

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.5;
    return {
      pathLength: 1.2,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

export default function PathDrawingViewIcon() {
  return (
    <motion.svg
      initial="hidden"
      animate="visible"
      style={image}
      viewBox="0 0 20 23"
      fill="none"
      className={"w-10 h-10"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="9.88574"
        cy="12.6211"
        r="9.16895"
        stroke="white"
        custom={1}
        stroke-linecap="round"
        variants={draw}
      />
      <motion.line
        x1="10.2197"
        y1="12.3437"
        x2="14.9804"
        y2="7.58301"
        stroke="white"
        stroke-linecap="round"
        custom={2}
        variants={draw}
      />
      <motion.line
        x1="6.48633"
        y1="0.550781"
        x2="13.2189"
        y2="0.550781"
        stroke="white"
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
