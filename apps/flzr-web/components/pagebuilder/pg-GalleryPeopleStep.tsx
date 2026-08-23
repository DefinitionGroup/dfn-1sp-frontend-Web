"use client";
import type { GalleryPeopleStep } from "@1sp/sanity-types";
import PeopleStep from "./ShowtimeGallerySteps/pg-PeopleStep";


type Props =
  | { data: GalleryPeopleStep; inheritSectionSurface?: boolean }
  | (GalleryPeopleStep & { inheritSectionSurface?: boolean });

function GalleryPeopleStepWrapper(props: Props) {
  const step: GalleryPeopleStep =
    "data" in props ? props.data : props;

  if (!step) return null;

  return (
    <PeopleStep
      step={step as any}
      inheritSectionSurface={props.inheritSectionSurface}
    />
  );
}

export default GalleryPeopleStepWrapper;
