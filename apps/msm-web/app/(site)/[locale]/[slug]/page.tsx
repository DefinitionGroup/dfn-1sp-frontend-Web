import {JsonLdScript, CANONICAL_URL} from '@msm/lib/structured-data';
import {buildMsmMetadata, buildMsmRouteMetadata} from '@msm/lib/metadata';
/**
 * Dynamic Page
 * ============
 *
 * Handles all dynamic pages like /en/about, /en/contact, etc.
 *
 * ## Performance Optimization (January 2026)
 *
 * Previously: `generateMetadata()` and the page component each called
 * `sanityFetch()` separately, resulting in 2 API calls for the same data.
 *
 * Now: Both use `getPageBySlug()` from the centralized data layer, which
 * wraps the fetch in React's `cache()`. Only 1 API call is made.
 *
 * ## Static Generation
 *
 * `generateStaticParams()` pre-renders known pages at build time.
 * `dynamicParams = true` allows new pages to be rendered on-demand.
 *
 * ## SEO (February 2026)
 *
 * - Canonical URLs prevent duplicate content across locales
 * - Full OpenGraph + Twitter card metadata for social sharing
 */
import {notFound, permanentRedirect} from "next/navigation";
import MsmPageBuilder from "@msm/components/MsmPageBuilder";
// import CookieDeclaration from "@/components/CookieDeclaration";
import { getAllCases, getAllPageSlugs, getAllServicesForChannel, getPageBySlug } from "@1sp/sanity-queries";
import NotFound from "@msm/components/ui/not-found";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  generateWebPageJsonLd,
  generateContactPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generateServiceCatalogJsonLd,
  extractCaseItemsFromContent,
  hasAutoCaseListingBlocks,
  hasServicesGalleryBlock,
  mapCasesToItemList,
  mapServicesToCatalogItems,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
} from "@/lib/structured-data";

// Allow new pages to be rendered on-demand (ISR)
export const dynamicParams = true;

/**
 * Generate static params for all pages at build time.
 */
export async function generateStaticParams() {
  const pages = await getAllPageSlugs();

  return pages
    .filter((page) => page.channel === "msmWeb" && !page.slug.includes("/"))
    .map((page) => ({
      locale: page.language || "en",
      slug: page.slug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const channel = "msmWeb";
  const language = locale || "en";

  // Uses cached fetch - shared with page component
  const page = await getPageBySlug(slug, channel, language);

  if (!page) {
    return buildMsmMetadata({title: 'Page not found', metadata: {noIndex: true}});
  }

  return buildMsmRouteMetadata({locale: language, path: slug, documentId: page._id, title: page.title, metadata: page.metadata});
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const channel = "msmWeb";
  const language = locale || "en";

  // Uses cached fetch - deduped with generateMetadata call
  const page = await getPageBySlug(slug, channel, language);

  if (!page) notFound();
  // The homepage document also has a slug (e.g. /homepage); keep a single indexable URL at the locale root.
  if (page.isHomepage) permanentRedirect(language === "en" ? "/" : `/${language}`);

  const navbarVariant = page?.navbarVariant || "light";
  const contentBlocks = page?.content as any[] | undefined;
  const needsAllCases = hasAutoCaseListingBlocks(contentBlocks);
  const hasServicesGallery = hasServicesGalleryBlock(contentBlocks);

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(channel, language) : Promise.resolve([]),
    hasServicesGallery ? getAllServicesForChannel(channel, language) : Promise.resolve([]),
  ]);

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(contentBlocks);
  const caseItems = extractCaseItemsFromContent(contentBlocks, mapCasesToItemList(allCasesRaw));
  const services = mapServicesToCatalogItems(allServicesRaw);
  const pageUrl = `${CANONICAL_URL}/${slug}`;
  const resolvedMetadata = buildMsmMetadata({locale: language, path: slug, title: page?.title, metadata: page?.metadata});
  const ogImageUrl = (resolvedMetadata.openGraph as {images: {url: string}[]}).images[0].url;

  return (
    <MsmSiteWrapper language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      {page && (
        <>
          <JsonLdScript locale={language} metadata={resolvedMetadata}
            data={slug === 'contact' ? generateContactPageJsonLd({
              locale: language,
              title: String(resolvedMetadata.title),
              description: resolvedMetadata.description || undefined,
            }) : generateWebPageJsonLd({
              title: String(resolvedMetadata.title),
              slug,
              description: resolvedMetadata.description || undefined,
              locale: language,
              imageUrl: ogImageUrl,
              canonicalUrl: CANONICAL_URL,
            })}
          />
          <JsonLdScript locale={language} metadata={resolvedMetadata}
            data={generateBreadcrumbJsonLd([
              {
                name: getBreadcrumbLabel(language, "home"),
                url: CANONICAL_URL,
              },
              {
                name: page.title || slug,
                url: pageUrl,
              },
            ])}
          />
          {/* ItemList for case carousels / galleries on this page */}
          {caseItems.length > 0 && (
            <JsonLdScript locale={language} metadata={resolvedMetadata}
              data={generateItemListJsonLd({
                items: caseItems,
                locale: language,
                id: `${pageUrl}#case-list`,
              })}
            />
          )}
          {services.length > 0 && (
            <JsonLdScript locale={language} metadata={resolvedMetadata}
              data={generateServiceCatalogJsonLd({
                services,
                locale: language,
                id: `${pageUrl}#service-catalog`,
                name: page.title || slug,
                url: pageUrl,
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
        </>
      )}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />
      <div className="  min-h-screen px-1 md:px-2">
        {contentBlocks?.length ? (
          <>
            <MsmPageBuilder
              content={contentBlocks}
              language={language}
              channel={channel}
              deferAfter={2}
            />
            {/* {slug === "data-protection" && <CookieDeclaration />} */}
          </>
        ) : (
          <NotFound />
        )}
      </div>
    </MsmSiteWrapper>
  );
}
