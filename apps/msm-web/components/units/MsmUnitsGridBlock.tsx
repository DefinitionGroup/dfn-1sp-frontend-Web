import { getMsmUnits, getMsmUnitsByIds } from "@1sp/sanity-queries";
import MsmUnitsGrid from "./MsmUnitsGrid";
import type { MsmUnitSummary } from "./types";

type UnitReference = { _ref?: string; _id?: string };

type MsmUnitsGridBlockProps = {
  eyebrow?: string;
  headline?: string;
  intro?: string;
  selectionMode?: "auto" | "manual";
  selectedUnits?: UnitReference[];
  language?: string;
  channel?: string;
};

export default async function MsmUnitsGridBlock({
  eyebrow = "OUR UNITS",
  headline = "Four units. One goal.",
  intro = "",
  selectionMode = "auto",
  selectedUnits = [],
  language = "en",
  channel = "msmWeb",
}: MsmUnitsGridBlockProps) {
  if (channel !== "msmWeb") return null;

  const selectedIds = selectedUnits
    .map((unit) => unit._ref || unit._id)
    .filter((id): id is string => Boolean(id));

  const units = selectionMode === "manual"
    ? await getMsmUnitsByIds(selectedIds, language)
    : await getMsmUnits(language);

  return (
    <MsmUnitsGrid
      eyebrow={eyebrow}
      headline={headline}
      intro={intro}
      language={language}
      units={units as MsmUnitSummary[]}
    />
  );
}
