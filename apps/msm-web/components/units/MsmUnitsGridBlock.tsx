import { getMsmUnits, getMsmUnitsByIds } from "@1sp/sanity-queries";
import MsmUnitsGrid from "./MsmUnitsGrid";
import type { MsmUnitSummary } from "./types";

type UnitReference = { _ref?: string; _id?: string };

type MsmUnitsGridBlockProps = {
  items?: {reference?: {_ref?: string}; text?: string; linkLabel?: string}[];
  eyebrow?: string;
  headline?: string;
  intro?: string;
  selectionMode?: "auto" | "manual";
  selectedUnits?: UnitReference[];
  language?: string;
  channel?: string;
  embedded?: boolean;
};

export default async function MsmUnitsGridBlock({
  items = [],
  eyebrow = "OUR UNITS",
  headline = "Four units. One goal.",
  intro = "",
  selectionMode = "auto",
  selectedUnits = [],
  language = "en",
  channel = "msmWeb",
  embedded = false,
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
      units={(units as MsmUnitSummary[]).map(unit => {const teaser = items.find(t => t.reference?._ref === unit._id); return {...unit, claim: teaser?.text ?? unit.claim, linkLabel: teaser?.linkLabel};})}
      embedded={embedded}
    />
  );
}
