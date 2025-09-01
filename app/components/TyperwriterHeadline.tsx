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
      <span style={label}>We boost:</span>
      <Typewriter
        as="div"
        variance={2.8}
        speed={"normal"}
        backspace="character"
        cursorBlinkDuration={0.26}
        cursorStyle={cursor}
        onComplete={() => {
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1);
        }}
        textStyle={animatingText}>
        {text[index + 1]}
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
  fontSize: 24,
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
