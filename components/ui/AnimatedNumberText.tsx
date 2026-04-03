"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface AnimatedNumberTextProps {
  value: number;
  className?: string;
  duration?: number;
  format?: {
    minimumIntegerDigits?: number;
  };
  suffix?: string;
}

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

export default function AnimatedNumberText({
  value,
  className,
  duration = 1.2,
  format = { minimumIntegerDigits: 1 },
  suffix = "",
}: AnimatedNumberTextProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumIntegerDigits: format.minimumIntegerDigits,
      }),
    [format.minimumIntegerDigits]
  );

  useEffect(() => {
    const previousValue = previousValueRef.current;
    if (previousValue === value) {
      setDisplayValue(value);
      return;
    }

    const durationMs = Math.max(0, duration * 1000);
    if (durationMs === 0) {
      previousValueRef.current = value;
      setDisplayValue(value);
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const easedProgress = easeOutCubic(progress);
      const nextValue =
        previousValue + (value - previousValue) * easedProgress;

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, value]);

  return (
    <span className={className}>
      {formatter.format(Math.round(displayValue))}
      {suffix}
    </span>
  );
}
