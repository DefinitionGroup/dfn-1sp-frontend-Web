"use client";

import { delay, wrap } from "motion";
import { Typewriter } from "motion-plus/react";
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SMALL_TOUCH_LANDSCAPE_MEDIA_QUERY } from "@/lib/responsive";

export default function TypewriterRotator({
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
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isIphoneLandscape = useMediaQuery(SMALL_TOUCH_LANDSCAPE_MEDIA_QUERY);

  const cursorStyle: React.CSSProperties = {
    background: "#66ff00",
    width: isMobile ? 4 : 8,
    borderRadius: isMobile ? 2 : 4,
    marginLeft: isMobile ? 2 : 4,
    minHeight: isMobile ? "calc(24px + 4vw)" : "calc(20px + 3vw)",
  };

  const cursorStyleIPL: React.CSSProperties = {
    background: "#66ff00",
    width: 3,
    borderRadius: 2,
    marginLeft: 2,
    minHeight: "calc(14px + 1.5vw)",
  };

  return (
    <h2 style={container}>
      <Typewriter
        as="div"
        variance={2.8}
        speed={"slow"}
        backspace="character"
        cursorBlinkDuration={0.26}
        cursorStyle={isIphoneLandscape ? cursorStyleIPL : cursorStyle}
        textStyle={isIphoneLandscape ? animatingTextIPL : animatingText}
        onComplete={() => {
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1);
        }}
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
  flexWrap: "wrap",
  maxWidth: "90%",
  alignItems: "flex-start",
  gap: 0,
  flexDirection: "column",
  fontFamily: "var(--font-aspekta)",
  width: 900,
  fontWeight: 500,
  lineHeight: 0.8,
  color: "var(--accent)",


};

const animatingText: React.CSSProperties = {
  fontSize: "min(10vw, 5rem)",
  fontWeight: 500,
  lineHeight: "min(9vw, 5rem)",
  letterSpacing: " - 0.1rem",

  textTransform: "uppercase",
  color: "var(--text-primary)",
  whiteSpace: "wrap",
};

const animatingTextIPL: React.CSSProperties = {
  fontSize: "min(5vw, 1.75rem)",
  fontWeight: 500,
  lineHeight: "min(7vw, 2.75rem)",
  letterSpacing: " - 0.1rem",
  textTransform: "uppercase",
  color: "var(--text-primary)",
  whiteSpace: "wrap",
};
