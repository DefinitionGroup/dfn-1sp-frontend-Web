"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const DISCLOSURE_TEXT = "This website includes AI-generated content.";
const STAGE_DURATION = 0.2;

export default function AiContentDisclosure() {
  const disclosureRef = useRef<HTMLElement>(null);
  const isInView = useInView(disclosureRef, { amount: 0.5, once: true });
  const shouldReduceMotion = useReducedMotion();

  const transitionFor = (delay: number) =>
    shouldReduceMotion
      ? { duration: 0, delay: 0 }
      : {
          duration: STAGE_DURATION,
          delay,
          ease: [0.4, 0, 0.2, 1] as const,
        };

  return (
    <aside
      ref={disclosureRef}
      role="note"
      aria-hidden={!isInView}
      className="pointer-events-none relative flex max-w-[11rem] shrink-0 items-center gap-2 px-2 py-1.5 font-aspekta text-neutral-950"
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, transform: "scaleX(0)" }}
        animate={
          isInView
            ? { opacity: 1, transform: "scaleX(1)" }
            : { opacity: 0, transform: "scaleX(0)" }
        }
        transition={transitionFor(0)}
        className="absolute inset-0 rounded-full bg-white/80 shadow-[0_1px_12px_rgba(0,0,0,0.08)] backdrop-blur-md"
        style={{ transformOrigin: "center" }}
      />

      <motion.div
        initial={{ opacity: 0, transform: "scale(0.7)" }}
        animate={
          isInView
            ? { opacity: 1, transform: "scale(1)" }
            : { opacity: 0, transform: "scale(0.7)" }
        }
        transition={transitionFor(STAGE_DURATION)}
        className="relative z-10 size-6 shrink-0"
      >
        <Image
          src="/ci/ai-generated-content.svg"
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className="size-6"
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={transitionFor(STAGE_DURATION * 2)}
        className="relative z-10 text-[9px] font-medium leading-[1.15] tracking-[0.02em]"
      >
        {DISCLOSURE_TEXT}
      </motion.p>
    </aside>
  );
}
