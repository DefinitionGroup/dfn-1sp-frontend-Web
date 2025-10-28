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
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
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
      <AnimateNumber format={format} transition={transition} suffix={suffix}>
        {animateNumberValue}
      </AnimateNumber>
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
          font-size: 128px;
          letter-spacing: -0.014rem; /* match Plaintext */
          font-weight: 300;
          font-variation-settings: "opsz" 30, "wght" 530;
        }

        .number-section-post {
          font-size: 12px; /* match Plaintext */
          opacity: 1; /* match Plaintext */
          color: var(--color-lime-500); /* match Plaintext */
          position: relative;
          bottom: 5px; /* match Plaintext */
          align-self: flex-end;
          margin-left: 5px;
          letter-spacing: -0.02em;
        }
    `}</style>
  );
};
