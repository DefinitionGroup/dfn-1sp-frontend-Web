import { getUnitLogoFloatUnits } from "@/lib/sanity/queries";
import PageBuilderLogoFloatClient from "../pg-PageBuilderLogoFloat";
import type { CloudinaryAsset } from "@1sp/sanity-types";

type Unit = {
  _id: string;
  _type?: string;
  name?: string;
  slug?: { current?: string };
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
  logoSignet?: CloudinaryAsset;
};

interface PageBuilderLogoFloatBlockProps {
  language?: string;
  logoVariant?: "logo" | "logoColor" | "logoSignet";
  cardSize?: "sm" | "md" | "lg";
  maxItems?: number;
  navPointName?: string;
  hideFromNav?: boolean;
  selectionMode?: "auto" | "manual";
  selectedUnits?: Unit[];
}

export default async function PageBuilderLogoFloatBlock({
  language = "en",
  maxItems = 24,
  selectionMode = "auto",
  selectedUnits = [],
  ...props
}: PageBuilderLogoFloatBlockProps) {
  const units =
    selectionMode === "manual" && selectedUnits.length > 0
      ? selectedUnits
      : await getUnitLogoFloatUnits(language, maxItems);

  return (
    <PageBuilderLogoFloatClient
      data={{ ...props, maxItems }}
      units={units}
    />
  );
}
