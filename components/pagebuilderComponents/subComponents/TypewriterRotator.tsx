"use client";

import { delay, wrap } from "motion";
import { Typewriter } from "motion-plus/react";
import React, { useState } from "react";

export default function TypewriterRotator({
  text = [
    "One.",
    "Shared.",
    "Passion.",
    "Gaming.",
    "Technology.",
    "The.",
    "Superagency.",
  ],
}: {
  text?: string[];
}) {
  const [index, setIndex] = useState(0);

  return (
    <h2 style={container}>
      <Typewriter
        as="div"
        variance={2.8}
        speed="normal"
        backspace="character"
        cursorBlinkDuration={0.26}
        cursorStyle={cursor}
        textStyle={animatingText}
        onComplete={() =>
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1)
        }
      >
        {text[(index + 1) % text.length]}
      </Typewriter>
    </h2>
  );
}

/* Inline styles to match your reference */
const container: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 0,
  flexDirection: "column",
  fontFamily: "var(--font-aspekta)",
  width: 900,
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 1,
  color: "var(--accent)",
};

const animatingText: React.CSSProperties = {
  fontSize: 128,
  fontWeight: 600,
  lineHeight: 0.75,
  letterSpacing: "-0.25rem",
};

const cursor: React.CSSProperties = {
  background: "#66ff00",
  width: 6,
  minHeight: 108,
};
