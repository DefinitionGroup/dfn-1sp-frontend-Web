import type {
  FlzrSectionBand,
  FlzrSectionSurfaceTone,
} from "@1sp/sanity-types";

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

  return (
    <div className="flzr-section-band container mx-auto my-12" data-surface={surfaceTone}>
      {hasBadge ? (
        <div className="flzr-section-badge">
          <span className="flzr-section-badge__number" aria-hidden="true">
            {badgeNumber}
          </span>
          <strong className="flzr-section-badge__label">{badgeLabel}</strong>
        </div>
      ) : null}
      <div
        className={`flzr-section-surface relative mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8 py-16 ${SURFACE_CLASSES[surfaceTone]}`}
      >
        {children}
      </div>
    </div>
  );
}
