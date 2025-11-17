"use client";
import type { GalleryHeroStep } from "@/types/sanity.types";
import HeroStep from "./ShowtimeGallerySteps/pg-HeroStep";
import { withDebugBadge } from "@/components/dev/withDebugBadge";

type Props = { data: GalleryHeroStep } | GalleryHeroStep;

function GalleryHeroStepWrapper(props: Props) {
  const step: GalleryHeroStep =
    "typewriterText" in props ? props : (props as any).data;

  if (!step) return null;

  return <HeroStep step={step} />;
}

export default withDebugBadge(GalleryHeroStepWrapper, "pg-GalleryHeroStep");
