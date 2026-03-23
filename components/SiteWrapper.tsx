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
import { getGlobalData } from "@/lib/sanity/queries";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import Footer from "./menu/FooterNew";
import { NavbarMenu, FooterMenu } from "@/types/menu.types";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";

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
      <NavColorProvider color={navColor}>
        <PageWithMapVertical>
          <FrontNavOverlay
            menuData={nav as NavbarMenu}
            color={navColor}
            channel={channel}
            locale={language}
            hasCaseStudies={hasCaseStudies}
            hasServices={hasServices}
          />
          {children}
          <Footer menuData={footer as FooterMenu} />
        </PageWithMapVertical>
      </NavColorProvider>
    </FooterMenuProvider>
  );
}
