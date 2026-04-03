"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  const entries = useMemo(
    () => text.filter((entry) => entry.trim().length > 0),
    [text]
  );
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIndex(0);
    setDisplayText("");
    setIsDeleting(false);
  }, [entries]);

  useEffect(() => {
    const current = entries[index] ?? "";
    if (!current) return;

    let timeoutId: number | undefined;

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timeoutId = window.setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, 70);
      } else {
        timeoutId = window.setTimeout(() => {
          setIsDeleting(true);
        }, 1200);
      }
    } else if (displayText.length > 0) {
      timeoutId = window.setTimeout(() => {
        setDisplayText(current.slice(0, displayText.length - 1));
      }, 28);
    } else {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % entries.length);
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [displayText, entries, index, isDeleting]);

  return (
    <h2 className="typewriter-rotator  flex flex-col flex-wrap items-start  w-full font-aspekta font-medium leading-[0.8] text-accent"
      style={{ maxWidth: 900 }}>
      <div style={textStyle}>
        {displayText}
        <span
          aria-hidden="true"
          className="inline-block animate-pulse"
          style={cursorStyle}
        />
      </div>
    </h2>
  );
}

const cursorStyle: React.CSSProperties = {
  background: "#66ff00",
  display: "inline-block",
  width: "var(--tw-cursor-w)" as string,
  borderRadius: "var(--tw-cursor-radius)" as string,
  marginLeft: "var(--tw-cursor-ml)" as string,
  height: "var(--tw-cursor-h)",
};

const textStyle: React.CSSProperties = {
  fontSize: "var(--tw-text-size)",
  fontWeight: 500,
  // lineHeight: "var(--tw-text-lh)",
  letterSpacing: "var(--tw-text-ls)",
  textTransform: "uppercase",
  color: "var(--text-primary)",
  whiteSpace: "normal",
};
