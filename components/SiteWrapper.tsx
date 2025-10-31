import { sanityFetch } from "@/sanity/lib/live";
import {
  NAVBAR_QUERY,
  FOOTER_QUERY,
  HAS_CASE_STUDIES_QUERY,
  CASE_STUDIES_QUERY,
  HAS_SERVICES_QUERY,
  SERVICES_QUERY,
} from "@/sanity/lib/queries";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import Footer from "./menu/FooterNew";
import { NavbarMenu, FooterMenu } from "@/types/menu.types";
import PageWithMapVertical from "./ui/PageWithMapVertical";

interface SiteWrapperProps {
  children: React.ReactNode;
  channel?: string;
  language?: string;
  navColor?: "light" | "dark";
}

export default async function SiteWrapper({
  children,
  channel = "1spWeb",
  language = "en",
  navColor = "light",
}: SiteWrapperProps) {
  // Fetch navbar data
  const { data: navbarData } = await sanityFetch({
    query: NAVBAR_QUERY,
    params: { channel, language },
  });

  // Fetch footer data
  const { data: footerData } = await sanityFetch({
    query: FOOTER_QUERY,
    params: { channel, language },
  });

  // Check if case studies exist for this channel and language
  const { data: hasCaseStudies } = await sanityFetch({
    query: HAS_CASE_STUDIES_QUERY,
    params: { channel, language },
  });

  // Fetch case studies for the navigation overlay
  const { data: caseStudies } = await sanityFetch({
    query: CASE_STUDIES_QUERY,
    params: { channel, language },
  });

  // Check if services exist for this language
  const { data: hasServices } = await sanityFetch({
    query: HAS_SERVICES_QUERY,
    params: { language },
  });

  // Fetch services for the navigation overlay
  const { data: services } = await sanityFetch({
    query: SERVICES_QUERY,
    params: { language },
  });

  return (
    <>
      <PageWithMapVertical>
        <FrontNavOverlay
          menuData={navbarData as NavbarMenu}
          color={navColor}
          locale={language}
          hasCaseStudies={hasCaseStudies || false}
          caseStudies={caseStudies || []}
          hasServices={hasServices || false}
          services={services || []}
        />
        {children}
        <Footer menuData={footerData as FooterMenu} />
      </PageWithMapVertical>
    </>
  );
}
