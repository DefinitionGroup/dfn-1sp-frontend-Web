"use client";
import SmartCarouselData from "../data/data-InteractiveCarousel";
import { useParams } from "next/navigation";
import { withDebugBadge } from "@/components/dev/withDebugBadge";
interface SmartCarousel {
  maxItems: number;
}

type Props = { data: SmartCarousel } | SmartCarousel;

function SmartCarouselWrapper(props: Props) {
  const smartCarousel: SmartCarousel =
    "maxItems" in props ? props : (props as any).data;
  const params = useParams();
  const language = (params?.locale as string) || "de";

  if (!smartCarousel?.maxItems) return null;

  return (
    <SmartCarouselData maxItems={smartCarousel.maxItems} language={language} />
  );
}

export default withDebugBadge(SmartCarouselWrapper, "pg-SmartCarousel");
