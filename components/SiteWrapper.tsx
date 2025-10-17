import { sanityFetch } from "@/sanity/lib/live";
import {
  NAVBAR_QUERY,
  FOOTER_QUERY,
  HAS_CASE_STUDIES_QUERY,
} from "@/sanity/lib/queries";
import FrontNavOverlay from "./FrontNavOverlay";
import Footer from "./FooterNew";
import { NavbarMenu, FooterMenu } from "@/types/menu.types";
import PageWithMapVertical from "./PageWithMapVertical";

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

  return (
    <>
      <PageWithMapVertical>
        <FrontNavOverlay
          menuData={navbarData as NavbarMenu}
          color={navColor}
          locale={language}
          hasCaseStudies={hasCaseStudies || false}
        />
        {children}
        <Footer menuData={footerData as FooterMenu} />
      </PageWithMapVertical>
    </>
  );
}
