"use client";
import type { GalleryPeopleStep } from "@1sp/sanity-types";
import PeopleStep from "./ShowtimeGallerySteps/pg-PeopleStep";


type Props = { data: GalleryPeopleStep } | GalleryPeopleStep;

function GalleryPeopleStepWrapper(props: Props) {
  const step: GalleryPeopleStep =
    "teamMembers" in props || "badge" in props ? props : (props as any).data;

  if (!step) return null;

  return <PeopleStep step={step as any} />;
}

export default GalleryPeopleStepWrapper;
