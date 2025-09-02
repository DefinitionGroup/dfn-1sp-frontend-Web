"use client";

import React from "react";
import { motion } from "motion/react";
import { AnimateNumber } from "motion-plus/react";
/**
 * TextLayout
 * A versatile, animated text layout block for marketing / section intros.
 * Inspired by clean grid + badge patterns used elsewhere,
 * while remaining purely typographic. Built for easy reuse with rich props.
 */

export interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
}

export interface TextLayoutProps {
  /** Optional tiny label above the title */
  eyebrow?: string;
  /** Main heading (can include JSX for gradient spans, etc.) */
  title: React.ReactNode;
  /** Optional highlighted inline string appended to title if title is plain text */
  highlight?: string;
  /** Optional subtitle line under the title (slightly lighter) */
  subtitle?: React.ReactNode;
  /** Lead paragraph (larger sizing) */
  lead?: React.ReactNode;
  /** Array of body paragraphs or custom nodes */
  paragraphs?: React.ReactNode[];
  /** Optional list bullets */
  bullets?: (string | React.ReactNode)[];
  /** Optional stat pills shown beneath content */
  stats?: StatItem[];
  /** Alignment of the block */
  align?: "left" | "center" | "right";
  /** Add vertical padding */
  padded?: boolean;
  /** Show faint column grid lines for layout debugging / styling */
  showGrid?: boolean;
  /** Max width constraint token */
  width?: "sm" | "md" | "lg" | "xl" | "full";
  /** Stagger base delay */
  delay?: number;
  className?: string;
  /** Two-column split (lead + body) at large screens */
  split?: boolean;
}

const widthMap = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

export const TextLayout: React.FC<TextLayoutProps> = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  lead,
  paragraphs = [],
  bullets,
  stats,
  align = "left",
  padded = true,
  showGrid = false,
  width = "lg",
  delay = 0,
  className = "",
  split = true,
}) => {
  const alignment =
    align === "center"
      ? "text-center mx-auto"
      : align === "right"
      ? "text-right ml-auto"
      : "text-left";

  const containerAlign =
    align === "center"
      ? "items-center"
      : align === "right"
      ? "items-end"
      : "items-start";

  const baseDelay = delay;

  const formatStatValue = (val: StatItem["value"]) => {
    if (typeof val === "number") return val.toLocaleString();
    return val; // string as-is (can contain symbols like <40)
  };

  return (
    <div
      className={`relative w-full  ${
        padded ? "py-24 md:py-32" : ""
      } ${className}`}>
      {showGrid && (
        <div className="pointer-events-none absolute inset-0 -z-10 grid grid-cols-12 divide-x divide-neutral-200/40 dark:divide-neutral-700/40 [mask:linear-gradient(to_bottom,transparent,black,_black,transparent)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="" />
          ))}
        </div>
      )}

      <div className={`relative ${widthMap[width]} w-full `}>
        <div
          className={`flex flex-col gap-10 ${
            split ? "lg:grid lg:grid-cols-12 lg:gap-16" : ""
          }`}>
          <div
            className={`${
              split ? "lg:col-span-5" : ""
            } flex flex-col ${containerAlign}`}>
            {eyebrow && (
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: baseDelay }}
                className="uppercase tracking-widest text-xs font-bold text-lime-500">
                {eyebrow}
              </motion.span>
            )}
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
                delay: baseDelay + 0.05,
              }}
              className={`leading-[0.95] font-semibold text-5xl md:text-7xl tracking-tight ${alignment}`}>
              {typeof title === "string" && highlight ? (
                <>
                  {title}{" "}
                  <span className="bg-gradient-to-r from-lime-400 to-lime-500 bg-clip-text text-transparent">
                    {highlight}
                  </span>
                </>
              ) : (
                title
              )}
            </motion.h2>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.1 }}
                className={`text-base pt-4 text-neutral-800 dark:text-neutral-400 max-w-1/2 ${alignment}`}>
                {subtitle}
              </motion.p>
            )}
          </div>

          <div
            className={`${
              split ? "lg:col-span-7" : ""
            } flex flex-col gap-8 ${alignment}`}>
            {lead && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.15 }}
                className="text-xl md:text-3xl text-neutral-700 font-semibold dark:text-neutral-200 max-w-2xl leading-tight">
                {lead}
              </motion.p>
            )}

            {paragraphs.length > 0 && (
              <div className="flex flex-col gap-6">
                {paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.55,
                      delay: baseDelay + 0.2 + i * 0.07,
                    }}
                    className="text-base md:text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {p}
                  </motion.p>
                ))}
              </div>
            )}

            {bullets && bullets.length > 0 && (
              <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: baseDelay + 0.25,
                    },
                  },
                }}
                className="grid gap-3 sm:grid-cols-2 mt-2">
                {bullets.map((b, i) => (
                  <motion.li
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="flex items-start gap-2 text-sm md:text-base text-neutral-700 dark:text-neutral-200">
                    <span className="mt-3 inline-block h-1 w-1 rounded-full bg-gradient-to-tr from-lime-400 to-lime-500" />
                    <span>{b}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {stats && stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: baseDelay + 0.3 }}
                className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-2xl md:text-5xl font-semibold bg-gradient-to-r from-lime-400 to-lime-500 bg-clip-text text-transparent">
                      {typeof s.value === "number" ? (
                        <motion.span
                          className="text-lime-500"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.6, ease: "easeOut" },
                            },
                          }}>
                          <AnimateNumber
                            format={{ minimumIntegerDigits: 3 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}>
                            {s.value}
                          </AnimateNumber>
                        </motion.span>
                      ) : (
                        <span>{s.value}</span>
                      )}
                      {s.suffix && (
                        <span className="text-lg align-top ml-0.5">
                          {s.suffix}
                        </span>
                      )}
                    </span>
                    <span className="text-xs tracking-wide uppercase text-neutral-500 dark:text-neutral-400 font-bold">
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextLayout;

/**
 * Example Usage (remove or adapt):
 * <TextLayout
 *   eyebrow="About"
 *   title="Integrated Experience"
 *   highlight="Platform"
 *   subtitle="Bridging interactive engagement & scalable infrastructure."
 *   lead="We design modular experiential systems that unify gaming dynamics, marketing funnels, and real-time data insights."
 *   paragraphs={[
 *     "Our approach starts from core player motivations— translating intent into progressive interaction loops.",
 *     "Through layered narrative states and adaptive UI motion, we maintain momentum while surfacing actionable context.",
 *   ]}
 *   bullets={["Progressive onboarding", "Behavioral telemetry", "Realtime segmentation", "Composable reward layer"]}
 *   stats={[{ label: "Avg. Retention", value: 68, suffix: "%" }, { label: "Latency", value: "<40", suffix: "ms" }]}
 *   align="left"
 *   split
 *   showGrid={false}
 * />
 */
