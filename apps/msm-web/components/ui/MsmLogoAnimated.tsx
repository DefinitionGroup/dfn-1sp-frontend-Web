"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The MSM cube mark as a living SVG: individual facets ambiently flip to a
 * sibling facet color, linger, then flip home — same idle behavior (and
 * timing constants) as the MosaicButton's atmospheric tiles.
 *
 * Deterministic on first paint (original facet colors), animation starts on
 * mount, disabled entirely under prefers-reduced-motion.
 */

// Facets transcribed from public/units/MSM/msm_logo.svg (viewBox 0 0 26 26).
const FACETS: Array<{ d: string; fill: string }> = [
  { d: "M6.35352 22.0088L12.7066 25.6746V24.6993V20.1565V18.3384L6.35352 22.0088Z", fill: "#028FA3" },
  { d: "M12.7061 20.1565V24.6993V25.6744L19.0592 22.0088L12.7061 18.3384V20.1565Z", fill: "#02A8B2" },
  { d: "M12.7061 18.3382L19.0592 22.0084V20.19V15.6474V14.6724L12.7061 18.3382Z", fill: "#03B8D4" },
  { d: "M19.0596 15.6474V20.19V22.0086L25.4124 18.3382L19.0596 14.6724V15.6474Z", fill: "#03B8D4" },
  { d: "M19.0596 14.668L25.4124 18.3382V11.002L19.0596 14.668Z", fill: "#02A8B2" },
  { d: "M19.0596 7.33621L25.4124 11.002V3.66602L19.0596 7.33621Z", fill: "#05ABB5" },
  { d: "M19.0596 9.15457V13.6971V14.6724L25.4124 11.0064L19.0596 7.33643V9.15457Z", fill: "#039CAB" },
  { d: "M19.0596 0V0.975075V5.51786V7.33625L25.4124 3.66605L19.0596 0Z", fill: "#00A8CC" },
  { d: "M19.0592 0L12.7061 3.66605L19.0592 7.33625V5.51786V0.975075V0Z", fill: "#028FA3" },
  { d: "M19.0592 7.33621L12.7061 3.66602V5.4844V10.0269V11.002L19.0592 7.33621Z", fill: "#FAB312" },
  { d: "M6.35352 7.33621L12.7066 3.66602V5.4844V10.0269V11.002L6.35352 7.33621Z", fill: "#F5991C" },
  { d: "M0 5.4844V10.0269V11.002L6.35312 7.33621L0 3.66602V5.4844Z", fill: "#ED4033" },
  { d: "M6.35352 0V0.975075V5.51786V7.33625L12.7066 3.66605L6.35352 0Z", fill: "#F79B19" },
  { d: "M6.35312 0L0 3.66605L6.35312 7.33625V5.51786V0.975075V0Z", fill: "#F27226" },
  { d: "M0 11.9773V16.5198V18.3382L6.35312 14.668L0 11.002V11.9773Z", fill: "#8F0031" },
  { d: "M12.7066 11.0061L6.35352 7.33594V9.15432V13.6969V14.6722L12.7066 11.0061Z", fill: "#D10DAB" },
  { d: "M0 11.0064L6.35312 14.6727V13.6971V9.15456V7.33643L0 11.0064Z", fill: "#D61E45" },
  { d: "M0 18.3382L6.35312 22.0086V20.19V15.6474V14.6724L0 18.3382Z", fill: "#91198E" },
];

// MosaicButton ambient idle constants (kept in sync by convention)
const AMBIENT_MAX = 3;
const AMBIENT_SPAWN_MIN = 0.7;
const AMBIENT_SPAWN_VAR = 1.8;
const AMBIENT_LINGER_MIN = 2.0;
const AMBIENT_LINGER_VAR = 3.0;

export default function MsmLogoAnimated({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // index -> temporary fill override
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (!cancelled) fn();
      }, ms);
      timeouts.add(id);
    };

    const spawn = () => {
      const active = Object.keys(overridesRef.current).length;
      if (active < AMBIENT_MAX) {
        const idx = Math.floor(Math.random() * FACETS.length);
        if (overridesRef.current[idx] === undefined) {
          // borrow a color from a different facet — stays inside the mark's
          // own palette, like the mosaic's "fresh logo color"
          let donor = idx;
          while (donor === idx) donor = Math.floor(Math.random() * FACETS.length);
          const color = FACETS[donor].fill;
          setOverrides((o) => ({ ...o, [idx]: color }));
          later(() => {
            setOverrides((o) => {
              const next = { ...o };
              delete next[idx];
              return next;
            });
          }, (AMBIENT_LINGER_MIN + Math.random() * AMBIENT_LINGER_VAR) * 1000);
        }
      }
      later(spawn, (AMBIENT_SPAWN_MIN + Math.random() * AMBIENT_SPAWN_VAR) * 1000);
    };

    later(spawn, 400);
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {FACETS.map((f, i) => (
        <path
          key={i}
          fillRule="evenodd"
          clipRule="evenodd"
          d={f.d}
          fill={overrides[i] ?? f.fill}
          style={{ transition: "fill 0.5s cubic-bezier(0.62, 0.05, 0.01, 0.99)" }}
        />
      ))}
    </svg>
  );
}
