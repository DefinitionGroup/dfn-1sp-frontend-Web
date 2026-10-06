import {JsonLdScript, CANONICAL_URL} from '@msm/lib/structured-data';
import {buildMsmMetadata, buildMsmRouteMetadata} from '@msm/lib/metadata';
import {msmPath} from "@msm/lib/editorial";
/**
 * Home Page
 * =========
 *
 * The main landing page for each locale (e.g., /en, /de).
 *
 * ## Performance Optimization (January 2026)
 *
 * Previously: `generateMetadata()` and the page component each called
 * `sanityFetch()` separately, resulting in 2 API calls for the same data.
 *
 * Now: Both use `getHomePage()` from the centralized data layer, which
 * wraps the fetch in React's `cache()`. This means only 1 API call is made,
 * even though `getHomePage()` is called twice.
 *
 * ## SEO (February 2026)
 *
 * - Canonical URLs with locale alternates for multi-language support
 * - OpenGraph + Twitter card metadata for social sharing
 * - Proper title template integration with root layout
 */
import { getAllCases, getAllServicesForChannel, getHomePage, getGlobalData } from "@1sp/sanity-queries";
import MsmPageBuilder from "@msm/components/MsmPageBuilder";
import NotFound from "@msm/components/ui/not-found";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import { getChannelFromEnv, getSiteConfig } from "@1sp/site-config";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  generateHomepageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  extractCaseItemsFromContent,
  hasAutoCaseListingBlocks,
  hasServicesGalleryBlock,
  mapCasesToItemList,
  mapServicesToCatalogItems,
  generateServiceCatalogJsonLd,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
} from "@/lib/structured-data";

export const revalidate = 60;
const DEFAULT_CHANNEL = "msmWeb";
const SUPPORTED_LOCALES = getSiteConfig(getChannelFromEnv()).locales;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch - shared with page component
  const page = await getHomePage(DEFAULT_CHANNEL, language);

  if (!page) {
    return buildMsmMetadata({title: 'Page not found', metadata: {noIndex: true}});
  }

  return buildMsmRouteMetadata({locale: language, path: '', documentId: page._id, title: page.title || 'Home', metadata: page.metadata});
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch - deduped with generateMetadata call
  const page = await getHomePage(DEFAULT_CHANNEL, language);

  const navbarVariant = page?.navbarVariant || "light";

  const resolvedMetadata = buildMsmMetadata({locale: language, title: page?.title, metadata: page?.metadata});

  // Structured data: get social links & logo (cached — deduped with SiteWrapper)
  const globalData = await getGlobalData(DEFAULT_CHANNEL, language);
  const contentBlocks = page?.content as any[] | undefined;
  const needsAllCases = hasAutoCaseListingBlocks(contentBlocks);
  const hasServicesGallery = hasServicesGalleryBlock(contentBlocks);

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(DEFAULT_CHANNEL, language) : Promise.resolve([]),
    hasServicesGallery ? getAllServicesForChannel(DEFAULT_CHANNEL, language) : Promise.resolve([]),
  ]);

  // LCP optimization: preload hero poster image so the browser discovers it
  // during HTML parsing, well before JavaScript mounts the client component.
  const heroPreload = getHeroPreloadData(contentBlocks);
  const caseItems = extractCaseItemsFromContent(contentBlocks, mapCasesToItemList(allCasesRaw));
  const services = mapServicesToCatalogItems(allServicesRaw);

  return (
    <MsmSiteWrapper language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript locale={language} metadata={resolvedMetadata}
        data={generateHomepageJsonLd({
          locale: language,
          logoUrl: globalData.nav?.logoUrl,
          socialLinks: globalData.footer?.socialLinks,
        })}
      />
      <JsonLdScript locale={language} metadata={resolvedMetadata}
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
        ])}
      />
      {/* ItemList for case carousels / galleries on the homepage */}
      {caseItems.length > 0 && (
        <JsonLdScript locale={language} metadata={resolvedMetadata}
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: "Featured Case Studies",
          })}
        />
      )}
      {services.length > 0 && (
        <JsonLdScript locale={language} metadata={resolvedMetadata}
          data={generateServiceCatalogJsonLd({
            services,
            locale: language,
            id: `${CANONICAL_URL}#homepage-service-catalog`,
            name: "Services",
            url: CANONICAL_URL,
          })}
        />
      )}

      {/* Person & Unit structured data from page builder content */}
      {(() => {
        const people = extractPeopleFromContent(contentBlocks);
        return people.length > 0 ? <JsonLdScript locale={language} metadata={resolvedMetadata} data={generatePeopleListJsonLd({ people })} /> : null;
      })()}
      {(() => {
        const units = extractUnitsFromContent(contentBlocks);
        return units.length > 0 ? <JsonLdScript locale={language} metadata={resolvedMetadata} data={generateUnitsListJsonLd({ units })} /> : null;
      })()}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />
      <div className="min-h-screen">
        {contentBlocks?.length ? (
          <MsmPageBuilder
            content={contentBlocks}
            language={language}
            channel={DEFAULT_CHANNEL}
            deferAfter={2}
          />
        ) : (
          <NotFound />
        )}
      </div>
    </MsmSiteWrapper>
  );
}
