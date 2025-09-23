"use client";
import React from "react";
import type {
  ShowtimeGallery as ShowtimeGalleryType,
  GalleryStep,
} from "@/types/sanity.types";

import HeroStep from "./GalleryParts/HeroStep";
import CardsStep from "./GalleryParts/CardsStep";
import ListStep from "./GalleryParts/ListStep";
import HighlightStep from "./GalleryParts/HighlightStep";
import PeopleStep from "./GalleryParts/PeopleStep";
import RevealStep from "./GalleryParts/RevealStep";
import OverviewStep from "./GalleryParts/OverviewStep";

type Props = { data: ShowtimeGalleryType } | ShowtimeGalleryType;

function kindFrom(
  step: any
):
  | "hero"
  | "cards"
  | "list"
  | "people"
  | "highlight"
  | "reveal"
  | "overview"
  | undefined {
  if (!step) return undefined;
  if (step.type) return step.type;

  const map: Record<
    string,
    "hero" | "cards" | "list" | "people" | "highlight" | "reveal" | "overview"
  > = {
    galleryHeroStep: "hero",
    galleryCardsStep: "cards",
    galleryListStep: "list",
    galleryPeopleStep: "people",
    galleryScrollHighlightStep: "highlight",
    galleryRevealStep: "reveal",
    galleryOverview: "overview",
  };
  return map[step._type as keyof typeof map];
}

export default function ShowtimeGallery(props: Props) {
  const gallery: ShowtimeGalleryType =
    "steps" in props ? (props as ShowtimeGalleryType) : (props as any).data;

  const steps = gallery?.steps ?? [];
  if (!steps.length) return null;

  return (
    <>
      {steps.map(
        (raw: GalleryStep & { _type?: string; _key?: string }, idx) => {
          const kind = kindFrom(raw);
          const key = raw?._key ?? `${kind ?? "step"}-${idx}`;

          switch (kind) {
            case "hero":
              return <HeroStep key={key} step={raw as any} />;
            case "cards":
              return <CardsStep key={key} step={raw as any} />;
            case "list":
              return <ListStep key={key} step={raw as any} />;
            case "people":
              return <PeopleStep key={key} step={raw as any} />;
            case "highlight":
              return <HighlightStep key={key} step={raw as any} />;
            case "reveal":
              return <RevealStep key={key} step={raw as any} />;
            case "overview":
              return <OverviewStep key={key} step={raw as any} />;
            default:
              // Unknown step type — skip safely
              return null;
          }
        }
      )}
    </>
  );
}
