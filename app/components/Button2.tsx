"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import { ArrowRight } from "@phosphor-icons/react";

interface Button2Props {
  text?: string;
  className?: string;
  href?: string;
  variant?: "default" | "black" | "lime" | "limesmall";
}

// Centralized variant styles
const variantStyles: Record<
  NonNullable<Button2Props["variant"]>,
  { top: string; bottom: string; container: string }
> = {
  default: {
    top: "border-white/20 text-white fill-white p-4",
    bottom: "border-slate-100 bg-slate-100 text-slate-900 ",
    container: "h-14",
  },
  black: {
    top: "border-neutral-800/30 bg-neutral-900 text-white p-4 ",
    bottom: "border-neutral-900 bg-neutral-800 text-white ",
    container: "h-14",
  },
  lime: {
    top: "border-lime-500/30 bg-lime-400  p-4",
    bottom: "border-neutral-800 bg-neutral-900 text-white ",
    container: "h-14",
  },
  limesmall: {
    top: "border-lime-500/30 bg-lime-400 text-neutral-900 px-4 py-2 ",
    bottom: "border-neutral-800 bg-neutral-800 text-white px-4 py-2 ",
    container: "h-9",
  },
};

function Button2({ text, className, href, variant = "default" }: Button2Props) {
  // Check if the href is external
  const isExternal = !!href && /^(https?:|mailto:|tel:)/.test(href);

  // Fallback if an unsupported variant sneaks in
  const safeVariant: NonNullable<Button2Props["variant"]> =
    variant in variantStyles ? variant : "default";

  const baseTop =
    "pointer-events-auto text-xxs absolute rounded-xs top-0 left-0 border justify-between font-bold flex w-fit hover:cursor-pointer tracking-wider group-hover/btn:-top-12 transition-all duration-250 ease-in-out";
  const baseBottom =
    "pointer-events-auto text-xxs border absolute rounded-xs font-bold left-0 flex justify-between top-[100%] w-full group-hover/btn:top-0 transition-all duration-250 ease-in-out p-4 hover:cursor-pointer tracking-wider";

  const topClass = cn(baseTop, variantStyles[safeVariant].top, className);
  const bottomClass = cn(
    baseBottom,
    variantStyles[safeVariant].bottom,
    // remove p-4 when variant already supplies its own padding (handled inside map)
    className
  );

  const containerClass = cn(
    "inline-block relative top-0 left-0 min-w-full ml-[1px] overflow-hidden group/btn",
    variantStyles[safeVariant].container
  );

  const content = (rotated: boolean) => (
    <div className="flex justify-between items-center w-full">
      <span className="text-xxs">{text}</span>
      <ArrowRight
        className={cn(
          rotated ? "rotate-0" : "-rotate-45",
          "transition-transform"
        )}
        size={16}
      />
    </div>
  );

  return (
    <div className={containerClass}>
      {isExternal ? (
        <>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={topClass}>
            {content(false)}
          </a>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={bottomClass}>
            {content(true)}
          </a>
        </>
      ) : (
        <>
          <Link href={href || "#"} className={topClass}>
            {content(false)}
          </Link>
          <Link href={href || "#"} className={bottomClass}>
            {content(true)}
          </Link>
        </>
      )}
    </div>
  );
}

export default Button2;
