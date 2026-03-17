"use client";

import { delay, wrap } from "motion";
import { Typewriter } from "motion-plus/react";
import React, { useState } from "react";

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

  return (
    <h2 className="typewriter-rotator flex flex-col flex-wrap items-start max-w-[90%] w-full font-aspekta font-medium leading-[0.8] text-accent"
      style={{ maxWidth: 900 }}>
      <Typewriter
        as="div"
        variance={2.8}
        speed="slow"
        backspace="character"
        cursorBlinkDuration={0.26}
        cursorStyle={cursorStyle}
        textStyle={textStyle}
        onComplete={() => {
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1);
        }}
      >
        {text[index + 1]}
      </Typewriter>
    </h2>
  );
}

const cursorStyle: React.CSSProperties = {
  background: "#66ff00",
  width: "var(--tw-cursor-w)" as string,
  borderRadius: "var(--tw-cursor-radius)" as string,
  marginLeft: "var(--tw-cursor-ml)" as string,
  height: "var(--tw-cursor-h)",
  minHeight: "var(--tw-cursor-h)",
};

const textStyle: React.CSSProperties = {
  fontSize: "var(--tw-text-size)",
  fontWeight: 500,
  lineHeight: "var(--tw-text-lh)",
  letterSpacing: "var(--tw-text-ls)",
  textTransform: "uppercase",
  color: "var(--text-primary)",
  whiteSpace: "normal",
};
