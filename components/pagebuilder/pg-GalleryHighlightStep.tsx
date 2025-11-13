"use client";
import type { GalleryScrollHighlightStep } from "@/types/sanity.types";
import HighlightStep from "./ShowtimeGallerySteps/pg-HighlightStep";

type Props = { data: GalleryScrollHighlightStep } | GalleryScrollHighlightStep;

export default function GalleryHighlightStepWrapper(props: Props) {
  const step: GalleryScrollHighlightStep =
    "scrollHighlightContent" in props || "badge" in props
      ? props
      : (props as any).data;

  if (!step) return null;

  return <HighlightStep step={step as any} />;
}
