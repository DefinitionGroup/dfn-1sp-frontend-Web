import { getInteractiveCarouselServices } from "@1sp/sanity-queries";
import SmartCarouselClient from "../pg-SmartCarousel";
import type { CloudinaryAsset } from "@1sp/sanity-types";

interface DereferencedService {
  _id: string;
  name?: string;
  taglabel?: string;
  introText?: string;
  serviceDescription?: string;
  backgroundAsset?: CloudinaryAsset & { resource_type?: string };
}

interface ServicesCarouselBlockProps {
  language?: string;
  channel?: string;
  maxItems?: number;
  selectionMode?: "auto" | "manual";
  selectedServices?: DereferencedService[];
  navPointName?: string;
  hideFromNav?: boolean;
}

export default async function ServicesCarouselBlock({
  language = "en",
  channel = "msmWeb",
  maxItems = 5,
  selectionMode = "auto",
  selectedServices = [],
  ...props
}: ServicesCarouselBlockProps) {
  const services =
    selectionMode === "manual"
      ? (selectedServices ?? [])
      : await getInteractiveCarouselServices(channel, language, maxItems);

  // Map services onto the carousel's case-study slide shape so both
  // carousels share one client implementation (and one design pass).
  // serviceBackground can be an image or a video — route by resource_type,
  // matching how caseStudy mainImage/mainVideo feed the same carousel.
  const slides = (services ?? []).map((service: DereferencedService) => {
    const bg = service.backgroundAsset;
    const isVideo = bg?.resource_type === "video";
    return {
      _id: service._id,
      title: service.name,
      subtitle: service.taglabel,
      description: service.introText || service.serviceDescription,
      services: service.taglabel
        ? [{ _id: service._id, name: service.taglabel }]
        : undefined,
      mainImage: isVideo ? undefined : bg,
      mainVideo: isVideo ? bg : undefined,
    };
  });

  return (
    <SmartCarouselClient
      {...props}
      language={language}
      caseStudies={slides}
    />
  );
}
