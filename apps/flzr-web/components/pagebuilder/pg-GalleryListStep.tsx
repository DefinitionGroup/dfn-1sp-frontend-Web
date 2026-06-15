"use client";
import type { GalleryListStep } from "@1sp/sanity-types";
import ListStep from "./ShowtimeGallerySteps/pg-ListStep";


type Props = { data: GalleryListStep } | GalleryListStep;

function GalleryListStepWrapper(props: Props) {
  const step: GalleryListStep =
    "data" in props ? props.data : props;

  if (!step) return null;

  return <ListStep step={step as any} />;
}

export default GalleryListStepWrapper;
