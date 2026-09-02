"use client";
import type {
  Carousel,
  RenaissanceCarouselBackgroundTone,
} from "@1sp/sanity-types";
import InteractiveCarousel from "./Fragments/pg-InteractiveCarousel";

type PresentationProps = {
  backgroundTone?: RenaissanceCarouselBackgroundTone;
};

type Props = ({ data: Carousel } | Carousel) & PresentationProps;

function InteractiveCarouselWrapper(props: Props) {
  const carousel: Carousel = "items" in props ? props : (props as any).data;

  if (!carousel?.items || carousel.items.length === 0) return null;

  return (
    <InteractiveCarousel
      items={carousel.items as any}
      backgroundTone={props.backgroundTone}
    />
  );
}

export default InteractiveCarouselWrapper;
