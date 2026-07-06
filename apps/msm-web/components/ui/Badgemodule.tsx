"use client";

// MSM badge, redesigned (Martin + Claude, July 2026):
// - the MSM cube mark as a living SVG (facets ambient-flip like the
//   MosaicButton tiles) instead of the count-up number
// - frameless: no borders, no background — the corner markers define the
//   field (Vast blueprint grammar, same pattern as the hero)
// The public API is kept compatible with the root Badgemodule: `numberEl`
// and `variant` are accepted but no longer rendered.

import { motion } from "motion/react";
import { cn } from "@1sp/utils/cn";
import { useRef } from "react";
import { useRobustInView } from "@1sp/utils/hooks/use-robust-in-view";
import CornerMarkers from "./CornerMarkers";
import MsmLogoAnimated from "./MsmLogoAnimated";

interface BadgemoduleProps {
  text: string;
  subtitle: string;
  /** Legacy prop from the root badge — intentionally not rendered. */
  numberEl?: string | number;
  className?: string;
  /** Legacy prop from the root badge — the MSM badge is always frameless. */
  variant?: "default" | "minimal" | "glass";
  size?: "sm" | "md" | "lg";
}

const VAST_BEZIER: [number, number, number, number] = [0.62, 0.05, 0.01, 0.99];

export default function Badgemodule({
  text,
  subtitle,
  className,
  size = "md",
}: BadgemoduleProps) {
  const ref = useRef(null);
  const { isInView } = useRobustInView(ref, {
    amount: 0.1,
    margin: "0px 0px 120px 0px",
  });

  const sizes = {
    sm: { logo: 32, text: "text-base md:text-sm lg:text-base", pad: "p-3 md:p-4" },
    md: { logo: 44, text: "text-lg md:text-lg lg:text-xl", pad: "p-4 md:p-5" },
    lg: { logo: 60, text: "text-xl md:text-xl lg:text-2xl", pad: "p-5 md:p-6" },
  }[size];

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative",
        // mobile: logo + copy in a row; md+: stacked in a square field
        "flex flex-row items-center gap-3",
        "md:flex-col md:items-start md:justify-between md:gap-0",
        "md:aspect-square md:min-w-[110px]",
        sizes.pad,
        className
      )}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: VAST_BEZIER,
            staggerChildren: 0.15,
            delayChildren: 0.1,
          },
        },
      }}
    >
      <CornerMarkers className="text-white/30 text-xs" inset="0.25rem" />

      {/* Living MSM mark (replaces the count-up number) */}
      <motion.div
        className="shrink-0"
        variants={{
          hidden: { opacity: 0, scale: 0.9 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: VAST_BEZIER },
          },
        }}
      >
        <MsmLogoAnimated size={sizes.logo} />
      </motion.div>

      <div className="flex flex-col gap-1 md:mt-auto md:pt-4">
        <motion.p
          className={cn(
            "font-medium tracking-tight text-neutral-50",
            sizes.text
          )}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: VAST_BEZIER },
            },
          }}
        >
          {text}
        </motion.p>

        {subtitle && (
          <motion.div
            className="eyebrow text-neutral-400 text-[10px] md:text-xxs"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { duration: 0.4, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            {subtitle}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
