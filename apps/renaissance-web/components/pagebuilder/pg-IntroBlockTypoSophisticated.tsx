"use client";

import type {
  IntroBlockTypoSophisticated,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";
import { resolveRenaissanceIntroLayout } from "@renaissance/lib/renaissanceIntroLayout";
import PeopleIntroLayout from "./Fragments/PeopleIntroLayout";

export default function IntroBlockTypoSophisticated({
  data,
  presentationRole,
}: {
  data: IntroBlockTypoSophisticated;
  presentationRole?: RenaissanceSectionRole;
}) {
  const {
    header,
    description,
    renaissanceLayout,
    navPointName,
    hideFromNav = false,
  } = data || {};
  const sectionIdSource = navPointName || header?.mainHeadline;
  const sectionId = sectionIdSource
    ? sectionIdSource
        .substring(0, 40)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "intro-typo-sophisticated";

  if (presentationRole) {
    const isDark = presentationRole === "people";
    const layout = resolveRenaissanceIntroLayout(
      renaissanceLayout,
      presentationRole,
    );

    if (layout === "compact") {
      return (
        <div
          className="mx-auto max-w-[1680px] px-5 pb-8 pt-8 sm:px-8 md:pb-8 md:pt-10 lg:px-12"
          data-component="intro-block-typo-sophisticated"
        >
          {hasVisibleText(header?.mainHeadline) ? (
            <h2
              className={`renaissance-display max-w-[34ch] text-[clamp(2.65rem,3.5vw,3.75rem)] font-bold leading-[0.9] tracking-[-0.025em] ${
                isDark ? "text-white" : "text-renaissance-ink"
              }`}
            >
              {header?.mainHeadline}
            </h2>
          ) : null}
          {hasVisibleText(description) ? (
            <p
              className={`mt-6 max-w-[62ch] text-[clamp(1.05rem,1.3vw,1.375rem)] leading-[1.4] ${
                isDark ? "text-white/78" : "text-renaissance-ink/75"
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div
        className="mx-auto grid max-w-[1680px] gap-8 px-5 pb-10 pt-10 sm:px-8 md:grid-cols-12 md:gap-x-10 md:pb-16 md:pt-14 lg:px-12"
        data-component="intro-block-typo-sophisticated"
      >
        {hasVisibleText(header?.mainHeadline) ? (
          <h2
            className={`renaissance-display text-[clamp(3.2rem,6.5vw,8rem)] font-bold leading-[0.84] md:col-span-7 ${
              isDark ? "text-white" : "text-renaissance-ink"
            }`}
          >
            {header?.mainHeadline}
          </h2>
        ) : null}
        {hasVisibleText(description) ? (
          <p
            className={`max-w-[39rem] text-[clamp(1.1rem,1.55vw,1.75rem)] leading-[1.25] md:col-span-4 md:col-start-9 md:pt-2 ${
              isDark ? "text-white/78" : "text-renaissance-ink"
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <section
      id={sectionId}
      {...(navPointName ? { "data-navpoint-name": navPointName } : {})}
      {...(hideFromNav ? { "data-nav-hidden": "true" } : {})}
      className="relative z-0 grid grid-cols-12 font-renaissance"
      data-component="intro-block-typo-sophisticated"
    >
      <div className="relative z-2 col-span-12 col-start-1 row-start-1 w-full">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 py-16 sm:grid-cols-6 sm:py-24 md:grid-cols-12 lg:gap-8 lg:py-32 iphone-landscape:grid-cols-12">
            <div className="col-span-4 sm:col-span-6 md:col-span-12 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1">
              <PeopleIntroLayout
                header={header}
                description={description}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
