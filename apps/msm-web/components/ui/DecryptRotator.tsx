"use client";
// @sacred — approved hero mechanic (decrypt/descramble), tuned by Martin. Do not replace.

import React, { useEffect, useState } from "react";
import { stegaClean } from "@sanity/client/stega";
import { useReducedMotion } from "motion/react";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** ms per locked-in character (left → right reveal) */
const REVEAL_MS = 35;
/** ms between re-shuffles of the still-scrambled tail */
const SHUFFLE_MS = 30;
/** ms a fully decrypted word stays on screen */
const HOLD_MS = 2200;

/** How long a decrypt pass takes, so callers can chain animations after it. */
export function decryptRevealMs(text: string, revealDurationMs?: number) {
  const clean = stegaClean(text ?? "");
  const characterMs = revealDurationMs ? Math.min(REVEAL_MS, revealDurationMs / Math.max(clean.length, 1)) : REVEAL_MS;
  return Math.round(clean.length * characterMs);
}

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function scramble(word: string, revealed: number) {
  let out = "";
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    out += i < revealed || /\s/.test(ch) ? ch : randomChar();
  }
  return out;
}

export default function DecryptRotator({
  text = [
    "One.",
    "Shared.",
    "Passion.",
    "The Superagency.",
    "Consumer",
    "Electronics",
    "Gaming",
    "Technology",
  ],
  variant = "rotating",
  className,
  revealDurationMs,
  delayMs = 0,
  as,
}: {
  text?: string[];
  variant?: "rotating" | "headline";
  className?: string;
  /** Optional cap for long case headlines; homepage timing remains unchanged. */
  revealDurationMs?: number;
  delayMs?: number;
  /** Render as a non-heading element (labels, eyebrows). Default keeps h1/h2. */
  as?: "p" | "span" | "div";
}) {
  const prefersReducedMotion = useReducedMotion();
  // Preview annotations must not become scrambled characters or extend the reveal.
  const words = text.map((word) => stegaClean(word)).filter((w) => w.trim().length > 0);
  const contentKey = JSON.stringify(words);
  const isHeadline = variant === "headline";
  const Heading = as ?? (isHeadline ? "h1" : "h2");
  // A delayed run stays invisible until its turn, so it never shows the plain
  // word first. Server and client agree because it depends only on delayMs.
  const [started, setStarted] = useState(!delayMs);
  // First paint must be deterministic (server HTML === client hydration),
  // so start with the plain word — the mount effect scrambles immediately.
  const [display, setDisplay] = useState(() =>
    words.length > 0 ? words[0] : ""
  );
  useEffect(() => {
    const activeWords: string[] = JSON.parse(contentKey);
    if (activeWords.length === 0) return;
    let index = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const run = () => {
      setStarted(true);
      const word = activeWords[index % activeWords.length];

      if (reducedMotion) {
        setDisplay(word);
        if (isHeadline) return;
        timeout = setTimeout(() => {
          index += 1;
          run();
        }, HOLD_MS);
        return;
      }

      const start = performance.now();
      let lastShuffle = 0;

      const tick = (now: number) => {
        const characterMs = revealDurationMs ? Math.min(REVEAL_MS, revealDurationMs / word.length) : REVEAL_MS;
        const revealed = Math.floor((now - start) / characterMs);
        if (revealed >= word.length) {
          setDisplay(word);
          if (isHeadline) return;
          timeout = setTimeout(() => {
            index += 1;
            run();
          }, HOLD_MS);
          return;
        }
        if (now - lastShuffle >= SHUFFLE_MS) {
          lastShuffle = now;
          setDisplay(scramble(word, revealed));
        }
        raf = requestAnimationFrame(tick);
      };

      setDisplay(scramble(word, 0));
      raf = requestAnimationFrame(tick);
    };

    if (delayMs && !reducedMotion) timeout = setTimeout(run, delayMs);
    else run();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [contentKey, isHeadline, revealDurationMs, delayMs, prefersReducedMotion]);

  if (words.length === 0) return null;

  return (
    <Heading
      className={className || (isHeadline
        ? "relative max-w-[28ch] whitespace-pre-line text-3xl md:text-5xl leading-tight pb-6"
        : "typewriter-rotator relative inline-grid max-w-full items-start font-aspekta font-medium leading-[0.8] text-white")}
      style={{
        ...(isHeadline ? undefined : { maxWidth: 900 }),
        ...(started ? undefined : {visibility: "hidden" as const}),
      }}
    >
      <span className={isHeadline ? "relative block" : "contents"}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            aria-hidden
            className="invisible col-start-1 row-start-1"
            style={isHeadline ? undefined : textStyle}
          >
            {word}
          </span>
        ))}
        <span
          aria-hidden
          className={isHeadline ? "absolute inset-0 overflow-hidden" : "col-start-1 row-start-1"}
          style={isHeadline ? undefined : textStyle}
        >
          {display}
        </span>
        <span className="sr-only">{words.join(" ")}</span>
      </span>
    </Heading>
  );
}

const textStyle: React.CSSProperties = {
  fontSize: "var(--tw-text-size)",
  // Unified MSM weight; hierarchy comes from scale, not bold spans.
  fontWeight: "var(--msm-type-weight, 300)" as unknown as number,
  lineHeight: "var(--tw-text-lh)",
  letterSpacing: "var(--tw-text-ls)",
  color: "#ffffff",
  whiteSpace: "normal",
};
