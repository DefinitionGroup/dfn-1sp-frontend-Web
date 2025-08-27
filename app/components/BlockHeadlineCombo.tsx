"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * BlockHeadlineCombo
 * A block-style headline component with distinctive background treatment and enhanced visual hierarchy.
 * Designed for section intros with more visual weight than TextHeadlineCombo.
 * Features background blocks, enhanced spacing, and optional decorative elements.
 */

export interface BlockHeadlineComboProps {
  eyebrow?: string; // Small uppercase label
  headline: React.ReactNode; // Main heading (may contain JSX)
  highlight?: string; // Optional word appended + highlighted
  subhead?: React.ReactNode; // Supporting line below headline
  kicker?: React.ReactNode; // Small line beneath subhead (CTA hint / meta)
  align?: "left" | "center" | "right";
  size?: "xl" | "lg" | "md" | "sm";
  variant?: "default" | "contained" | "outlined" | "gradient"; // Visual style variants
  background?: boolean; // Add background block treatment
  decorative?: boolean; // Add decorative elements
  animate?: boolean; // Disable animations if false
  clamp?: number; // Line clamp for subhead
  spacing?: "tight" | "normal" | "loose"; // Vertical spacing density
  gradientFrom?: string; // Tailwind color token start for highlight
  gradientTo?: string; // Tailwind color token end for highlight
  className?: string;
}

const sizeMap = {
  xl: {
    headline: "text-6xl md:text-8xl lg:text-9xl",
    subhead: "text-2xl md:text-3xl",
    eyebrow: "text-xs",
    kicker: "text-base",
    gap: "gap-8 md:gap-10",
    padding: "p-8 md:p-12",
  },
  lg: {
    headline: "text-5xl md:text-7xl",
    subhead: "text-xl md:text-2xl",
    eyebrow: "text-xs",
    kicker: "text-base",
    gap: "gap-6 md:gap-8",
    padding: "p-6 md:p-10",
  },
  md: {
    headline: "text-4xl md:text-6xl",
    subhead: "text-lg md:text-xl",
    eyebrow: "text-[11px]",
    kicker: "text-sm md:text-base",
    gap: "gap-5 md:gap-6",
    padding: "p-5 md:p-8",
  },
  sm: {
    headline: "text-3xl md:text-4xl",
    subhead: "text-base md:text-lg",
    eyebrow: "text-[10px]",
    kicker: "text-sm",
    gap: "gap-4 md:gap-5",
    padding: "p-4 md:p-6",
  },
};

const spacingMap = {
  tight: "space-y-3",
  normal: "space-y-4",
  loose: "space-y-6",
};

const variantMap = {
  default: "bg-transparent",
  contained: "bg-neutral-900/5 dark:bg-neutral-100/5 backdrop-blur-sm",
  outlined:
    "border-2 border-neutral-200 dark:border-neutral-700 bg-transparent",
  gradient:
    "bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800",
};

export const BlockHeadlineCombo: React.FC<BlockHeadlineComboProps> = ({
  eyebrow,
  headline,
  highlight,
  subhead,
  kicker,
  align = "left",
  size = "lg",
  variant = "default",
  background = false,
  decorative = false,
  animate = true,
  clamp,
  spacing = "normal",
  gradientFrom = "from-lime-400",
  gradientTo = "to-lime-600",
  className = "",
}) => {
  const sizes = sizeMap[size];
  const wrapperAlign =
    align === "center"
      ? "mx-auto text-center items-center"
      : align === "right"
      ? "ml-auto text-right items-end"
      : "text-left items-start";

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const baseMotion = (d: number) => ({
    initial: animate ? { opacity: 0, y: 32 } : undefined,
    whileInView: animate ? { opacity: 1, y: 0 } : undefined,
    viewport: animate ? { once: true, amount: 0.3 } : undefined,
    transition: animate
      ? {
          duration: 0.8,
          ease: easeCurve,
          delay: d,
        }
      : undefined,
  });

  return (
    <div
      className={`relative max-w-7xl px-4 md:px-6 font-aspekta ${wrapperAlign} ${className}`}>
      {/* Background Container */}
      <motion.div
        {...baseMotion(0)}
        className={`relative rounded-2xl ${
          background ? variantMap[variant] : ""
        } ${background ? sizes.padding : ""} overflow-hidden`}>
        {/* Decorative Elements */}
        {decorative && (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lime-400/10 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl" />
          </>
        )}

        <div
          className={`relative flex flex-col ${sizes.gap} ${spacingMap[spacing]}`}>
          {eyebrow && (
            <motion.div
              {...baseMotion(0.1)}
              className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-gradient-to-r from-lime-400 to-lime-600" />
              <span
                className={`tracking-widest uppercase ${sizes.eyebrow} font-bold text-lime-500`}>
                {eyebrow}
              </span>
            </motion.div>
          )}

          <motion.h1
            {...baseMotion(0.15)}
            className={`font-light leading-[0.88] tracking-tighter text-foreground ${sizes.headline}`}>
            {typeof headline === "string" && highlight ? (
              <>
                {headline}{" "}
                <span
                  className={`relative inline-block bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
                  {highlight}
                  {/* Underline decoration */}
                  <div
                    className={`absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-full`}
                  />
                </span>
              </>
            ) : (
              headline
            )}
          </motion.h1>

          {subhead && (
            <motion.p
              {...baseMotion(0.2)}
              className={`${
                sizes.subhead
              } font-medium leading-relaxed text-foreground/70 max-w-3xl ${
                clamp ? `line-clamp-${clamp}` : ""
              }`}>
              {subhead}
            </motion.p>
          )}

          {kicker && (
            <motion.div
              {...baseMotion(0.25)}
              className={`flex items-center gap-2 text-foreground/60 ${sizes.kicker} font-semibold tracking-wide`}>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-lime-400 to-lime-600" />
              {kicker}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BlockHeadlineCombo;

/*
Example:
<BlockHeadlineCombo
  eyebrow="Featured"
  headline="Revolutionary"
  highlight="Platform"
  subhead="Building the future of interactive digital experiences with cutting-edge technology and innovative design patterns."
  kicker="Available Now · Enterprise Ready"
  align="left"
  size="xl"
  variant="contained"
  background={true}
  decorative={true}
/>
*/
