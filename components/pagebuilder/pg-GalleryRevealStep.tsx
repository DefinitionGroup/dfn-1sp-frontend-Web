"use client";
import type { GalleryRevealStep } from "@/types/sanity.types";
import RevealStep from "./ShowtimeGallerySteps/pg-RevealStep";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props = { data: GalleryRevealStep } | GalleryRevealStep;

function GalleryRevealStepWrapper(props: Props) {
  const step: GalleryRevealStep =
    "items" in props || "badge" in props ? props : (props as any).data;

  if (!step) return null;

  return <RevealStep step={step as any} />;
}

export default withDebugBadge(
  GalleryRevealStepWrapper,
  "pg-GalleryRevealStep"
);
