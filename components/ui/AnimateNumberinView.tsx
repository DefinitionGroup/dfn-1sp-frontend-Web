"use client";

import { useState, useEffect, useRef } from "react";
import { useRobustInView } from "@/hooks/use-robust-in-view";
import AnimatedNumberText from "./AnimatedNumberText";

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
  const ref = useRef<HTMLDivElement | null>(null);
  const { isInView } = useRobustInView(ref, {
    amount: 0.1,
    margin: "0px 0px 120px 0px",
  });
  const [animateNumberValue, setAnimateNumberValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const targetNumber =
        typeof number === "string" ? parseInt(number, 10) || 0 : number;
      const timeoutId = setTimeout(
        () => setAnimateNumberValue(targetNumber),
        delay
      );
      return () => clearTimeout(timeoutId);
    }
  }, [isInView, number, delay]);

  return (
    <div ref={ref} className={className}>
      <AnimatedNumberText
        value={animateNumberValue}
        format={format}
        duration={transition?.duration ?? 1.5}
        suffix={suffix}
      />
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
          gap: 12px;
        }

        .number {
          font-size: 48px;
          letter-spacing: -0.014rem;
          font-weight: 300;
          font-variation-settings: "opsz" 30, "wght" 530;
        }

        .number-section-post {
          font-size: 48px;
          opacity: 1;
          color: var(--color-lime-500);
          position: relative;
          bottom: 0px;
          align-self: flex-end;
          margin-left: 3px;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .price-switcher {
            gap: 20px;
          }

          .number {
            font-size: 96px;
          }

          .number-section-post {
            font-size: 96px;
            margin-left: 5px;
          }
        }
    `}</style>
  );
};
