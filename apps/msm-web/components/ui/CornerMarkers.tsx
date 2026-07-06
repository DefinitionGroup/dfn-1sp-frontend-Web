/**
 * Technical corner markers — four "+" glyphs at the corners of a container
 * (Vast Space blueprint grammar). Purely decorative: aria-hidden, no
 * pointer events. Parent must be `position: relative`.
 *
 * System pattern: used to frame components without borders (hero sections,
 * badges, media frames). Size and color come via className (defaults:
 * cyan/40, text-base); density comes via inset.
 */
export default function CornerMarkers({
  className = "text-msm-cyan/40 text-base",
  inset = "1rem",
}: {
  className?: string;
  inset?: string;
}) {
  const positions: Array<[string, string]> = [
    ["top", "left"],
    ["top", "right"],
    ["bottom", "left"],
    ["bottom", "right"],
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 select-none">
      {positions.map(([v, h]) => (
        <span
          key={`${v}-${h}`}
          className={`absolute font-mono leading-none ${className}`}
          style={{ [v]: inset, [h]: inset } as React.CSSProperties}
        >
          +
        </span>
      ))}
    </div>
  );
}
