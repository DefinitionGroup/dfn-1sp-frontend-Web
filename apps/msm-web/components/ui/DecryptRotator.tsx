"use client";
// @sacred — approved hero mechanic (decrypt/descramble), tuned by Martin. Do not replace.

import React, { useEffect, useState } from "react";
import { stegaClean } from "@sanity/client/stega";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** ms per locked-in character (left → right reveal) */
const REVEAL_MS = 35;
/** ms between re-shuffles of the still-scrambled tail */
const SHUFFLE_MS = 30;
/** ms a fully decrypted word stays on screen */
const HOLD_MS = 2200;

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
}: {
  text?: string[];
  variant?: "rotating" | "headline";
}) {
  // Preview annotations must not become scrambled characters or extend the reveal.
  const words = text.map((word) => stegaClean(word)).filter((w) => w.trim().length > 0);
  const contentKey = JSON.stringify(words);
  const isHeadline = variant === "headline";
  const Heading = isHeadline ? "h1" : "h2";
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
        const revealed = Math.floor((now - start) / REVEAL_MS);
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

    run();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [contentKey, isHeadline]);

  if (words.length === 0) return null;

  return (
    <Heading
      className={isHeadline
        ? "relative max-w-[28ch] whitespace-pre-line text-3xl md:text-5xl leading-tight pb-6"
        : "typewriter-rotator relative inline-grid max-w-full items-start font-aspekta font-medium leading-[0.8] text-white"}
      style={isHeadline ? undefined : { maxWidth: 900 }}
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
  fontWeight: 500,
  lineHeight: "var(--tw-text-lh)",
  letterSpacing: "var(--tw-text-ls)",
  color: "#ffffff",
  whiteSpace: "normal",
};
