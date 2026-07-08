import { getAllServicesForChannel } from "@1sp/sanity-queries";
import ServicesGalleryFilteredClient from "../pg-ServicesGalleryFiltered";

interface ServicesGalleryFilteredBlockProps {
  language?: string;
  channel?: string;
  showFilters?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
}

export default async function ServicesGalleryFilteredBlock({
  language = "en",
  channel = "msmWeb",
  ...props
}: ServicesGalleryFilteredBlockProps) {
  // Channel-scoped: only services assigned to the active channel. (BUG-2)
  const services = await getAllServicesForChannel(channel, language);

  return (
    <ServicesGalleryFilteredClient
      {...props}
      locale={language}
      services={services}
    />
  );
}
