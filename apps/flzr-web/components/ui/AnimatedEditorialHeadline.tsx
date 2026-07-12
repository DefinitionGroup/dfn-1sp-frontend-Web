"use client";

import { motion, useReducedMotion } from "motion/react";
import GradientText from "./GradientText";

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
  const headline = text.trim();

  if (!headline) return null;

  return (
    <motion.h1
      className="mx-auto max-w-[20ch] text-balance whitespace-pre-line font-aspekta text-[clamp(1.9rem,1.4rem+2.6vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.025em]"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.7,
        delay: prefersReducedMotion ? 0 : delay,
        ease: EASE_FLZR,
      }}
    >
      <GradientText
        colors={["#7c5cff", "#d6ccff", "#ffffff", "#9d85ff", "#7c5cff"]}
        animationSpeed={4}
        direction="horizontal"
        pauseOnHover={false}
        yoyo={true}
        showBorder={false}
      >
        {headline}
      </GradientText>
    </motion.h1>
  );
}
