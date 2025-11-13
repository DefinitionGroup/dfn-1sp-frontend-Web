"use client";
import SmartCarouselData from "../data/data-InteractiveCarousel";
import { useParams } from "next/navigation";
interface SmartCarousel {
  maxItems: number;
}

type Props = { data: SmartCarousel } | SmartCarousel;

export default function SmartCarouselWrapper(props: Props) {
  const smartCarousel: SmartCarousel =
    "maxItems" in props ? props : (props as any).data;
  const params = useParams();
  const language = (params?.locale as string) || "de";

  if (!smartCarousel?.maxItems) return null;

  return (
    <SmartCarouselData maxItems={smartCarousel.maxItems} language={language} />
  );
}
