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
import { PageBuilder } from "@/components/PageBuilder";
import { getAllCases, getAllPageSlugs, getAllServices, getPageBySlug } from "@/lib/sanity/queries";
import NotFound from "@/components/ui/not-found";
import { cookies } from "next/headers";
import SiteWrapper from "@/components/SiteWrapper";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import { resolveImageUrl } from "@/sanity/lib/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  JsonLdScript,
  generateWebPageJsonLd,
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
  CANONICAL_URL,
} from "@/lib/structured-data";

// Allow new pages to be rendered on-demand (ISR)
export const dynamicParams = true;

/**
 * Generate static params for all pages at build time.
 */
export async function generateStaticParams() {
  const pages = await getAllPageSlugs();

  return pages.map((page) => ({
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
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  // Uses cached fetch - shared with page component
  const page = await getPageBySlug(slug, channel, language);

  if (!page) {
    return {
      title: "Page not found",
    };
  }

  const title = page.metadata?.title || page.title;
  const description = page.metadata?.description;
  const ogImageUrl = resolveImageUrl(page.metadata?.image, { width: 1200, height: 630 });

  const ogImages = ogImageUrl
    ? [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ]
    : [];

  return {
    title,
    description,
    keywords: page.metadata?.keywords ?? undefined,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title,
      description: description || undefined,
      locale: language,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  // Uses cached fetch - deduped with generateMetadata call
  const page = await getPageBySlug(slug, channel, language);

  const navbarVariant = page?.navbarVariant || "light";
  const contentBlocks = page?.content1sp as any[] | undefined;
  const needsAllCases = hasAutoCaseListingBlocks(contentBlocks);
  const hasServicesGallery = hasServicesGalleryBlock(contentBlocks);

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(channel, language) : Promise.resolve([]),
    hasServicesGallery ? getAllServices(language) : Promise.resolve([]),
  ]);

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(contentBlocks);
  const caseItems = extractCaseItemsFromContent(contentBlocks, mapCasesToItemList(allCasesRaw));
  const services = mapServicesToCatalogItems(allServicesRaw);
  const pageUrl = `${CANONICAL_URL}/${slug}`;
  const ogImageUrl = resolveImageUrl(page.metadata?.image, { width: 1200, height: 630 });

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      {page && (
        <>
          <JsonLdScript
            data={generateWebPageJsonLd({
              title: page.metadata?.title || page.title || slug,
              slug,
              description: page.metadata?.description,
              locale: language,
              imageUrl: ogImageUrl,
            })}
          />
          <JsonLdScript
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
            <JsonLdScript
              data={generateItemListJsonLd({
                items: caseItems,
                locale: language,
                id: `${pageUrl}#case-list`,
              })}
            />
          )}
          {services.length > 0 && (
            <JsonLdScript
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
            return people.length > 0 ? <JsonLdScript data={generatePeopleListJsonLd({ people })} /> : null;
          })()}
          {(() => {
            const units = extractUnitsFromContent(contentBlocks);
            return units.length > 0 ? <JsonLdScript data={generateUnitsListJsonLd({ units })} /> : null;
          })()}
        </>
      )}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />
      <HamburgerGradientMenu />
      <div className="  min-h-screen px-1 md:px-2">
        {page?.content1sp ? (
          <PageBuilder
            content={page.content1sp}
            language={language}
            deferAfter={2}
          />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
