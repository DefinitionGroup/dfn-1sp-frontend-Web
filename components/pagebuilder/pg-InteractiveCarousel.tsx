"use client";
import type { Carousel } from "@/types/sanity.types";
import InteractiveCarousel from "./Fragments/pg-InteractiveCarousel";

type Props = { data: Carousel } | Carousel;

export default function InteractiveCarouselWrapper(props: Props) {
  const carousel: Carousel = "items" in props ? props : (props as any).data;

  if (!carousel?.items || carousel.items.length === 0) return null;

  return <InteractiveCarousel items={carousel.items as any} />;
}
