import {
  getAllCases,
  getCaseStudiesByIds,
} from "@1sp/sanity-queries";
import CasesGalleryFilteredClient from "../pg-CasesGalleryFiltered";

interface SelectedCaseReference {
  _ref?: string;
  _id?: string;
  _type?: string;
  _key?: string;
}

interface CasesGalleryFilteredBlockProps {
  language?: string;
  channel?: string;
  showGridBackground?: boolean;
  showFilters?: boolean;
  paddingY?: string;
  marginBottom?: string;
  navPointName?: string;
  selectionMode?: "auto" | "manual";
  selectedCases?: SelectedCaseReference[];
}

export default async function CasesGalleryFilteredBlock({
  language = "en",
  channel = "1spWeb",
  selectionMode = "auto",
  selectedCases = [],
  ...props
}: CasesGalleryFilteredBlockProps) {
  const selectedIds = (selectedCases ?? [])
    .map((item) => item._ref ?? item._id)
    .filter((id): id is string => Boolean(id));

  // Branch on the editor's chosen mode alone. Previously the manual path was
  // gated on `selectedIds.length > 0`, so a manual selection that resolved to
  // zero items (e.g. none assigned to this channel) fell through to the full
  // auto list. Manual now always yields exactly the curated set (or empty).
  const isManual = selectionMode === "manual";

  const rawCaseStudies = isManual
    ? await getCaseStudiesByIds(selectedIds, channel, language)
    : await getAllCases(channel, language);

  const orderedCaseStudies = isManual
    ? selectedIds
        .map((id) =>
          rawCaseStudies.find((caseStudy: { _id: string }) => caseStudy._id === id)
        )
        .filter(Boolean)
    : rawCaseStudies;

  return (
    <CasesGalleryFilteredClient
      {...props}
      locale={language}
      caseStudies={orderedCaseStudies}
    />
  );
}
