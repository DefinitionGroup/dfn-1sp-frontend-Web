import { getUnitLogoGridUnits } from "@/lib/sanity/queries";
import UnitLogoGridClient from "../pg-UnitLogoGrid";
import type { CloudinaryAsset, CTA } from "@1sp/sanity-types";

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
  selectedUnits?: Unit[];
}

export default async function UnitLogoGridBlock({
  language = "en",
  maxItems = 20,
  selectionMode = "auto",
  selectedUnits = [],
  ...props
}: UnitLogoGridBlockProps) {
  const units =
    selectionMode === "manual" && selectedUnits.length > 0
      ? selectedUnits
      : await getUnitLogoGridUnits(language, maxItems);

  return (
    <UnitLogoGridClient
      data={{ ...props, maxItems }}
      units={units}
      language={language}
    />
  );
}
