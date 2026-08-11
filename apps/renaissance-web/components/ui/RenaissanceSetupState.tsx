"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.62, 0.05, 0.01, 0.99] as const;

export default function RenaissanceSetupState() {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.75;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-white text-renaissance-ink">
      <motion.div
        aria-hidden="true"
        className="absolute -right-[24vw] -top-[34vw] h-[76vw] w-[76vw] rounded-full bg-[radial-gradient(circle,rgba(0,141,167,0.18)_0%,rgba(0,141,167,0.07)_34%,transparent_68%)]"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: duration + 0.35, ease: EASE }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[18vh] h-px origin-left bg-gradient-to-r from-transparent via-renaissance-accent/55 to-transparent"
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: duration + 0.2, delay: reduceMotion ? 0 : 0.18, ease: EASE }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1480px] flex-col justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: EASE }}
        >
          <Image
            src="/logos/renaissance-horz_logo.svg"
            alt="Renaissance"
            width={2862}
            height={594}
            priority
            className="h-auto w-[clamp(11rem,24vw,22rem)]"
          />
        </motion.div>

        <div className="max-w-[66rem] pb-[18vh] pt-20">
          <motion.h1
            className="renaissance-headline max-w-[12ch] text-balance text-[clamp(3.3rem,9.2vw,6rem)] leading-[0.9] text-renaissance-accent"
            initial={reduceMotion ? false : { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: duration + 0.15, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
          >
            Renaissance
          </motion.h1>
          <motion.p
            className="renaissance-body mt-7 max-w-[38rem] text-balance text-lg text-neutral-700 sm:text-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay: reduceMotion ? 0 : 0.24, ease: EASE }}
          >
            Website content is being prepared.
          </motion.p>
        </div>

        <motion.p
          className="renaissance-label flex items-center gap-3 text-sm text-neutral-700"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration, delay: reduceMotion ? 0 : 0.4, ease: EASE }}
        >
          <span aria-hidden="true" className="status-dot" />
          English site foundation
        </motion.p>
      </div>
    </main>
  );
}
