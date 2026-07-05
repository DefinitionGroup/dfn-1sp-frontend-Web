"use client";
// @sacred — approved hero mechanic (decrypt/descramble), tuned by Martin. Do not replace.

import React, { useEffect, useRef, useState } from "react";

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
    out += i < revealed || ch === " " ? ch : randomChar();
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
}: {
  text?: string[];
}) {
  const words = text.filter((w) => w.trim().length > 0);
  // First paint must be deterministic (server HTML === client hydration),
  // so start with the plain word — the mount effect scrambles immediately.
  const [display, setDisplay] = useState(() =>
    words.length > 0 ? words[0] : ""
  );
  const indexRef = useRef(0);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    if (wordsRef.current.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const run = () => {
      const word = wordsRef.current[indexRef.current % wordsRef.current.length];

      if (reducedMotion) {
        setDisplay(word);
        timeout = setTimeout(() => {
          indexRef.current += 1;
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
          timeout = setTimeout(() => {
            indexRef.current += 1;
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
  }, []);

  if (words.length === 0) return null;

  return (
    <h2
      className="typewriter-rotator flex flex-col flex-wrap items-start w-full font-aspekta font-medium leading-[0.8] text-white"
      style={{ maxWidth: 900 }}
    >
      <span aria-hidden style={textStyle}>
        {display}
      </span>
      <span className="sr-only">{words.join(" ")}</span>
    </h2>
  );
}

const textStyle: React.CSSProperties = {
  fontSize: "var(--tw-text-size)",
  fontWeight: 300,
  lineHeight: "var(--tw-text-lh)",
  letterSpacing: "var(--tw-text-ls)",
  color: "#ffffff",
  whiteSpace: "normal",
};
