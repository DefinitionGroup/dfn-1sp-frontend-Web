"use client";
import type { GalleryOverview } from "@/types/sanity.types";
import OverviewStep from "./ShowtimeGallerySteps/pg-OverviewStep";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props = { data: GalleryOverview } | GalleryOverview;

function GalleryOverviewStepWrapper(props: Props) {
  const step: GalleryOverview =
    "headline" in props || "eyebrow" in props ? props : (props as any).data;

  if (!step) return null;

  return <OverviewStep step={step as any} />;
}

export default withDebugBadge(
  GalleryOverviewStepWrapper,
  "pg-GalleryOverviewStep"
);
