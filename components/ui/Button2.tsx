"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@1sp/utils/cn";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";
import { hasVisibleText } from "@1sp/utils/text-content";
import MagneticButton from "./MagneticButton";

interface Button2Props {
  text?: string;
  className?: string;
  href?: string;
  variant?: "default" | "black" | "lime" | "limesmall" | "limesmallrounded" | "ghost";
  magnetic?: boolean;
}

const variantStyles: Record<
  NonNullable<Button2Props["variant"]>,
  { top: string; bottom: string; container: string }
> = {
  default: {
    top: "border-white/20 text-white!  fill-white p-3",
    bottom: "border-slate-100 bg-slate-100  text-white! text-slate-900 ",
    container: "h-11",
  },
  black: {
    top: "border-neutral-800/30 bg-neutral-900 text-white p-3 ",
    bottom: "border-neutral-900 bg-neutral-800  text-white ",
    container: "h-11",
  },
  ghost: {
    top: "border-neutral-800/30  p-2 pr-6 ",
    bottom: " border-lime-400 bg-lime-400  text-lime-100  p-2 pr-6 ",
    container: "h-10",
  },
  lime: {
    top: "border-lime-500/30 bg-lime-400 p-3  w-full",
    bottom: "border-neutral-800 bg-neutral-900 text-white  w-full ",
    container: "h-10",
  },
  limesmall: {
    top: "border-lime-500/30 bg-lime-400 text-neutral-900! px-4 py-2 ",
    bottom: "border-neutral-800 bg-neutral-800 text-white! px-4  py-2 ",
    container: "h-9",
  },
  limesmallrounded: {
    top: "border-lime-500/30 text-xxs rounded-full bg-lime-400 text-black! px-2 py-1 ",
    bottom:
      "border-neutral-800 text-xxs rounded-full  bg-neutral-800   text-white! px-2 py-1 ",
    container: "h-9",
  },
};

function Button2({ text, className, href, variant = "default", magnetic = true }: Button2Props) {
  const isExternal = !!href && /^(https?:|mailto:|tel:)/.test(href);
  const router = useOptimizedTransitionRouter();

  if (!hasVisibleText(text)) return null;

  const safeVariant: NonNullable<Button2Props["variant"]> =
    variant in variantStyles ? variant : "default";

  const baseTop =
    "pointer-events-auto text-xxs absolute rounded-xs top-0 left-0 border justify-between font-medium flex w-fit hover:cursor-pointer tracking-wider group-hover/btn:-top-12 transition-all duration-250 ease-in-out";
  const baseBottom =
    "pointer-events-auto text-xxs border absolute rounded-xs font-medium left-0 flex justify-between top-[100%] w-fit group-hover/btn:top-0 transition-all duration-250 ease-in-out p-3 hover:cursor-pointer tracking-wider";

  const topClass = cn(baseTop, variantStyles[safeVariant].top, className);
  const bottomClass = cn(
    baseBottom,
    variantStyles[safeVariant].bottom,
    className
  );

  const containerClass = cn(
    "inline-block relative top-0 left-0 min-w-full ml-[1px] overflow-hidden group/btn",
    variantStyles[safeVariant].container
  );

  const content = (rotated: boolean) => (
    <div className="flex justify-between items-center w-full ">
      <span className="text-xxs">{text}</span>
      <ArrowRightIcon
        className={cn(
          rotated ? "rotate-0" : "-rotate-45",
          "transition-transform"
        )}
        size={16}
      />
    </div>
  );

  const Wrapper = magnetic ? MagneticButton : "div";

  return (
    <Wrapper className={containerClass}>
      {isExternal ? (
        <>
          <Link
            href={href || "#"}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={topClass}
          >
            {content(false)}
          </Link>
          <Link
            href={href || "#"}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={bottomClass}
          >
            {content(true)}
          </Link>
        </>
      ) : (
        <>
          <Link
            href={href || "#"}
            className={topClass}
            onClick={(e) => {
              e.preventDefault();
              if (href) {
                router.push(href);
              }
            }}
          >
            {content(false)}
          </Link>
          <Link
            href={href || "#"}
            className={bottomClass}
            onClick={(e) => {
              e.preventDefault();
              if (href) {
                router.push(href);
              }
            }}
          >
            {content(true)}
          </Link>
        </>
      )}
    </Wrapper>
  );
}

export default Button2;
