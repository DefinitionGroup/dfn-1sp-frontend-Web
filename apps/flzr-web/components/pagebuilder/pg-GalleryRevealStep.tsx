"use client";
import type { GalleryRevealStep } from "@1sp/sanity-types";
import RevealStep from "./ShowtimeGallerySteps/pg-RevealStep";


type Props = { data: GalleryRevealStep } | GalleryRevealStep;

function GalleryRevealStepWrapper(props: Props) {
  const step: GalleryRevealStep =
    "data" in props ? props.data : props;

  if (!step) return null;

  return <RevealStep step={step as any} />;
}

export default GalleryRevealStepWrapper;
