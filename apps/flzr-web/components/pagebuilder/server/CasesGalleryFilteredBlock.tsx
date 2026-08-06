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

  const fetchedCaseStudies = isManual
    ? await getCaseStudiesByIds(selectedIds, channel, language)
    : await getAllCases(channel, language);

  // GROQ does not preserve the order of an `_id in $ids` filter. Restore the
  // editor's drag-and-drop order for manual galleries after resolving refs.
  const rawCaseStudies = isManual
    ? selectedIds
        .map((id) =>
          fetchedCaseStudies.find((item: { _id: string }) => item._id === id),
        )
        .filter((item): item is (typeof fetchedCaseStudies)[number] => Boolean(item))
    : fetchedCaseStudies;

  return (
    <CasesGalleryFilteredClient
      {...props}
      locale={language}
      caseStudies={rawCaseStudies}
    />
  );
}
