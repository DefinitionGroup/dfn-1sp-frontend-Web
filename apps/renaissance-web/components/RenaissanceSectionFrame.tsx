import type {
  RenaissanceDesktopTopMargin,
  RenaissanceSectionBand,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";
import RenaissancePeopleProof from "./RenaissancePeopleProof";
import RenaissanceSectionBadge from "./RenaissanceSectionBadge";

const roleConfig: Record<
  RenaissanceSectionRole,
  { id: string; surface: string; tone: "light" | "dark" }
> = {
  stories: { id: "stories", surface: "bg-renaissance-paper", tone: "light" },
  services: { id: "services", surface: "bg-renaissance-paper", tone: "light" },
  people: { id: "people", surface: "bg-renaissance-ink text-white", tone: "dark" },
  origins: { id: "origins", surface: "bg-renaissance-paper", tone: "light" },
  reach: { id: "global-reach", surface: "bg-renaissance-mist", tone: "light" },
  joinUs: { id: "join-us", surface: "bg-renaissance-button", tone: "light" },
  contact: { id: "contact", surface: "bg-renaissance-paper", tone: "light" },
};

const desktopTopMarginClass: Record<RenaissanceDesktopTopMargin, string> = {
  none: "",
  "8": "lg:mt-8",
  "16": "lg:mt-16",
  "24": "lg:mt-24",
};

export default function RenaissanceSectionFrame({
  marker,
  children,
  showLegacyPeopleProof = false,
}: {
  marker: RenaissanceSectionBand;
  children: React.ReactNode;
  showLegacyPeopleProof?: boolean;
}) {
  if (!marker.sectionRole) return <>{children}</>;
  const config = roleConfig[marker.sectionRole];
  const isCompactBand = ["services", "origins", "joinUs"].includes(
    marker.sectionRole,
  );
  const isJoinUsBand = marker.sectionRole === "joinUs";
  const hasMobileSeparation =
    isJoinUsBand || marker.sectionRole === "origins";
  const desktopTopMargin = isJoinUsBand
    ? "none"
    : marker.desktopTopMargin ??
      (marker.sectionRole === "origins" ? "24" : "none");
  const desktopMargin = desktopTopMarginClass[desktopTopMargin] ?? "";

  return (
    <section
      id={config.id}
      data-navpoint-name={marker.badgeLabel || marker.sectionRole}
      data-renaissance-section={marker.sectionRole}
      data-desktop-top-margin={desktopTopMargin}
      data-top-border={marker.topBorder ? "true" : undefined}
      className={`relative scroll-mt-24 overflow-hidden font-renaissance md:scroll-mt-28 ${hasMobileSeparation ? "max-lg:mt-12" : ""} ${isJoinUsBand ? "lg:rounded-t-statement lg:pt-8" : ""} ${desktopMargin} ${config.surface}`}
    >
      {marker.topBorder ? (
        <div
          aria-hidden="true"
          data-section-top-border-container
          className="relative z-10 mx-auto mb-8 w-full max-w-[1680px]"
        >
          <div
            data-section-top-border
            className="mx-5 h-[3px] bg-renaissance-button sm:mx-8 lg:mx-12"
          />
        </div>
      ) : null}
      <div
        className={`relative z-10 mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12 ${
          isCompactBand ? "pt-2" : "pt-14 md:pt-20"
        }`}
      >
        {marker.badgeLabel ? (
          <RenaissanceSectionBadge
            label={marker.badgeLabel}
            tone={config.tone}
            animationMode={marker.badgeAnimationMode}
          />
        ) : null}
      </div>
      <div className="relative z-[1]">{children}</div>
      {marker.sectionRole === "people" && showLegacyPeopleProof ? (
        <RenaissancePeopleProof />
      ) : null}
    </section>
  );
}
