"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import type { RenaissanceBadgeAnimationMode } from "@1sp/sanity-types";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DECRYPT_DURATION_MS = 420;
const DECRYPT_STAGGER_MS = 34;
const LOOP_PAUSE_MS = 3200;
const SIGNET_DURATION_MS = 420;
const BRACKET_DURATION_MS = 360;
type BadgePhase = "waiting" | "signet" | "expanding" | "decrypting" | "readable";

function normalizeLabel(label: string) {
  return label.replace(/^\s*\[|\]\s*$/g, "").trim().toUpperCase();
}

export default function RenaissanceSectionBadge({
  label,
  tone: _tone = "light",
  animationMode = "once",
}: {
  label: string;
  tone?: "light" | "dark";
  animationMode?: RenaissanceBadgeAnimationMode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);
  const lastAnimationIdentity = useRef("");
  const normalized = normalizeLabel(label);
  const animationIdentity = `${normalized}:${animationMode}`;
  const reduceMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [animationState, setAnimationState] = useState({
    identity: "",
    phase: "waiting" as BadgePhase,
  });
  const phase = animationState.identity === animationIdentity
    ? animationState.phase
    : "waiting";
  const isDecrypting =
    phase === "decrypting" &&
    isInView &&
    isDocumentVisible &&
    !reduceMotion;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.7 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let animationTimer: number | undefined;
    let pauseTimer: number | undefined;
    let cancelled = false;

    const clearTimers = () => {
      if (animationTimer !== undefined) window.clearTimeout(animationTimer);
      if (pauseTimer !== undefined) window.clearTimeout(pauseTimer);
    };

    if (lastAnimationIdentity.current !== animationIdentity) {
      lastAnimationIdentity.current = animationIdentity;
      hasRun.current = false;
    }

    if (reduceMotion) {
      window.queueMicrotask(() => {
        if (cancelled) return;
        hasRun.current = true;
        setAnimationState({ identity: animationIdentity, phase: "readable" });
      });
      return () => { cancelled = true; };
    }

    if (!isInView || !isDocumentVisible) {
      return clearTimers;
    }

    if (animationMode === "once" && hasRun.current) {
      return clearTimers;
    }

    const animationDuration =
      DECRYPT_DURATION_MS + Math.max(0, normalized.length - 1) * DECRYPT_STAGGER_MS;

    const play = () => {
      if (cancelled) return;
      setAnimationState({ identity: animationIdentity, phase: "decrypting" });

      animationTimer = window.setTimeout(() => {
        hasRun.current = true;
        setAnimationState({ identity: animationIdentity, phase: "readable" });
        if (animationMode === "loop") {
          pauseTimer = window.setTimeout(play, LOOP_PAUSE_MS);
        }
      }, animationDuration);
    };

    window.queueMicrotask(() => {
      if (cancelled) return;
      if (hasRun.current) {
        setAnimationState({ identity: animationIdentity, phase: "readable" });
        pauseTimer = window.setTimeout(play, LOOP_PAUSE_MS);
        return;
      }
      setAnimationState({ identity: animationIdentity, phase: "signet" });
      animationTimer = window.setTimeout(() => {
        setAnimationState({ identity: animationIdentity, phase: "expanding" });
        animationTimer = window.setTimeout(play, BRACKET_DURATION_MS);
      }, SIGNET_DURATION_MS);
    });

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [
    animationIdentity,
    animationMode,
    isDocumentVisible,
    isInView,
    normalized,
    reduceMotion,
  ]);

  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-3 font-mono text-[0.72rem] font-semibold tracking-[0.13em] text-renaissance-signal"
      aria-label={`Section: ${normalized}`}
      data-badge-animation={animationMode}
      data-badge-phase={phase}
    >
      <span className="renaissance-badge-signet grid h-10 w-10 shrink-0 place-items-center rounded-full bg-renaissance-signal md:h-[3.15rem] md:w-[3.15rem]">
        <Image
          src="/renaissance/figma/section-badge.svg"
          alt=""
          width={51}
          height={51}
          className="h-full w-full"
          aria-hidden="true"
        />
      </span>
      <span aria-hidden="true" className="relative inline-flex whitespace-nowrap">
        <span>[</span>
        <span className="renaissance-badge-copy inline-flex px-[1ch]">
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
        </span>
        <span className="invisible">]</span>
        <span className="renaissance-badge-close pointer-events-none absolute inset-0 text-right">]</span>
      </span>
    </div>
  );
}
