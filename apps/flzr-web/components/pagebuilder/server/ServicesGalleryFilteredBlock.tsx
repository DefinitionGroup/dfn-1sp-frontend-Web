import { getAllServices } from "@1sp/sanity-queries";
import ServicesGalleryFilteredClient from "../pg-ServicesGalleryFiltered";

interface ServicesGalleryFilteredBlockProps {
  language?: string;
  showFilters?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
}

export default async function ServicesGalleryFilteredBlock({
  language = "en",
  ...props
}: ServicesGalleryFilteredBlockProps) {
  const services = await getAllServices(language);

  return (
    <ServicesGalleryFilteredClient
      {...props}
      locale={language}
      services={services}
    />
  );
}
