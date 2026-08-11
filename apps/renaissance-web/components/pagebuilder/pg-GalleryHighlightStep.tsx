"use client";
import type { GalleryScrollHighlightStep } from "@1sp/sanity-types";
import HighlightStep from "./ShowtimeGallerySteps/pg-HighlightStep";

type Props = { data: GalleryScrollHighlightStep } | GalleryScrollHighlightStep;

function GalleryHighlightStepWrapper(props: Props) {
  const step: GalleryScrollHighlightStep =
    "data" in props ? props.data : props;

  if (!step) return null;

  return <HighlightStep step={step as any} />;
}

export default GalleryHighlightStepWrapper;
