"use client";

import React from "react";
import { motion } from "motion/react";
import Badgemodule from "./Badgemodule";

/**
 * BadgeBlock
 * An enhanced badge layout component that incorporates the existing Badgemodule
 * with additional content blocks, enhanced styling, color schemes, and layout options.
 * Designed for section headers and feature showcases.
 */

export interface BadgeItem {
  text: string;
  subtitle: string;
  numberEl: string;
  theme?: "dark" | "light" | "lime" | "purple" | "blue" | "gradient";
}

export interface BadgeBlockProps {
  badges: BadgeItem[];
  layout?: "horizontal" | "vertical" | "grid" | "stacked";
  spacing?: "tight" | "normal" | "loose";
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "contained" | "outlined" | "floating" | "minimal";
  background?: boolean;
  animate?: boolean;
  className?: string;
}

const themeMap = {
  dark: "bg-neutral-900 text-neutral-100 border-neutral-700",
  light: "bg-neutral-50 text-neutral-900 border-neutral-200",
  lime: "bg-gradient-to-br from-lime-500 to-lime-600 text-black border-lime-400",
  purple:
    "bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-400",
  blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400",
  gradient:
    "bg-gradient-to-br from-lime-400 via-purple-500 to-blue-500 text-white border-transparent",
};

const sizeMap = {
  sm: {
    container: "p-3",
    text: "text-2xl",
    subtitle: "text-xs",
    number: "text-[8px]",
    minWidth: "min-w-[150px]",
  },
  md: {
    container: "p-4",
    text: "text-3xl",
    subtitle: "text-sm",
    number: "text-[10px]",
    minWidth: "min-w-[180px]",
  },
  lg: {
    container: "p-6",
    text: "text-5xl",
    subtitle: "text-base",
    number: "text-xs",
    minWidth: "min-w-[220px]",
  },
  xl: {
    container: "p-8",
    text: "text-6xl",
    subtitle: "text-lg",
    number: "text-sm",
    minWidth: "min-w-[280px]",
  },
};

const layoutMap = {
  horizontal: "flex flex-row flex-wrap",
  vertical: "flex flex-col",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  stacked: "flex flex-col space-y-4",
};

const spacingMap = {
  tight: "gap-2",
  normal: "gap-4",
  loose: "gap-8",
};

const variantMap = {
  contained: "rounded-lg border shadow-md",
  outlined: "rounded-lg border-2 bg-transparent",
  floating: "rounded-xl shadow-lg backdrop-blur-sm",
  minimal: "border-0 shadow-none bg-transparent",
};

export const BadgeBlock: React.FC<BadgeBlockProps> = ({
  badges,
  layout = "horizontal",
  spacing = "normal",
  size = "lg",
  variant = "contained",
  background = true,
  animate = true,
  className = "",
}) => {
  const sizes = sizeMap[size];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const BadgeComponent: React.FC<{ badge: BadgeItem; index: number }> = ({
    badge,
    index,
  }) => {
    const theme = themeMap[badge.theme || "dark"];

    return (
      <motion.div
        className={`
          relative overflow-hidden
          ${sizes.container} ${sizes.minWidth}
          ${variant !== "minimal" ? theme : ""}
          ${variantMap[variant]}
          font-aspekta
        `}
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            },
          },
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}>
        {/* Background decoration for gradient themes */}
        {badge.theme === "gradient" && (
          <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 via-purple-500/20 to-blue-500/20 blur-xl" />
        )}

        <div className="relative flex flex-col items-start justify-between h-full">
          <motion.span
            className={`self-end ${sizes.number} font-medium opacity-70`}
            initial={animate ? { opacity: 0, x: 10 } : false}
            animate={animate ? { opacity: 0.7, x: 0 } : {}}
            transition={{ delay: 0.3 + index * 0.1 }}>
            {badge.numberEl}
          </motion.span>

          <div className="flex-1 flex flex-col justify-center">
            <motion.span
              className={`${sizes.text} font-black leading-tight mb-1`}
              initial={animate ? { opacity: 0, y: 15 } : false}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1 }}>
              {badge.text}
            </motion.span>

            <motion.span
              className={`${sizes.subtitle} font-medium opacity-80`}
              initial={animate ? { opacity: 0, y: 10 } : false}
              animate={animate ? { opacity: 0.8, y: 0 } : {}}
              transition={{ delay: 0.5 + index * 0.1 }}>
              {badge.subtitle}
            </motion.span>
          </div>

          {/* Accent line for certain themes */}
          {(badge.theme === "lime" || badge.theme === "gradient") && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`relative w-full ${className}`}>
      {background && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-50/50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/50 rounded-2xl -z-10" />
      )}

      <motion.div
        className={`${layoutMap[layout]} ${spacingMap[spacing]} p-4`}
        variants={containerVariants}
        initial={animate ? "hidden" : false}
        whileInView={animate ? "visible" : {}}
        viewport={{ once: true, amount: 0.2 }}>
        {badges.map((badge, index) => (
          <BadgeComponent key={index} badge={badge} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export default BadgeBlock;

/*
Example:
<BadgeBlock
  badges={[
    { text: "Our Units", subtitle: "Services", numberEl: "001", theme: "dark" },
    { text: "Features", subtitle: "Capabilities", numberEl: "002", theme: "lime" },
    { text: "Innovation", subtitle: "Technology", numberEl: "003", theme: "gradient" },
  ]}
  layout="horizontal"
  spacing="normal"
  size="lg"
  variant="contained"
  background={true}
/>
*/
