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

function Button2({ text, className, href, variant = "default" }: Button2Props) {
  // Check if the href is external
  const isExternal =
    href?.startsWith("http") ||
    href?.startsWith("mailto:") ||
    href?.startsWith("tel:");

  // Variant styles
  const getVariantStyles = (isTop: boolean) => {
    const baseStyles = isTop
      ? "pointer-events-auto absolute top-0 left-0 border justify-between font-bold flex w-fit  hover:cursor-pointer tracking-wider group-hover/btn:-top-12 transition-all duration-250 ease-in-out"
      : "pointer-events-auto border absolute font-bold left-0 flex justify-between top-[100%] w-full group-hover/btn:top-0 transition-all duration-250 ease-in-out p-4 hover:cursor-pointer tracking-wider";

    switch (variant) {
      case "black":
        return isTop
          ? `${baseStyles} border-neutral-800/30 bg-neutral-900 text-white p-4 text-xs `
          : `${baseStyles} border-neutral-900 bg-neutral-800 text-white text-xs `;
      case "lime":
        return isTop
          ? `${baseStyles} border-lime-500/30 bg-lime-400 text-neutral-900 p-4 text-xs `
          : `${baseStyles} border-neutral-800  bg-neutral-800 text-neutral-100 text-xs `;
      case "limesmall":
        return isTop
          ? `${baseStyles} border-lime-500/30 bg-lime-400 text-neutral-900 text-xs px-2 py-2`
          : `${baseStyles} border-neutral-800  bg-neutral-800 text-neutral-100 px-2 py-2 text-xs `;
      default:
        return isTop
          ? `${baseStyles} border-white/20 text-white p-4 text-xs `
          : `${baseStyles} border-slate-100 bg-slate-100 text-slate-900 text-xs `;
    }
  };

  // Helper function to get className for each layer
  const getClassName = (isTop: boolean) =>
    cn(getVariantStyles(isTop), className);

  // Content for both links
  const content = (isRotated: boolean) => (
    <div className="flex justify-between items-center w-full">
      <span>{text}</span>
      <ArrowRight className={isRotated ? "rotate" : "-rotate-45"} size={16} />
    </div>
  );

  return (
    <div
      className={`inline-block relative top-0 left-0 min-w-full ml-[1px] ${
        variant === "limesmall" ? "h-8" : "h-14"
      } overflow-hidden group/btn min-h-2`}>
      {isExternal ? (
        // External links use regular anchor tags
        <>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={getClassName(true)}>
            {content(false)}
          </a>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={getClassName(false)}>
            {content(true)}
          </a>
        </>
      ) : (
        // Internal links use Next.js Link component
        <>
          <Link href={href || "#"} className={getClassName(true)}>
            {content(false)}
          </Link>
          <Link href={href || "#"} className={getClassName(false)}>
            {content(true)}
          </Link>
        </>
      )}
    </div>
  );
}

export default Button2;
