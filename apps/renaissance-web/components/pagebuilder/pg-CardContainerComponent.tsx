"use client";

import type { CardContainerComponent as CardContainerComponentType } from "@1sp/sanity-types";
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
}: {
  data: CardContainerComponentType;
}) {
  if (!data?.cards?.length) return null;

  const columns = [2, 3, 5, 6].includes(data.columns || 0)
    ? (data.columns as 2 | 3 | 5 | 6)
    : 3;

  return (
    <section
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
        {data.cards.map((card, index) => (
          <CardInsideComponent
            key={card._key || `${card.headline || "card"}-${index}`}
            card={card}
          />
        ))}
      </StaggeredFadeIn>
    </section>
  );
}
