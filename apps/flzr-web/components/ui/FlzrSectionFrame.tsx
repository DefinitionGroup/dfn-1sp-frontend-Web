import type {
  FlzrSectionBand,
  FlzrSectionSurfaceTone,
} from "@1sp/sanity-types";
import FlzrSectionLabel from "./FlzrSectionLabel";

type FlzrSectionFrameProps = {
  marker: FlzrSectionBand;
  children: React.ReactNode;
};

const SURFACE_CLASSES: Record<FlzrSectionSurfaceTone, string> = {
  paper: "flzr-section-surface--paper",
  soft: "flzr-section-surface--soft",
  fade: "flzr-section-surface--fade",
};

export default function FlzrSectionFrame({
  marker,
  children,
}: FlzrSectionFrameProps) {
  const surfaceTone = marker.surfaceTone && marker.surfaceTone in SURFACE_CLASSES
    ? marker.surfaceTone
    : "fade";
  const showBadge = marker.showBadge !== false;
  const badgeNumber = marker.badgeNumber?.trim();
  const badgeLabel = marker.badgeLabel?.trim();
  const hasBadge = showBadge && Boolean(badgeNumber && badgeLabel);
  const sectionName = badgeLabel
    ? badgeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "section";
  const labelTone = sectionName === "careers" ? "accent" : "neutral";

  return (
    <div
      className="flzr-section-band"
      data-surface={surfaceTone}
      data-section={sectionName}
    >
      <div
        className={`flzr-section-surface ${SURFACE_CLASSES[surfaceTone]}`}
      >
        {hasBadge ? (
          <FlzrSectionLabel
            number={badgeNumber!}
            label={badgeLabel!}
            tone={labelTone}
          />
        ) : null}
        <div className="flzr-section-content">{children}</div>
      </div>
    </div>
  );
}
