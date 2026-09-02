"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function normalizeLabel(label: string) {
  return label.replace(/^\s*\[|\]\s*$/g, "").trim().toUpperCase();
}

export default function RenaissanceSectionBadge({
  label,
  tone: _tone = "light",
}: {
  label: string;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);
  const normalized = normalizeLabel(label);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasRun.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.disconnect();
        setIsDecrypting(true);
      },
      { threshold: 0.7 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [normalized]);

  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-3 font-mono text-[0.72rem] font-semibold tracking-[0.13em] text-renaissance-signal"
      aria-label={`Section: ${normalized}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-renaissance-signal md:h-[3.15rem] md:w-[3.15rem]">
        <Image
          src="/renaissance/figma/section-badge.svg"
          alt=""
          width={51}
          height={51}
          className="h-full w-full"
          aria-hidden="true"
        />
      </span>
      <span aria-hidden="true" className="inline-flex min-w-[11ch] whitespace-nowrap">
        [&nbsp;
        {Array.from(normalized).map((character, index) => {
          if (character === " ") return <span key={`space-${index}`}>&nbsp;</span>;
          const glyphs = [0, 1, 2].map(
            (offset) => GLYPHS[(index * 11 + offset * 7) % GLYPHS.length],
          );

          return (
            <span
              key={`${character}-${index}`}
              className="inline-block h-[1.15em] w-[1ch] overflow-hidden"
            >
              {isDecrypting ? (
                <span
                  className="renaissance-decrypt-stack flex flex-col"
                  style={{ "--decrypt-index": index } as React.CSSProperties}
                >
                  {[...glyphs, character].map((glyph, glyphIndex) => (
                    <span key={`${glyph}-${glyphIndex}`} className="h-[1.15em] shrink-0">
                      {glyph}
                    </span>
                  ))}
                </span>
              ) : (
                character
              )}
            </span>
          );
        })}
        &nbsp;]
      </span>
    </div>
  );
}
