"use client";
import { AnimateNumber } from "motion-plus/react";
import { motion, useInView, useSpring } from "motion/react";
import * as React from "react";

interface CircularDashedGaugeProps {
  percentage?: number; // 0-100, defaults to 75; 0% -> 0°, 100% -> 360°
  size?: number; // Size in pixels, defaults to 200
  strokeWidth?: number; // Stroke width, defaults to 10
  dashLength?: number; // Length of each dash, defaults to 10
  gapLength?: number; // Length of gap between dashes, defaults to 5
}

export default function CircularDashedGauge({
  percentage = 75,
  size = 200,
  strokeWidth = 12,
  dashLength =1,
  gapLength = 1,
}: CircularDashedGaugeProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true }); // Trigger once when in view

  const [displayValue, setDisplayValue] = React.useState(0);

  // Circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const effectiveDashLength = Math.max(dashLength, 10); // Ensure at least 10px
  const dashSpacing = effectiveDashLength + gapLength;
  // const numDashes = Math.floor(circumference / dashSpacing);
  const numDashes = 90

  // Clamp and map percentage to angle: 0% -> 0°, 100% -> 360°
  const safePercentage = Math.max(0, Math.min(100, percentage ?? 0));
  const targetAngle = (safePercentage / 100) * 360;

  // Spring animation for rotation (start from 0° and animate to target when in view)
  const rotation = useSpring(0, { stiffness: 50, damping: 75, mass: 75,});
elocity:
  React.useEffect(() => {
    if (isInView) {
      rotation.set(targetAngle);
      setDisplayValue(percentage);
    }
  }, [isInView, targetAngle, rotation, percentage]);

  // Generate dash lines (radial from 80% to 100% of radius for better visibility)
  const dashes = [];
  for (let i = 0; i < numDashes; i++) {
    const angle = (i / numDashes) * 360;
    const rad = (angle * Math.PI) / 180;
    const startRadius = (i % 5 === 4) ? 0.65 * radius : 0.7 * radius;
    const endRadius = (i === numDashes - 1) ? 0.75 * radius : 0.75 * radius;
    const x1 = size / 2 + startRadius * Math.cos(rad);
    const y1 = size / 2 + startRadius * Math.sin(rad);
    const x2 = size / 2 + endRadius * Math.cos(rad);
    const y2 = size / 2 + endRadius * Math.sin(rad);
    dashes.push({ x1, y1, x2, y2 });
  }

  // Number of progress dashes
  const numProgressDashes = Math.ceil((safePercentage / 100) * numDashes);

  // Position for text at 3 o'clock (0 degrees)
  const textX = size / 2 + radius * Math.cos(0); // cos(0) = 1
  const textY = size / 2 + radius * Math.sin(0); // sin(0) = 0

  return (
    <div
      ref={ref}
      className="flex items-center justify-centerrounded-xs border border-lime-500 overflow-hidden relative"
      style={{ width: size, height: size }}
    >
      <motion.svg width={size} height={size} className="absolute top-20 " style={{ rotate: rotation, transformOrigin: "50% 50%", transformBox: "fill-box",}}  >
        {/* Background dashed lines (static) */}
        {dashes.map((dash, i) => (
          <motion.line
            key={`bg-${i}`}
            x1={dash.x1}
            y1={dash.y1}
            x2={dash.x2}
            y2={dash.y2}
            stroke="currentColor"
            strokeWidth={1}
            strokeLinecap="butt"
            className="text-neutral-300"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.1 }}
          />
        ))}
  {/* Rotating progress group from 0° to target angle once in view */}
  <motion.g >
          {/* Progress dashed lines */}
          {dashes.slice(0, numProgressDashes).map((dash, i) => {
            const angle = (i / numDashes) * 360;
            const rad = (angle * Math.PI) / 180;
            const endRadiusForThis = (i === numProgressDashes - 1) ? radius : 0.8* radius;
            const x2 = size / 2 + endRadiusForThis * Math.cos(rad);
            const y2 = size / 2 + endRadiusForThis * Math.sin(rad);
            return (
              <motion.line
                key={`progress-${i}`}
                x1={dash.x1}
                y1={dash.y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-lime-500"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01, duration: 0.2 }}
              />
            );
          })}
        </motion.g>
        {/* Text indicator at 3 o'clock (static) */}
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-neutral-800 text-lg font-bold"
        >

        </text>
      </motion.svg>

      <div className="absolute top-2 right-15 font-bold  text-lime-500 ">
        <AnimateNumber
        className="number  p-4 min-w-16 "
          format={{ minimumIntegerDigits: 1, minimumFractionDigits: 0, maximumFractionDigits: 0 }} suffix=" %"
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {displayValue}
        </AnimateNumber>
        <StyleSheet />
      </div>
    </div>
  );
}


const StyleSheet = () => {
    return (
        <style>{`


        .number {
            font-size: 48px;
            letter-spacing: -0.04em;
            font-weight: 100;
            font-variation-settings: "opsz" 30, "wght" 530;
        }

        .number-section-post {
            font-size: 12px; font-weight: bold;
            opacity: 1;
            position: relative;
        }

    `}</style>
    )
}
