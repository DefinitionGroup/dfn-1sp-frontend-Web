import { getAllCases, getCaseStudiesByIds } from "@1sp/sanity-queries";
import CasesGalleryFilteredWithPaginationClient from "../pg-CasesGalleryFilteredWithPagination";

interface SelectedCaseReference {
  _ref?: string;
  _id?: string;
  _type?: string;
  _key?: string;
}

interface CasesGalleryFilteredWithPaginationBlockProps {
  language?: string;
  channel?: string;
  showFilters?: boolean;
  paddingY?: string;
  marginBottom?: string;
  navPointName?: string;
  rowsPerPage?: number;
  selectionMode?: "auto" | "manual";
  selectedCases?: SelectedCaseReference[];
}

export default async function CasesGalleryFilteredWithPaginationBlock({
  language = "en",
  channel = "flizrWeb",
  selectionMode = "auto",
  selectedCases = [],
  ...props
}: CasesGalleryFilteredWithPaginationBlockProps) {
  // Manual selection (references may arrive as raw refs or already
  // dereferenced objects depending on the query path).
  const selectedIds = (selectedCases ?? [])
    .map((item) => item._ref ?? item._id)
    .filter((id): id is string => Boolean(id));

  // Branch on the editor's chosen mode alone. An empty manual selection yields
  // an empty grid rather than silently falling back to the full auto list.
  const isManual = selectionMode === "manual";

  const rawCaseStudies = isManual
    ? await getCaseStudiesByIds(selectedIds, channel, language)
    : await getAllCases(channel, language);

  const caseStudies = isManual
    ? selectedIds
        .map((id) =>
          rawCaseStudies.find((caseStudy: { _id: string }) => caseStudy._id === id),
        )
        .filter(Boolean)
    : rawCaseStudies;

  return (
    <CasesGalleryFilteredWithPaginationClient
      {...props}
      locale={language}
      caseStudies={caseStudies}
    />
  );
}
