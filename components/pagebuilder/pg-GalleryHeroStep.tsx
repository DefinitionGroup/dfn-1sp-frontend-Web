"use client";
import type { GalleryHeroStep } from "@/types/sanity.types";
import HeroStep from "./ShowtimeGallerySteps/pg-HeroStep";

type Props = { data: GalleryHeroStep } | GalleryHeroStep;

export default function GalleryHeroStepWrapper(props: Props) {
  const step: GalleryHeroStep =
    "typewriterText" in props ? props : (props as any).data;

  if (!step) return null;

  return <HeroStep step={step} />;
}
