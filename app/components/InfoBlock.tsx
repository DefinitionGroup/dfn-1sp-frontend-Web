"use client";

import React from "react";
import { motion } from "motion/react";
import Button, { LimeButton, OutlineButton, GhostButton } from "./Button";

export type InfoBlockVariant =
  | "default"
  | "contained"
  | "outlined"
  | "gradient";
export type InfoBlockTone = "neutral" | "lime" | "purple" | "blue";
export type InfoBlockSize = "sm" | "md" | "lg";
export type InfoBlockAlign = "left" | "center" | "right";

export interface InfoBlockCta {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "lime" | "outline" | "ghost";
}

export interface InfoBlockProps {
  eyebrow?: string;
  title: React.ReactNode;
  highlight?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode; // emoji, svg, or <img/>
  bullets?: (string | React.ReactNode)[];
  ctas?: InfoBlockCta[];
  align?: InfoBlockAlign;
  size?: InfoBlockSize;
  variant?: InfoBlockVariant;
  tone?: InfoBlockTone;
  shadow?: boolean;
  border?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeMap: Record<
  InfoBlockSize,
  { title: string; desc: string; gap: string; pad: string; icon: string }
> = {
  sm: {
    title: "text-2xl md:text-3xl",
    desc: "text-sm md:text-base",
    gap: "gap-3",
    pad: "p-4",
    icon: "text-xl",
  },
  md: {
    title: "text-3xl md:text-4xl",
    desc: "text-base md:text-lg",
    gap: "gap-4",
    pad: "p-6",
    icon: "text-2xl",
  },
  lg: {
    title: "text-4xl md:text-5xl",
    desc: "text-lg md:text-xl",
    gap: "gap-5",
    pad: "p-8",
    icon: "text-3xl",
  },
};

const variantMap: Record<InfoBlockVariant, string> = {
  default: "bg-transparent",
  contained: "bg-neutral-50/60 dark:bg-neutral-900/60 backdrop-blur-sm",
  outlined:
    "bg-transparent border-2 border-neutral-200 dark:border-neutral-700",
  gradient:
    "bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800",
};

const toneAccent: Record<InfoBlockTone, { from: string; to: string }> = {
  neutral: { from: "from-neutral-300", to: "to-neutral-600" },
  lime: { from: "from-brand-lime-400", to: "to-brand-lime-600" },
  purple: { from: "from-purple-400", to: "to-purple-600" },
  blue: { from: "from-blue-400", to: "to-blue-600" },
};

const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

const CTA = ({ cta }: { cta: InfoBlockCta }) => {
  const { label, href, onClick, variant = "default" } = cta;
  const props = {
    onClick,
    ...(href ? { as: "a", href } : {}),
  } as any;

  if (variant === "lime") return <LimeButton {...props}>{label}</LimeButton>;
  if (variant === "outline")
    return <OutlineButton {...props}>{label}</OutlineButton>;
  if (variant === "ghost") return <GhostButton {...props}>{label}</GhostButton>;
  return <Button {...props}>{label}</Button>;
};

export const InfoBlock: React.FC<InfoBlockProps> = ({
  eyebrow,
  title,
  highlight,
  description,
  icon,
  bullets,
  ctas,
  align = "left",
  size = "md",
  variant = "contained",
  tone = "lime",
  shadow = true,
  border = false,
  animate = true,
  className = "",
}) => {
  const sizes = sizeMap[size];
  const alignWrap =
    align === "center"
      ? "text-center items-center"
      : align === "right"
      ? "text-right items-end"
      : "text-left items-start";
  const accent = toneAccent[tone];

  return (
    <div
      className={`relative ${shadow ? "shadow-lg" : ""} ${
        border ? "border border-neutral-200 dark:border-neutral-800" : ""
      } rounded-2xl ${variantMap[variant]} ${sizes.pad} ${className}`}>
      {/* Decorative accent */}
      <div
        className={`pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-50 bg-gradient-to-br ${accent.from} ${accent.to}`}
      />

      <div
        className={`relative flex flex-col ${sizes.gap} ${alignWrap} font-aspekta`}>
        {/* Icon + Eyebrow */}
        {(icon || eyebrow) && (
          <motion.div
            initial={animate ? { opacity: 0, y: 16 } : undefined}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={animate ? { once: true, amount: 0.4 } : undefined}
            transition={{ duration: 0.5, ease: easeCurve }}
            className={`flex ${
              align !== "left" ? "justify-center" : ""
            } items-center gap-3`}>
            {icon && <div className={`${sizes.icon}`}>{icon}</div>}
            {eyebrow && (
              <span className="text-eyebrow text-foreground/70 tracking-widest">
                {eyebrow}
              </span>
            )}
          </motion.div>
        )}

        {/* Title */}
        <motion.h3
          initial={animate ? { opacity: 0, y: 22 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={animate ? { once: true, amount: 0.5 } : undefined}
          transition={{ duration: 0.6, ease: easeCurve, delay: 0.05 }}
          className={`font-black leading-[0.95] ${sizes.title} text-foreground tracking-tight`}>
          {typeof title === "string" && highlight ? (
            <>
              {title}{" "}
              <span
                className={`bg-gradient-to-r ${accent.from} ${accent.to} bg-clip-text text-transparent`}>
                {highlight}
              </span>
            </>
          ) : (
            title
          )}
        </motion.h3>

        {/* Description */}
        {description && (
          <motion.p
            initial={animate ? { opacity: 0, y: 14 } : undefined}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={animate ? { once: true, amount: 0.5 } : undefined}
            transition={{ duration: 0.55, ease: easeCurve, delay: 0.1 }}
            className={`${sizes.desc} text-foreground/80 max-w-3xl`}>
            {description}
          </motion.p>
        )}

        {/* Bullets */}
        {bullets && bullets.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.06, delayChildren: 0.15 },
              },
            }}
            className={`grid ${
              size !== "sm" ? "sm:grid-cols-2" : ""
            } gap-2 mt-2 text-foreground/80`}>
            {bullets.map((b, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="flex items-start gap-2">
                <span
                  className={`mt-1 inline-block h-2 w-2 rounded-full bg-gradient-to-tr ${accent.from} ${accent.to}`}
                />
                <span className="text-sm md:text-base">{b}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* CTAs */}
        {ctas && ctas.length > 0 && (
          <motion.div
            initial={animate ? { opacity: 0, y: 10 } : undefined}
            whileInView={animate ? { opacity: 1, y: 0 } : undefined}
            viewport={animate ? { once: true, amount: 0.4 } : undefined}
            transition={{ duration: 0.5, ease: easeCurve, delay: 0.15 }}
            className={`flex ${
              align === "center"
                ? "justify-center"
                : align === "right"
                ? "justify-end"
                : ""
            } gap-3 mt-2 flex-wrap`}>
            {ctas.map((cta, i) => (
              <CTA key={i} cta={cta} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InfoBlock;

/*
Example usage:
<InfoBlock
  eyebrow="Info"
  title="Composable"
  highlight="Blocks"
  description="Composable information blocks for flexible marketing layouts."
  icon={"ℹ️"}
  bullets={["Token-aware styles", "Motion defaults", "CTA support", "Accessible"]}
  ctas={[{ label: "Learn more", variant: "lime" }, { label: "Contact", variant: "outline" }]}
  align="left"
  size="md"
  variant="contained"
  tone="lime"
/>
*/
