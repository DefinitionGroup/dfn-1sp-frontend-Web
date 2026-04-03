import { getUnitLogoGridUnits } from "@/lib/sanity/queries";
import { getUnitsByIds } from "@/lib/sanity/queries";
import UnitLogoGridClient from "../pg-UnitLogoGrid";
import type { CloudinaryAsset, CTA } from "@/types/sanity.types";
import { assetUrl, resolveLink } from "@/utils/utils";

type Unit = {
  _id: string;
  _type: string;
  name?: string;
  slug?: { current: string };
  logo?: CloudinaryAsset;
  logoColor?: CloudinaryAsset;
  logoSignet?: CloudinaryAsset;
  cta?: CTA;
};

interface UnitLogoGridBlockProps {
  language?: string;
  headline?: string;
  subheadline?: string;
  logoVariant?: "logo" | "logoColor" | "logoSignet";
  columns?: 3 | 4 | 5 | 6;
  maxItems?: number;
  navPointName?: string;
  hideFromNav?: boolean;
  selectionMode?: "auto" | "manual";
  selectedUnitIds?: string[];
}

function pickLogoAsset(
  unit: Unit,
  logoVariant: NonNullable<UnitLogoGridBlockProps["logoVariant"]>,
) {
  switch (logoVariant) {
    case "logo":
      return unit.logo;
    case "logoSignet":
      return unit.logoSignet || unit.logoColor || unit.logo;
    case "logoColor":
    default:
      return unit.logoColor || unit.logo || unit.logoSignet;
  }
}

export default async function UnitLogoGridBlock({
  language = "en",
  maxItems = 20,
  logoVariant = "logoColor",
  selectionMode = "auto",
  selectedUnitIds = [],
  ...props
}: UnitLogoGridBlockProps) {
  const units =
    selectionMode === "manual" && selectedUnitIds.length > 0
      ? await getUnitsByIds(selectedUnitIds)
      : await getUnitLogoGridUnits(language, maxItems);

  const unitCards = units
    .map((unit: Unit) => {
      const logoUrl = assetUrl(pickLogoAsset(unit, logoVariant));
      if (!logoUrl) return null;

      let href = resolveLink(unit.cta?.link) || "#";
      if (href.startsWith("/") && !href.startsWith(`/${language}`)) {
        href = `/${language}${href}`;
      }

      return {
        id: unit._id,
        name: unit.name,
        logoUrl,
        href,
        external: unit.cta?.link?.linkType === "external",
      };
    })
    .filter(Boolean);

  return (
    <UnitLogoGridClient
      data={{ ...props, maxItems, logoVariant }}
      units={unitCards}
      language={language}
    />
  );
}
