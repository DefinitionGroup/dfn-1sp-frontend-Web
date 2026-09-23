"use client";

import React, { useLayoutEffect, useState, type CSSProperties } from "react";
import { stegaClean } from "@sanity/client/stega";

/** ms one word takes to flicker itself in */
const WORD_MS = 420;
/** ms between the start slots words are dealt into */
const SLOT_MS = 90;

/** Total time the headline needs, so callers can chain what follows it. */
export function flickerWordsMs(text: string) {
  const words = stegaClean(text ?? "").split(/\s+/).filter(Boolean);
  return words.length === 0 ? 0 : (words.length - 1) * SLOT_MS + WORD_MS;
}

/** Deal the words into random start slots, so they light up out of order. */
function shuffledSlots(count: number) {
  const slots = Array.from({ length: count }, (_, i) => i);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots;
}

/**
 * Headline that fades in flickering, one word at a time, in random order.
 * Server renders the finished headline, so no-JS and crawlers get plain text.
 */
export default function FlickerWords({
  text,
  className,
  as: Tag = "h1",
  delayMs = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  delayMs?: number;
}) {
  const words = stegaClean(text ?? "").split(/\s+/).filter(Boolean);
  const [slots, setSlots] = useState<number[] | null>(null);

  // Randomize after hydration only: the server HTML must stay deterministic.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSlots(shuffledSlots(words.length));
  }, [text]);

  if (words.length === 0) return null;

  return (
    <Tag className={className}>
      <span className="sr-only">{words.join(" ")}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <React.Fragment key={`${word}-${index}`}>
            <span
              className={slots ? "msm-word-flicker" : undefined}
              style={slots ? ({ animationDelay: `${delayMs + slots[index] * SLOT_MS}ms` } as CSSProperties) : undefined}
            >
              {word}
            </span>
            {index < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  );
}
