"use client";

import { delay, wrap } from "motion";
import { Typewriter } from "motion-plus/react";
import { useState } from "react";

export default function TypewriterChangeContentExample({
  text = ["Campaigns", "Brands", "Games", "Experiences", "Products"],
}: {
  text?: string[];
}) {
  const [index, setIndex] = useState(0);

  return (
    <h2 style={container}>
      <span style={label}>We boost</span>

      <Typewriter
        as="div"
        speed="normal"
        variance={0.8}
        backspace="character"
        cursorBlinkDuration={0.16}
        cursorStyle={cursor}
        onComplete={() => {
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1);
        }}
        textStyle={animatingText}>
        {text[index]}
      </Typewriter>
    </h2>
  );
}

/**
 * ==============   Styles   ================
 */
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

const label: React.CSSProperties = {
  fontSize: 13,
};

const animatingText: React.CSSProperties = {
  fontSize: 128,
  fontWeight: 500,
  lineHeight: 0.75,
  letterSpacing: "-0.25rem",
};

const cursor: React.CSSProperties = {
  background: "#66ff00",
  width: 6,
  minHeight: 108,
};
