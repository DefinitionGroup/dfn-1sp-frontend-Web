"use client";

import { delay, wrap } from "motion";
import { Typewriter } from "motion-plus/react";
import { useState } from "react";

export default function TypewriterChangeContentExample({
  text = [
    "",
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
  const [index, setIndex] = useState(0);

  return (
    <h2 style={container}>
      {/* <span style={label}>We boost:</span> */}
      <Typewriter
        as="div"
        variance={2.8}
        speed={"normal"}
        backspace="character"
        cursorBlinkDuration={0.36}
        cursorStyle={cursor}
        onComplete={() => {
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1);
        }}
        textStyle={animatingText}
      >
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
  fontWeight: 500,

  lineHeight: 1,
  color: "var(--accent)",
};

const label: React.CSSProperties = {
  fontSize: 24,
};

const animatingText: React.CSSProperties = {
  fontSize: "calc(24px + 4.5vw)",
  fontWeight: 700,
  lineHeight: "calc(48px + 3vw)",
  letterSpacing: "-0.4rem",
  textTransform: "uppercase",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
};

const cursor: React.CSSProperties = {
  background: "#66ff00",
  width: 8,
  borderRadius: 4,
  marginLeft: 4,
  minHeight: "calc(24px + 3.8vw)",
};
