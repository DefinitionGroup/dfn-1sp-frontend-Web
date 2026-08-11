"use client";
import type { Carousel } from "@1sp/sanity-types";
import InteractiveCarousel from "./Fragments/pg-InteractiveCarousel";


type Props = { data: Carousel } | Carousel;

function InteractiveCarouselWrapper(props: Props) {
  const carousel: Carousel = "items" in props ? props : (props as any).data;

  if (!carousel?.items || carousel.items.length === 0) return null;

  return <InteractiveCarousel items={carousel.items as any} />;
}

export default InteractiveCarouselWrapper;
