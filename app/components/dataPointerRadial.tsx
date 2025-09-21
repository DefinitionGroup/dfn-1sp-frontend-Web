"use client";

import { motion, useInView, useSpring } from "motion/react";
import * as React from "react";

interface CircularProgressIndicatorProps {
  percentage?: number; // 0-100, defaults to 75
  size?: number; // Size in pixels, defaults to 200
  strokeWidth?: number; // Stroke width, defaults to 10
}

export default function CircularProgressIndicator({
  percentage = 75,
  size = 200,
  strokeWidth = 10,
}: CircularProgressIndicatorProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true }); // Trigger once when in view

  // Circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate dash offset for the percentage
  const targetOffset = circumference - (percentage / 100) * circumference;

  // Spring animation for smooth progress
  const strokeDashoffset = useSpring(circumference, { stiffness: 100, damping: 20 });

  React.useEffect(() => {
    if (isInView) {
      strokeDashoffset.set(targetOffset);
    }``
  }, [isInView, strokeDashoffset, targetOffset]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-100"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-lime-500"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // Start from top
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-neutral-800 text-2xl font-bold"
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}
