"use client";
import type { GalleryCardsStep } from "@/types/sanity.types";
import CardsStep from "./ShowtimeGallerySteps/pg-CardsStep";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props = { data: GalleryCardsStep } | GalleryCardsStep;

function GalleryCardsStepWrapper(props: Props) {
  const step: GalleryCardsStep =
    "expandableCards" in props || "badge" in props
      ? props
      : (props as any).data;

  if (!step) return null;

  return <CardsStep step={step as any} />;
}

export default withDebugBadge(GalleryCardsStepWrapper, "pg-GalleryCardsStep");
