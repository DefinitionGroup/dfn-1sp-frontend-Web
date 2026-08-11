import {
  getCaseStudiesByIds,
  getInteractiveCarouselCases,
} from "@1sp/sanity-queries";
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
  channel?: string;
  maxItems?: number;
  selectionMode?: "auto" | "manual";
  selectedCases?: DereferencedCase[];
  navPointName?: string;
  hideFromNav?: boolean;
}

export default async function SmartCarouselBlock({
  language = "en",
  channel = "renaissanceWeb",
  maxItems = 5,
  selectionMode = "auto",
  selectedCases = [],
  ...props
}: SmartCarouselBlockProps) {
  const selectedIds = selectedCases
    .map((caseStudy) => caseStudy._id)
    .filter(Boolean);

  const caseStudies =
    selectionMode === "manual"
      ? await getCaseStudiesByIds(selectedIds, channel, language)
      : await getInteractiveCarouselCases(channel, language, maxItems);

  return (
    <SmartCarouselClient
      {...props}
      language={language}
      caseStudies={caseStudies}
    />
  );
}
