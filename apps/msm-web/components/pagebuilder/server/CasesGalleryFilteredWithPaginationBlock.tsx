import { getAllCases } from "@1sp/sanity-queries";
import CasesGalleryFilteredWithPaginationClient from "../pg-CasesGalleryFilteredWithPagination";

interface CasesGalleryFilteredWithPaginationBlockProps {
  language?: string;
  channel?: string;
  showFilters?: boolean;
  paddingY?: string;
  marginBottom?: string;
  navPointName?: string;
  rowsPerPage?: number;
}

export default async function CasesGalleryFilteredWithPaginationBlock({
  language = "en",
  channel = "1spWeb",
  ...props
}: CasesGalleryFilteredWithPaginationBlockProps) {
  const caseStudies = await getAllCases(channel, language);

  return (
    <CasesGalleryFilteredWithPaginationClient
      {...props}
      locale={language}
      caseStudies={caseStudies}
    />
  );
}
