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
  align = "left",
}: {
  text?: string[];
  align?: "left" | "center";
}) {
  const [index, setIndex] = useState(0);
  const isCentered = align === "center";

  return (
    <h2
      className={`typewriter-rotator flex flex-col flex-wrap ${isCentered ? "items-center" : "items-start"} w-full font-aspekta leading-[0.8]`}
      style={{ maxWidth: 900 }}
    >
      <Typewriter
        as="div"
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
          delay(() => setIndex(wrap(0, text.length, index + 1)), 1);
        }}
      >
        {text[index + 1]}
      </Typewriter>
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
  letterSpacing: "var(--tw-text-ls)",
  textTransform: "",
  color: "var(--color-flzr-violet)",
  whiteSpace: "normal",
};
