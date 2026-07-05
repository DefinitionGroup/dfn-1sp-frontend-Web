/**
 * Technical corner markers — four "+" glyphs at the corners of a section
 * (Vast Space blueprint grammar). Purely decorative: aria-hidden, no
 * pointer events. Parent must be `position: relative`.
 */
export default function CornerMarkers({
  className = "text-msm-cyan/40",
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
          className={`absolute font-mono text-base leading-none ${className}`}
          style={{ [v]: inset, [h]: inset } as React.CSSProperties}
        >
          +
        </span>
      ))}
    </div>
  );
}
