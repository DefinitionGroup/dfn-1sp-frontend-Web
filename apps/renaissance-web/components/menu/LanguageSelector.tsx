"use client";

import Link from "next/link";
import { useOptimizedTransitionRouter } from "@1sp/utils/hooks/use-optimized-transition-router";

export type LanguageOption = {
  id: string;
  label: string;
  available: boolean;
};

type LanguageSelectorProps = {
  currentLocale: string;
  options: LanguageOption[];
  compact?: boolean;
  frosted?: boolean;
};

export default function LanguageSelector({
  currentLocale,
  options,
  compact = false,
  frosted = true,
}: LanguageSelectorProps) {
  const router = useOptimizedTransitionRouter();

  return (
    <div
      className={`flex items-center rounded-control p-0.5 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        frosted
          ? "border border-current/10 bg-white/[0.06] backdrop-blur-md"
          : "border border-transparent bg-transparent backdrop-blur-none"
      }`}
      aria-label="Language selection"
      role="group"
    >
      {options.map((option) => {
        const isActive = option.id === currentLocale;
        const isAvailable = option.available || isActive;
        const href = `/${option.id}`;
        const label = option.id.toUpperCase();

        if (!isAvailable) {
          return (
            <span
              key={option.id}
              aria-disabled="true"
              title={`${option.label} translation is not available yet`}
              className={`select-none rounded-indicator px-2 py-1 text-[0.6rem] font-semibold opacity-30 ${
                compact ? "min-w-8 text-center" : ""
              }`}
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={option.id}
            href={href}
            hrefLang={option.id}
            lang={option.id}
            aria-current={isActive ? "page" : undefined}
            aria-label={
              isActive
                ? `${option.label}, current language`
                : `Switch to ${option.label}`
            }
            title={isActive ? option.label : `Switch to ${option.label}`}
            className={`rounded-indicator px-2 py-1 text-[0.6rem] font-semibold transition-[background-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-renaissance-accent ${
              compact ? "min-w-8 text-center" : ""
            } ${
              isActive
                ? "bg-renaissance-accent text-white"
                : "hover:-translate-y-px hover:bg-white/20"
            }`}
            onClick={(event) => {
              if (isActive) {
                event.preventDefault();
                return;
              }

              event.preventDefault();
              // Language changes always land on the translated homepage. This
              // is intentionally safe until the current document has a linked
              // translation instead of guessing an equivalent slug.
              router.push(href);
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
