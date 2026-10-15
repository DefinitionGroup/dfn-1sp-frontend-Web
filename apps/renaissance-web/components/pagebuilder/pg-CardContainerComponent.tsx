"use client";

import type {
  CardContainerComponent as CardContainerComponentType,
  RenaissanceSectionRole,
} from "@1sp/sanity-types";
import {resolveServiceCard} from "@renaissance/lib/serviceContent";
import StaggeredFadeIn from "@renaissance/components/ui/StaggeredFadeIn";
import CardInsideComponent from "./Fragments/CardInsideComponent";

const columnClasses: Record<2 | 3 | 5 | 6, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export default function CardContainerComponent({
  data,
  presentationRole,
}: {
  data: CardContainerComponentType;
  presentationRole?: RenaissanceSectionRole;
}) {
  const cards = (data?.cards || []).map(resolveServiceCard).filter((card): card is NonNullable<typeof card> => !!card);
  if (!cards.length) return null;

  const columns = [2, 3, 5, 6].includes(data.columns || 0)
    ? (data.columns as 2 | 3 | 5 | 6)
    : 3;
  const sectionId = data.navPointName
    ? data.navPointName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
    : undefined;

  if (presentationRole === "services") {
    return (
      <div className="mx-auto max-w-[1680px] px-5 pb-16 sm:px-8 md:pb-24 lg:px-12">
        <div className={`grid grid-cols-1 gap-x-2 gap-y-2 sm:grid-cols-2 ${columnClasses[columns]}`}>
          {cards.map((card, index) => (
            <CardInsideComponent
              key={card._key || `${card.headline || "card"}-${index}`}
              card={card}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      id={sectionId}
      className="w-full py-section"
      {...(data.navPointName ? { "data-navpoint-name": data.navPointName } : {})}
      {...(data.hideFromNav ? { "data-nav-hidden": "true" } : {})}
    >
      <StaggeredFadeIn
        className={`container mx-auto grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-y-16 ${columnClasses[columns]}`}
        staggerDelay={0.08}
        duration={0.7}
        direction="up"
        distance={28}
        viewThreshold={0.08}
      >
        {cards.map((card, index) => (
          <CardInsideComponent
            key={card._key || `${card.headline || "card"}-${index}`}
            card={card}
            index={index}
          />
        ))}
      </StaggeredFadeIn>
    </section>
  );
}
