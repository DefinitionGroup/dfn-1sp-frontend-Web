"use client";
import SmartCarouselData from "../data/data-InteractiveCarousel";

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
  language?: string;
  caseStudies?: DereferencedCase[];
  navPointName?: string;
  hideFromNav?: boolean;
}

type Props = { data: SmartCarouselProps } | SmartCarouselProps;

function SmartCarouselWrapper(props: Props) {
  const smartCarousel: SmartCarouselProps =
    "caseStudies" in props || "language" in props ? props : (props as any).data;

  const {
    language = "en",
    caseStudies = [],
    navPointName,
    hideFromNav = false,
  } = smartCarousel || {};

  if (!caseStudies.length) return null;

  // Navigation data attributes
  const navPointDataAttr = {
    ...(navPointName ? { "data-navpoint-name": navPointName } : {}),
    ...(hideFromNav ? { "data-nav-hidden": "true" } : {}),
  };

  return (
    <div {...navPointDataAttr}>
      <SmartCarouselData language={language} caseStudies={caseStudies} />
    </div>
  );
}

export default SmartCarouselWrapper;
