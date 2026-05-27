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

  const rawCaseStudies =
    selectionMode === "manual" && selectedIds.length > 0
      ? await getCaseStudiesByIds(selectedIds, channel, language)
      : await getAllCases(channel, language);

  const orderedCaseStudies =
    selectionMode === "manual" && selectedIds.length > 0
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
