import {
  getInteractiveCarouselCases,
} from "@/lib/sanity/queries";
import SmartCarouselClient from "../pg-SmartCarousel";
import type { CloudinaryAsset } from "@1sp/sanity-types";

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

interface SmartCarouselBlockProps {
  language?: string;
  channel?: "1spWeb" | "msmWeb" | "studioco2Web";
  maxItems?: number;
  selectionMode?: "auto" | "manual";
  selectedCases?: DereferencedCase[];
  navPointName?: string;
  hideFromNav?: boolean;
}

export default async function SmartCarouselBlock({
  language = "en",
  channel = "1spWeb",
  maxItems = 5,
  selectionMode = "auto",
  selectedCases = [],
  ...props
}: SmartCarouselBlockProps) {
  const caseStudies =
    selectionMode === "manual"
      ? selectedCases
      : await getInteractiveCarouselCases(channel, language, maxItems);

  return (
    <SmartCarouselClient
      {...props}
      language={language}
      caseStudies={caseStudies}
    />
  );
}
