"use client";
import SmartCarouselData from "../data/data-InteractiveCarousel";
import { useParams } from "next/navigation";

import type { CloudinaryAsset } from "@/types/sanity.types";

// Dereferenced case study from GROQ query
interface DereferencedCase {
  _id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  services?: { _id: string; name: string }[];
  mainImage?: CloudinaryAsset;
  mainVideo?: CloudinaryAsset;
  client?: {
    _id: string;
    name: string;
    logo?: CloudinaryAsset;
  };
  slug?: { current: string };
}

interface SmartCarouselProps {
  maxItems?: number;
  selectionMode?: "auto" | "manual";
  selectedCases?: DereferencedCase[];
  navPointName?: string;
  hideFromNav?: boolean;
}

type Props = { data: SmartCarouselProps } | SmartCarouselProps;

function SmartCarouselWrapper(props: Props) {
  const smartCarousel: SmartCarouselProps =
    "selectionMode" in props || "maxItems" in props ? props : (props as any).data;
  const params = useParams();
  const language = (params?.locale as string) || "de";

  const {
    selectionMode = "auto",
    maxItems = 5,
    selectedCases,
    navPointName,
    hideFromNav = false,
  } = smartCarousel || {};

  // For auto mode, require maxItems; for manual mode, require selectedCases
  if (selectionMode === "auto" && !maxItems) return null;
  if (selectionMode === "manual" && (!selectedCases || selectedCases.length === 0)) return null;

  // Navigation data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  return (
    <div {...navPointDataAttr}>
      <SmartCarouselData
        maxItems={maxItems}
        language={language}
        selectionMode={selectionMode}
        selectedCases={selectionMode === "manual" ? selectedCases : undefined}
      />
    </div>
  );
}

export default SmartCarouselWrapper;
