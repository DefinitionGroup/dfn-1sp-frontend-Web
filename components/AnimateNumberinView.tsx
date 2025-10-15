"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { AnimateNumber } from "motion-plus/react";

interface AnimateNumberinViewProps {
  number: string | number;
  className?: string;
  delay?: number;
  format?: { minimumIntegerDigits?: number };
  transition?: any;
  suffix?: string;
}

export default function AnimateNumberinView({
  number,
  className = "",
  delay = 200,
  format = { minimumIntegerDigits: 3 },
  suffix = "",
  transition = { duration: 1.5, ease: "easeOut" },
}: AnimateNumberinViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [animateNumberValue, setAnimateNumberValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Convert number to number for animation
      const targetNumber =
        typeof number === "string" ? parseInt(number, 10) || 0 : number;

      // Delay the animation
      const timeoutId = setTimeout(() => {
        setAnimateNumberValue(targetNumber);
      }, delay);

      // Cleanup timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [isInView, number, delay]);

  return (
    <div ref={ref} className={className}>
      <AnimateNumber format={format} transition={transition} suffix={suffix}>
        {animateNumberValue}
      </AnimateNumber>{" "}
      <StyleSheet />
    </div>
  );
}
const StyleSheet = () => {
  return (
    <style>{`
        .price-switcher {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .number {
            font-size:128px;
            letter-spacing: -0.04em;
            font-weight: 300;
            font-variation-settings: "opsz" 30, "wght" 530;
        }

        .number-section-post {
            font-size:20px;
            opacity: 0.5;
            position: relative;
            bottom: 15px;
            align-self: flex-end;
            margin-left: 5px;
            letter-spacing: -0.02em;
        }

        .switch {
            display: flex;
            gap: 10px;
            padding: 6px;
            border-radius: 100px;
            background-color: rgba(255, 255, 255, 0.05);
        }

        .switch button {
            position: relative;
            padding: 8px 12px;
            display: flex;
        }

        .switch button span {
            z-index: 2;
            position: relative;
            color: var(--text);
            will-change: opacity;
            font-size: 13px;
            line-height: 1;
            font-variation-settings: "opsz" 20, "wght" 590;
        }

        .switch .selected {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #f5f5f5;
            will-change: transform;
        }
    `}</style>
  );
};
