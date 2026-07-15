import { getAllCases, getCaseStudiesByIds } from "@1sp/sanity-queries";
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
  channel = "flizrWeb",
  selectionMode = "auto",
  selectedCases = [],
  ...props
}: CasesGalleryFilteredBlockProps) {
  const selectedIds = (selectedCases ?? [])
    .map((item) => item._ref ?? item._id)
    .filter((id): id is string => Boolean(id));

  // Branch on the editor's chosen mode alone so a manual selection that
  // resolves to zero items (e.g. none assigned to this channel) renders empty
  // instead of falling back to the full auto list. (BUG-4)
  const isManual = selectionMode === "manual";

  const rawCaseStudies = isManual
    ? await getCaseStudiesByIds(selectedIds, channel, language)
    : await getAllCases(channel, language);

  return (
    <CasesGalleryFilteredClient
      {...props}
      locale={language}
      caseStudies={rawCaseStudies}
    />
  );
}
