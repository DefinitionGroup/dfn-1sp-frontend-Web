import { getUnitLogoFloatUnits } from "@/lib/sanity/queries";
import { getUnitsByIds } from "@/lib/sanity/queries";
import PageBuilderLogoFloatClient from "../pg-PageBuilderLogoFloat";
import type { CloudinaryAsset } from "@/types/sanity.types";
import { assetUrl } from "@/utils/utils";

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
  selectedUnitIds?: string[];
}

function pickLogoAsset(
  unit: Unit,
  logoVariant: NonNullable<PageBuilderLogoFloatBlockProps["logoVariant"]>
) {
  switch (logoVariant) {
    case "logo":
      return unit.logo || unit.logoColor || unit.logoSignet;
    case "logoSignet":
      return unit.logoSignet || unit.logoColor || unit.logo;
    case "logoColor":
    default:
      return unit.logoColor || unit.logo || unit.logoSignet;
  }
}

export default async function PageBuilderLogoFloatBlock({
  language = "en",
  maxItems = 24,
  logoVariant = "logoColor",
  selectionMode = "auto",
  selectedUnitIds = [],
  ...props
}: PageBuilderLogoFloatBlockProps) {
  const units: Unit[] =
    selectionMode === "manual" && selectedUnitIds.length > 0
      ? await getUnitsByIds(selectedUnitIds)
      : await getUnitLogoFloatUnits(language, maxItems);

  const logos = units
    .map((unit) => {
      const asset = pickLogoAsset(unit, logoVariant);
      const url = assetUrl(asset);

      if (!url) return null;

      return {
        id: unit._id,
        name: unit.name,
        url,
        width: asset?.width || 0,
        height: asset?.height || 0,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    name?: string;
    url: string;
    width: number;
    height: number;
  }>;

  return (
    <PageBuilderLogoFloatClient
      data={{ ...props, maxItems, logoVariant }}
      logos={logos}
    />
  );
}
