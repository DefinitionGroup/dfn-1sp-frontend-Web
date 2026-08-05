"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";

const DISCLOSURE_TEXT = "This website includes AI-generated content.";
const HIDE_AFTER_SCROLL = 256;
const STAGE_DURATION = 0.2;

export default function AiContentDisclosure() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(scrollY.get() <= HIDE_AFTER_SCROLL);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextIsVisible = latest <= HIDE_AFTER_SCROLL;
    setIsVisible((currentIsVisible) =>
      currentIsVisible === nextIsVisible ? currentIsVisible : nextIsVisible
    );
  });

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
      role="note"
      aria-hidden={!isVisible}
      className="pointer-events-none fixed left-1/2 top-3 z-[80] flex max-w-[11rem] -translate-x-1/2 items-center gap-2 px-2 py-1.5 font-aspekta text-neutral-950 xl:left-auto xl:right-[max(1.5rem,env(safe-area-inset-right))] xl:top-[max(1.5rem,env(safe-area-inset-top))] xl:translate-x-0"
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, transform: "scaleX(0)" }}
        animate={
          isVisible
            ? { opacity: 1, transform: "scaleX(1)" }
            : { opacity: 0, transform: "scaleX(0)" }
        }
        transition={transitionFor(isVisible ? 0 : STAGE_DURATION * 2)}
        className="absolute inset-0 rounded-full bg-white/80 shadow-[0_1px_12px_rgba(0,0,0,0.08)] backdrop-blur-md"
        style={{ transformOrigin: "center" }}
      />

      <motion.div
        initial={{ opacity: 0, transform: "scale(0.7)" }}
        animate={
          isVisible
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
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={transitionFor(isVisible ? STAGE_DURATION * 2 : 0)}
        className="relative z-10 text-[9px] font-medium leading-[1.15] tracking-[0.02em]"
      >
        {DISCLOSURE_TEXT}
      </motion.p>
    </aside>
  );
}
