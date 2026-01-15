"use client";

import { motion, useInView } from "motion/react";
import { AnimateNumber } from "motion-plus/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BadgemoduleProps {
  text: string;
  subtitle: string;
  numberEl: string | number;
  className?: string;
  /** Visual variant: 'default' shows dark card on md+, 'minimal' is border-only */
  variant?: "default" | "minimal" | "glass";
  /** Size variant for different contexts */
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
  const isInView = useInView(ref, { once: true, amount: 0.3 });
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

  // Size-based classes
  const sizeClasses = {
    sm: {
      container: "min-w-[100px] max-w-[160px]",
      padding: "p-3",
      logo: "w-3 h-3",
      number: "text-[8px]",
      text: "text-sm md:text-base lg:text-lg",
      subtitle: "text-[9px] md:text-[10px]",
    },
    md: {
      container: "min-w-[110px]  ",
      padding: "p-1 md:p-4",
      logo: "w-3.5 h-3.5 md:w-4 md:h-4",
      number: "text-[9px] md:text-[10px]",
      text: "text-2xl md:text-lg lg:text-xl xl:text-2xl",
      subtitle: "text-[10px] md:text-xxs",
    },
    lg: {
      container: "min-w-[180px] max-w-[260px]",
      padding: "p-4 md:p-5",
      logo: "w-4 h-4 md:w-5 md:h-5",
      number: "text-[10px] md:text-xs",
      text: "text-lg md:text-xl lg:text-2xl xl:text-3xl",
      subtitle: "text-xs md:text-sm ",
    },
  };

  // Variant-based classes
  const variantClasses = {
    default: {
      wrapper: "border-t border-black/20 md:border-0 md:bg-black md:rounded-lg md:shadow-xl",
      content: "md:text-gray-100",
      footer: "md:bg-neutral-800 md:text-gray-200 md:rounded-b-lg",
    },
    minimal: {
      wrapper: "border-t border-black/50 md:border md:border-black/50 md:rounded-lg",
      content: "text-neutral-600",
      footer: "text-neutral-500 border-t border-black/50",
    },
    glass: {
      wrapper: "border border-white/20  backdrop-blur-sm rounded-lg ",
      content: "text-gray-200",
      footer: " text-gray-200 rounded-b-lg border-t border-white/10",
    },
  };

  const sizes = sizeClasses[size];
  const variants = variantClasses[variant];

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        ref={ref}
        className={cn(
          "relative flex flex-col justify-between",
          "aspect-auto md:aspect-square",
          "transition-all duration-300",
          sizes.container,
          variants.wrapper
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
              ease: [0.25, 0.46, 0.45, 0.94],
              staggerChildren: 0.15,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {/* Header: Logo and Number */}
        <div className={cn("flex-1 flex flex-col ", sizes.padding)}>
          <div className="flex items-start  justify-between w-full ">
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
                },
              }}
              className="hidden flex-shrink-0"
            >
              <Image
                src="/ci/1sp-outline.svg"
                alt="1SP Logo"
                width={60}
                height={60}
                className={cn(sizes.logo, "opacity-80")}
              />
            </motion.div>
            <motion.div
              className={cn(
                "font-bold tabular-nums tracking-tight",
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
            </motion.div>
          </div>

          {/* Main Text */}
          <motion.p
            className={cn(
              "font-medium  tracking-tighter",
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
        </div>

        {/* Footer: Subtitle */}
        <motion.div
          className={cn(
            "font-medium uppercase tracking-wider",
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
    </div>
  );
}
