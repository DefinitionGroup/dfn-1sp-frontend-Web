"use client";

import type { IntroBlockTypoSophisticated } from "@1sp/sanity-types";
import PeopleIntroLayout from "./Fragments/PeopleIntroLayout";

export default function IntroBlockTypoSophisticated({
  data,
}: {
  data: IntroBlockTypoSophisticated;
}) {
  const { header, description, navPointName, hideFromNav = false } = data || {};
  const sectionId = header?.mainHeadline
    ? header.mainHeadline
        .substring(0, 40)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : "intro-typo-sophisticated";

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
