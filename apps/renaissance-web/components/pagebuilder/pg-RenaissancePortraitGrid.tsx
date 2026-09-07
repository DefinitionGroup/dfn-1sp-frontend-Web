"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { RenaissancePortraitGrid as RenaissancePortraitGridData } from "@1sp/sanity-types";
import { resolveRenaissanceMediaItems } from "@renaissance/lib/renaissanceMediaItems";

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.04, staggerChildren: 0.08 },
  },
};

const portraitVariants: Variants = {
  hidden: { opacity: 0, y: 24, clipPath: "inset(10% 0 0 0)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function RenaissancePortraitGrid({
  data,
}: {
  data: RenaissancePortraitGridData;
}) {
  const portraits = resolveRenaissanceMediaItems(data.portraits).slice(0, 5);
  const shouldReduceMotion = useReducedMotion();

  if (portraits.length === 0) return null;

  const announcedSources = new Set<string>();

  return (
    <div
      className="relative py-4"
      data-component="renaissance-portrait-grid"
    >
      <Image
        src="/renaissance/figma/people-bolt.svg"
        alt=""
        width={1271}
        height={1049}
        aria-hidden="true"
        className="pointer-events-none absolute -right-[18%] top-[6%] h-auto w-[86%] max-w-none opacity-95"
      />

      <motion.div
        className="relative mx-auto grid max-w-[1680px] grid-cols-2 gap-3 px-5 sm:px-8 md:grid-cols-5 md:gap-5 lg:px-12"
        variants={gridVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.16 }}
      >
        {portraits.map((portrait) => {
          const isDuplicate = announcedSources.has(portrait.src);
          announcedSources.add(portrait.src);

          return (
            <motion.figure
              key={portrait.key}
              aria-hidden={isDuplicate || undefined}
              variants={shouldReduceMotion ? undefined : portraitVariants}
              className="relative aspect-[0.78] overflow-hidden bg-renaissance-accent"
            >
              <Image
                src={portrait.src}
                alt={isDuplicate ? "" : portrait.name}
                fill
                sizes="(max-width: 767px) 50vw, 20vw"
                unoptimized={
                  portrait.src.startsWith("https://") &&
                  !portrait.src.startsWith("https://res.cloudinary.com/")
                }
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.025] motion-reduce:transition-none"
              />
            </motion.figure>
          );
        })}
      </motion.div>
    </div>
  );
}
