"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE_FLZR = [0.62, 0.05, 0.01, 0.99] as const;

type AnimatedEditorialHeadlineProps = {
  text: string;
  delay?: number;
};

export default function AnimatedEditorialHeadline({
  text,
  delay = 0.35,
}: AnimatedEditorialHeadlineProps) {
  const prefersReducedMotion = useReducedMotion();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <h1
      aria-label={lines.join(" ")}
      className="mx-auto max-w-[15ch] text-balance font-aspekta text-[clamp(2.5rem,2rem+4vw,6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[var(--color-flzr-violet)]"
    >
      <span aria-hidden="true">
        {lines.map((line, index) => (
          <span
            key={`${line}-${index}`}
            className="block overflow-hidden pb-[0.08em]"
          >
            <motion.span
              className="block"
              initial={
                prefersReducedMotion ? false : { transform: "translateY(105%)" }
              }
              animate={{ transform: "translateY(0%)" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.7,
                delay: prefersReducedMotion ? 0 : delay + index * 0.09,
                ease: EASE_FLZR,
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </span>
    </h1>
  );
}
