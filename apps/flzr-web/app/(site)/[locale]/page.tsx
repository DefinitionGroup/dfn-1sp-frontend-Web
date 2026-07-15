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
import FlzrPageBuilder from "@flzr/components/FlzrPageBuilder";
import NotFound from "@flzr/components/ui/not-found";
import FlzrSiteWrapper from "@flzr/components/FlzrSiteWrapper";
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  JsonLdScript,
  generateHomepageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  extractCaseItemsFromContent,
  hasCaseListingBlocks,
  hasServicesGalleryBlock,
  mapCasesToItemList,
  mapServicesToCatalogItems,
  generateServiceCatalogJsonLd,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
  CANONICAL_URL,
} from "@/lib/structured-data";

export const revalidate = 60;
const DEFAULT_CHANNEL = "flizrWeb";
const SUPPORTED_LOCALES = ["en", "de", "pl"];

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
    return {
      title: "Page not found",
    };
  }

  const title = page.metadata?.title || page.title || "Home";
  const description =
    page.metadata?.description ||
    "1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.";
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
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      locale: language,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
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

  // Structured data: get social links & logo (cached — deduped with SiteWrapper)
  const globalData = await getGlobalData(DEFAULT_CHANNEL, language);
  const contentBlocks = page?.content as any[] | undefined;
  const needsAllCases = hasCaseListingBlocks(contentBlocks);
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
    <FlzrSiteWrapper language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateHomepageJsonLd({
          locale: language,
          logoUrl: globalData.nav?.logoUrl,
          socialLinks: globalData.footer?.socialLinks,
        })}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
        ])}
      />
      {/* ItemList for case carousels / galleries on the homepage */}
      {caseItems.length > 0 && (
        <JsonLdScript
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: "Featured Case Studies",
          })}
        />
      )}
      {services.length > 0 && (
        <JsonLdScript
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
        return people.length > 0 ? <JsonLdScript data={generatePeopleListJsonLd({ people })} /> : null;
      })()}
      {(() => {
        const units = extractUnitsFromContent(contentBlocks);
        return units.length > 0 ? <JsonLdScript data={generateUnitsListJsonLd({ units })} /> : null;
      })()}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />
      <div className="  min-h-screen px-1 md:px-4 ">
        {contentBlocks?.length ? (
          <FlzrPageBuilder
            content={contentBlocks}
            language={language}
            channel={DEFAULT_CHANNEL}
            deferAfter={2}
          />
        ) : (
          <NotFound />
        )}
      </div>
    </FlzrSiteWrapper>
  );
}
