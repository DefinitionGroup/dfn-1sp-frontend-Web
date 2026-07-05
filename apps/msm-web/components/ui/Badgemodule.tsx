"use client";

// Ported from the root 1SP Badgemodule (removed during the MSM rework,
// reinstated July 2026). Structure/animation/API identical to root; only
// the variant inks are adapted for the dark-only MSM channel. A proper
// MSM redesign of this component is planned — treat current styling as
// provisional.

import { motion } from "motion/react";
import { AnimateNumber } from "motion-plus/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@1sp/utils/cn";
import { useRobustInView } from "@1sp/utils/hooks/use-robust-in-view";

interface BadgemoduleProps {
  text: string;
  subtitle: string;
  numberEl: string | number;
  className?: string;
  variant?: "default" | "minimal" | "glass";
  size?: "sm" | "md" | "lg";
}

export default function Badgemodule({
  text,
  subtitle,
  numberEl,
  className,
  variant = "default",
  size = "md",
}: BadgemoduleProps) {
  const ref = useRef(null);
  const { isInView } = useRobustInView(ref, {
    amount: 0.1,
    margin: "0px 0px 120px 0px",
  });
  const [animateNumberValue, setAnimateNumberValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const targetNumber =
        typeof numberEl === "string" ? parseInt(numberEl, 10) || 0 : numberEl;
      const timeoutId = setTimeout(() => {
        setAnimateNumberValue(targetNumber as number);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [isInView, numberEl]);

  const sizeClasses = {
    sm: {
      container: "md:min-w-[100px] md:max-w-[160px]",
      padding: "px-2 py-1 md:p-3",
      number: "text-[10px] md:text-[8px]",
      text: "text-base md:text-sm lg:text-base xl:text-lg",
      subtitle: "text-[9px] md:text-[10px]",
    },
    md: {
      container: "md:min-w-[110px]",
      padding: "px-2.5 py-1 md:p-4",
      number: "text-[11px] md:text-[9px] lg:text-[10px]",
      text: "text-lg md:text-lg lg:text-xl xl:text-2xl",
      subtitle: "text-[10px] md:text-xxs",
    },
    lg: {
      container: "md:min-w-[180px] md:max-w-[260px]",
      padding: "px-3 py-1.5 md:p-5",
      number: "text-xs md:text-[10px] lg:text-xs",
      text: "text-xl md:text-xl lg:text-2xl xl:text-3xl",
      subtitle: "text-[11px] md:text-xs lg:text-sm",
    },
  };

  // Dark-channel inks (root variants use light-mode colors that would be
  // unreadable on msm-paper).
  const variantClasses = {
    default: {
      wrapper: "border-t border-white/20 md:border-0 md:bg-msm-surface md:shadow-xl",
      content: "text-neutral-50",
      footer: "text-neutral-400 md:bg-black/40 md:text-neutral-200",
    },
    minimal: {
      wrapper: "border-t border-white/40 md:border md:border-white/25",
      content: "text-neutral-50",
      footer: "text-neutral-400 md:border-t md:border-white/25",
    },
    glass: {
      wrapper: "border border-white/20 backdrop-blur-sm",
      content: "text-gray-100 md:text-gray-200",
      footer: "text-gray-300 md:text-gray-200 md:border-t md:border-white/10",
    },
  };

  const sizes = sizeClasses[size];
  const variants = variantClasses[variant];

  return (
    <motion.div
      ref={ref}
      className={cn(
        "flex flex-row items-center gap-2",
        "md:flex-col md:items-stretch md:gap-0",
        "md:aspect-square",
        "transition-all duration-300",
        sizes.container,
        variants.wrapper,
        className
      )}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.62, 0.05, 0.01, 0.99],
            staggerChildren: 0.15,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {/* Number */}
      <motion.span
        className={cn(
          "font-bold tabular-nums tracking-tight shrink-0",
          "md:self-end",
          sizes.padding,
          sizes.number,
          variants.content
        )}
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut", delay: 0.1 },
          },
        }}
      >
        <AnimateNumber
          format={{ minimumIntegerDigits: 3 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {animateNumberValue}
        </AnimateNumber>
      </motion.span>

      {/* Text */}
      <motion.p
        className={cn(
          "font-medium tracking-tighter flex-1",
          "md:flex md:items-end",
          sizes.padding,
          sizes.text,
          variants.content
        )}
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }}
      >
        {text}
      </motion.p>

      {/* Subtitle */}
      <motion.div
        className={cn(
          "font-medium uppercase tracking-wider shrink-0",
          sizes.padding,
          sizes.subtitle,
          variants.footer
        )}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut", delay: 0.3 },
          },
        }}
      >
        {subtitle}
      </motion.div>
    </motion.div>
  );
}
