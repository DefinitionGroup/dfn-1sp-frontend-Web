import type {
  IntroBlockTypoSophisticated,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";

export type RenaissanceIntroLayout = NonNullable<
  IntroBlockTypoSophisticated["renaissanceLayout"]
>;

export function resolveRenaissanceIntroLayout(
  override: IntroBlockTypoSophisticated["renaissanceLayout"],
  presentationRole?: RenaissanceSectionRole,
): RenaissanceIntroLayout {
  if (override) return override;

  return presentationRole === "stories" || presentationRole === "services" || presentationRole === "people"
    ? "compact"
    : "editorial";
}
