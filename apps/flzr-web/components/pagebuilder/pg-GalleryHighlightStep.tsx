"use client";
import type { GalleryScrollHighlightStep } from "@/types/sanity.types";
import HighlightStep from "./ShowtimeGallerySteps/pg-HighlightStep";

type Props = { data: GalleryScrollHighlightStep } | GalleryScrollHighlightStep;

function GalleryHighlightStepWrapper(props: Props) {
  const step: GalleryScrollHighlightStep =
    "scrollHighlightContent" in props || "badge" in props
      ? props
      : (props as any).data;

  if (!step) return null;

  return <HighlightStep step={step as any} />;
}

export default GalleryHighlightStepWrapper;
