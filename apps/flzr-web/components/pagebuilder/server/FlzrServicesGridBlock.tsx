import { getAllServicesForChannel } from "@1sp/sanity-queries";
import ServicesGalleryFilteredClient from "../pg-ServicesGalleryFiltered";

interface FlzrServicesGridBlockProps {
  language?: string;
  channel?: string;
  showFilters?: boolean;
  backgroundColor?: string;
  paddingY?: string;
  navPointName?: string;
}

export default async function FlzrServicesGridBlock({
  language = "en",
  channel = "flizrWeb",
  ...props
}: FlzrServicesGridBlockProps) {
  const services = await getAllServicesForChannel(channel, language);

  return (
    <ServicesGalleryFilteredClient
      {...props}
      locale={language}
      services={services}
      presentation="grid"
    />
  );
}
