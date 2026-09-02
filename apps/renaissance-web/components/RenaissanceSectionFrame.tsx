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
  joinUs: { id: "join-us", surface: "bg-renaissance-paper", tone: "light" },
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
}: {
  marker: RenaissanceSectionBand;
  children: React.ReactNode;
}) {
  if (!marker.sectionRole) return <>{children}</>;
  const config = roleConfig[marker.sectionRole];
  const isCompactBand = ["services", "origins", "joinUs"].includes(
    marker.sectionRole,
  );
  const desktopTopMargin = marker.desktopTopMargin ?? "none";
  const desktopMargin = desktopTopMarginClass[desktopTopMargin] ?? "";

  return (
    <section
      id={config.id}
      data-navpoint-name={marker.badgeLabel || marker.sectionRole}
      data-renaissance-section={marker.sectionRole}
      data-desktop-top-margin={desktopTopMargin}
      className={`relative scroll-mt-24 overflow-hidden font-renaissance md:scroll-mt-28 ${desktopMargin} ${config.surface}`}
    >
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
      {marker.sectionRole === "people" ? <RenaissancePeopleProof /> : null}
    </section>
  );
}
