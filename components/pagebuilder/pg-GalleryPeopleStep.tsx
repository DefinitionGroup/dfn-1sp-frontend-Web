"use client";
import type { GalleryPeopleStep } from "@/types/sanity.types";
import PeopleStep from "./ShowtimeGallerySteps/pg-PeopleStep";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props = { data: GalleryPeopleStep } | GalleryPeopleStep;

function GalleryPeopleStepWrapper(props: Props) {
  const step: GalleryPeopleStep =
    "teamMembers" in props || "badge" in props ? props : (props as any).data;

  if (!step) return null;

  return <PeopleStep step={step as any} />;
}

export default withDebugBadge(
  GalleryPeopleStepWrapper,
  "pg-GalleryPeopleStep"
);
