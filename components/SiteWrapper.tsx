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
 * The `hasCaseStudies` and `hasServices` flags are now derived
 * from the array lengths (cases.length > 0).
 */
import { getGlobalData } from "@/lib/sanity/queries";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import Footer from "./menu/FooterNew";
import { NavbarMenu, FooterMenu } from "@/types/menu.types";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import { FooterMenuProvider } from "./menu/FooterMenuContext";

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
  // ==========================================================================
  // SINGLE CONSOLIDATED FETCH
  // ==========================================================================
  // This replaces 6 separate queries with 1 optimized query.
  // The `getGlobalData` function uses React's cache() for deduplication,
  // so if this component is rendered multiple times in the same request,
  // only 1 API call is made.
  const { nav, footer, cases, services } = await getGlobalData(
    channel,
    language
  );

  // Derive boolean flags from array lengths (replaces HAS_* queries)
  const hasCaseStudies = cases.length > 0;
  const hasServices = services.length > 0;

  return (
    <FooterMenuProvider menu={footer as FooterMenu}>
      <PageWithMapVertical>
        <FrontNavOverlay
          menuData={nav as NavbarMenu}
          color={navColor}
          locale={language}
          hasCaseStudies={hasCaseStudies}
          caseStudies={cases || []}
          hasServices={hasServices}
          services={services || []}
        />
        {children}
        <Footer menuData={footer as FooterMenu} />
      </PageWithMapVertical>
    </FooterMenuProvider>
  );
}
