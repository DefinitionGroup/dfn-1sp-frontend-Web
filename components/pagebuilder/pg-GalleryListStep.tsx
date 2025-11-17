"use client";
import type { GalleryListStep } from "@/types/sanity.types";
import ListStep from "./ShowtimeGallerySteps/pg-ListStep";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props = { data: GalleryListStep } | GalleryListStep;

function GalleryListStepWrapper(props: Props) {
  const step: GalleryListStep =
    "listItems" in props || "badge" in props ? props : (props as any).data;

  if (!step) return null;

  return <ListStep step={step as any} />;
}

export default withDebugBadge(GalleryListStepWrapper, "pg-GalleryListStep");
