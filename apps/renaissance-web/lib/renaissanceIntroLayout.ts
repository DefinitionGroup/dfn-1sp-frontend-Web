import { stegaClean } from "@sanity/client/stega";
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
  const layout = stegaClean(override);
  if (layout === "compact" || layout === "editorial") return layout;

  return presentationRole === "stories" || presentationRole === "services" || presentationRole === "people"
    ? "compact"
    : "editorial";
}
