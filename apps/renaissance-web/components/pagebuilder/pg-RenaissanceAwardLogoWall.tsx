"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { RenaissanceAwardLogoWall as RenaissanceAwardLogoWallData } from "@1sp/sanity-types";
import { resolveRenaissanceMediaItems } from "@renaissance/lib/renaissanceMediaItems";

const wallVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.12, staggerChildren: 0.055 },
  },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 8 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function RenaissanceAwardLogoWall({
  data,
}: {
  data: RenaissanceAwardLogoWallData;
}) {
  const logos = resolveRenaissanceMediaItems(data.logos);
  const shouldReduceMotion = useReducedMotion();

  if (!data.headline?.trim() && logos.length === 0) return null;

  const announcedSources = new Set<string>();

  return (
    <div
      className="relative mx-auto max-w-[1680px] px-5 pb-20 pt-12 sm:px-8 md:pb-28 md:pt-20 lg:px-12"
      data-component="renaissance-award-logo-wall"
    >
      {logos.length > 0 ? (
        <motion.div
          aria-hidden="true"
          className="h-px w-full origin-left bg-renaissance-signal"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          whileInView={shouldReduceMotion ? undefined : { scaleX: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : null}

      {data.headline?.trim() ? (
        <motion.h3
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={
            shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
          }
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
          className={`renaissance-display mx-auto text-center text-[clamp(2.7rem,3.3vw,3.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.025em] text-renaissance-signal ${
            logos.length > 0 ? "mt-12 md:mt-16" : ""
          }`}
        >
          {data.headline}
        </motion.h3>
      ) : null}

      {logos.length > 0 ? (
        <motion.div
          className="mt-10 grid grid-cols-3 items-center gap-3 sm:grid-cols-4 md:grid-cols-8 md:gap-4"
          variants={wallVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.2 }}
        >
          {logos.map((logo) => {
            const isDuplicate = announcedSources.has(logo.src);
            announcedSources.add(logo.src);

            return (
              <motion.div
                key={logo.key}
                variants={shouldReduceMotion ? undefined : logoVariants}
                className="relative aspect-square overflow-hidden rounded-[3px] bg-white p-3 md:p-5"
              >
                <Image
                  src={logo.src}
                  alt={isDuplicate ? "" : logo.name}
                  fill
                  sizes="(max-width: 639px) 33vw, (max-width: 767px) 25vw, 160px"
                  unoptimized={
                    logo.src.startsWith("https://") &&
                    !logo.src.startsWith("https://res.cloudinary.com/")
                  }
                  className="object-contain p-3 md:p-5"
                />
              </motion.div>
            );
          })}
        </motion.div>
      ) : null}
    </div>
  );
}
