"use client";

import { delay, wrap } from "motion";
import { Typewriter } from "motion-plus/react";
import { useReducedMotion } from "motion/react";
import React, { useState } from "react";

export default function TypewriterRotator({
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
  align = "left",
}: {
  text?: string[];
  align?: "left" | "center";
}) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const isCentered = align === "center";
  const items = text.map((item) => item.trim()).filter(Boolean);
  const activeText = items[index] ?? items[0] ?? "";

  if (!activeText) return null;

  return (
    <h2
      aria-label={activeText}
      className={`typewriter-rotator flex flex-col flex-wrap ${isCentered ? "items-center" : "items-start"} w-full font-flzr leading-[0.8]`}
      style={{ maxWidth: 900 }}
    >
      {prefersReducedMotion ? (
        <span
          aria-hidden="true"
          style={{
            ...textStyle,
            textAlign: isCentered ? "center" : "left",
          }}
        >
          {activeText}
        </span>
      ) : (
        <Typewriter
          key={`${index}-${activeText}`}
          as="div"
          aria-hidden="true"
          variance={2.8}
          speed="slow"
          backspace="character"
          cursorBlinkDuration={0.26}
          cursorStyle={cursorStyle}
          textStyle={{
            ...textStyle,
            textAlign: isCentered ? "center" : "left",
          }}
          onComplete={() => {
            if (items.length < 2) return;
            delay(
              () =>
                setIndex((current) => wrap(0, items.length, current + 1)),
              1,
            );
          }}
        >
          {activeText}
        </Typewriter>
      )}
    </h2>
  );
}

const cursorStyle: React.CSSProperties = {
  background: "var(--color-flzr-violet)",
  width: "var(--tw-cursor-w)" as string,
  borderRadius: "var(--tw-cursor-radius)" as string,
  marginLeft: "var(--tw-cursor-ml)" as string,
  height: "var(--tw-cursor-h)",
};

const textStyle: React.CSSProperties = {
  fontSize: "var(--tw-text-size)",
  fontWeight: 700,
  lineHeight: "var(--tw-text-lh)",
  color: "var(--color-flzr-violet)",
  whiteSpace: "normal",
};
