"use client";

import React from "react";
import { motion } from "motion/react";

const logoImage = "/981249ca2e4d90710622a4eec7fda12e77d0848d.png";

export interface BlockBadgeLogoProps {
  title?: string;
  subtext?: string;
  number?: string;
  className?: string;
  animate?: boolean;
  variant?: "default" | "contained" | "minimal";
}

const variantStyles = {
  default: {
    container: "bg-[#121212]",
    titleSection: "bg-transparent",
    subtextSection: "bg-[#2f2f2f]",
  },
  contained: {
    container: "bg-neutral-900 shadow-lg",
    titleSection: "bg-transparent",
    subtextSection: "bg-neutral-800",
  },
  minimal: {
    container: "bg-transparent border border-neutral-700",
    titleSection: "bg-transparent",
    subtextSection: "bg-neutral-800/50",
  },
};

export const BlockBadgeLogo: React.FC<BlockBadgeLogoProps> = ({
  title = "Super Agency.",
  subtext = "Case Story",
  number = "002",
  className = "",
  animate = true,
  variant = "default",
}) => {
  const styles = variantStyles[variant];

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: easeCurve,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeCurve },
    },
  };

  return (
    <motion.div
      className={`relative flex flex-col w-full max-w-[280px] font-aspekta ${styles.container} ${className}`}
      variants={animate ? containerVariants : undefined}
      initial={animate ? "hidden" : undefined}
      whileInView={animate ? "visible" : undefined}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}>
      {/* Number Badge - positioned absolutely */}
      <motion.div
        className="absolute top-2.5 right-2.5 z-10"
        variants={animate ? itemVariants : undefined}>
        <span className="text-[#f0f0f0] text-xs font-semibold tracking-[-0.24px] font-['Avenir_Next']">
          {number}
        </span>
      </motion.div>

      {/* Logo Section */}
      <motion.div
        className={`relative p-2.5 ${styles.titleSection}`}
        variants={animate ? itemVariants : undefined}>
        {/* Logo Image */}
        <div className="mb-2.5">
          <img
            src={logoImage}
            alt="Logo"
            className="w-[15.41px] h-[15.205px] object-cover"
          />
        </div>

        {/* Title */}
        <div className="px-2.5">
          <h3 className="text-[#f4f4f4] text-[40px] font-bold leading-[0.98] tracking-[-0.8px] font-aspekta">
            {title}
          </h3>
        </div>
      </motion.div>

      {/* Subtext Section */}
      <motion.div
        className={`${styles.subtextSection} px-2.5 py-3 h-10 flex items-center`}
        variants={animate ? itemVariants : undefined}>
        <span className="text-[#bbbbbb] text-xs font-semibold tracking-[-0.24px] leading-[1.12] font-['Avenir_Next']">
          {subtext}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default BlockBadgeLogo;

/*
Example usage:
<BlockBadgeLogo
  title="Super Agency."
  subtext="Case Story"
  number="002"
  variant="default"
  animate={true}
/>
*/
