/**
 * SiteWrapper Component
 * =====================
 *
 * This component wraps all pages and provides:
 * - Navigation (FrontNavOverlay)
 * - Footer
 * - Page layout (PageWithMapVertical)
 * - Footer context for child components
 *
 * ## Performance Optimization (January 2026)
 *
 * Previously: Made 6 separate Sanity API calls:
 * - NAVBAR_QUERY
 * - FOOTER_QUERY
 * - HAS_CASE_STUDIES_QUERY
 * - CASE_STUDIES_QUERY
 * - HAS_SERVICES_QUERY
 * - SERVICES_QUERY
 *
 * Now: Makes 1 consolidated API call via `getGlobalData()`.
 * This reduces network round trips by ~83%.
 *
 * The shell now fetches lightweight availability flags instead of
 * full case/service collections. Rich overlay data is loaded only
 * when a user opens that UI.
 */
import { getGlobalData } from "@1sp/sanity-queries";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import Footer from "./menu/FooterNew";
import { NavbarMenu, FooterMenu } from "@1sp/sanity-types/menu";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import ScrollToTop from "./ui/ScrollToTop";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavbarMenuProvider } from "./menu/NavbarMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";
import {
  JsonLdScript,
  generateLocalBusinessJsonLd,
} from "@/lib/structured-data";

type OverlayCaseStudy = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string; taglabel?: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
};

interface SiteWrapperProps {
  children: React.ReactNode;
  channel?: string;
  language?: string;
  navColor?: "light" | "dark";
  overlayCaseStudies?: OverlayCaseStudy[];
}

export default async function SiteWrapper({
  children,
  channel = "1spWeb",
  language = "en",
  navColor = "light",
  overlayCaseStudies,
}: SiteWrapperProps) {
  // ==========================================================================
  // SINGLE CONSOLIDATED FETCH
  // ==========================================================================
  // This keeps the shell to a single lightweight query.
  // The `getGlobalData` function uses React's cache() for deduplication,
  // so if this component is rendered multiple times in the same request,
  // only 1 API call is made.
  const { nav, footer, hasCaseStudies, hasServices } = await getGlobalData(
    channel,
    language
  );

  return (
    <FooterMenuProvider menu={footer as FooterMenu}>
      <NavbarMenuProvider
        menu={nav as NavbarMenu}
        hasCaseStudies={hasCaseStudies}
        hasServices={hasServices}
      >
        <NavColorProvider color={navColor}>
          <PageWithMapVertical>
            <JsonLdScript
              data={generateLocalBusinessJsonLd({
                locations: footer?.locations,
                socialLinks: footer?.socialLinks,
              })}
            />
            <FrontNavOverlay
              menuData={nav as NavbarMenu}
              color={navColor}
              channel={channel}
              locale={language}
              hasCaseStudies={hasCaseStudies}
              hasServices={hasServices}
              initialCaseStudies={overlayCaseStudies}
            />
            {children}
            <Footer menuData={footer as FooterMenu} />
            <ScrollToTop />
          </PageWithMapVertical>
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
