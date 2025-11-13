"use client";
import type { GalleryCardsStep } from "@/types/sanity.types";
import CardsStep from "./ShowtimeGallerySteps/pg-CardsStep";

type Props = { data: GalleryCardsStep } | GalleryCardsStep;

export default function GalleryCardsStepWrapper(props: Props) {
  const step: GalleryCardsStep =
    "expandableCards" in props || "badge" in props
      ? props
      : (props as any).data;

  if (!step) return null;

  return <CardsStep step={step as any} />;
}
