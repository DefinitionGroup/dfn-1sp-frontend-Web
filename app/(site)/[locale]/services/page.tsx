/**
 * Services Page
 * =============
 *
 * Displays the services overview page with PageBuilder content.
 *
 * ## SEO (March 2026)
 *
 * - Full generateMetadata with title, description, OG image, keywords
 * - WebPage JSON-LD + BreadcrumbList structured data
 * - Person/Unit JSON-LD for team members and business units in content
 * - Hero video poster preload for LCP optimization
 */
import { getAllCases, getAllServices, getPageBySlug } from "@1sp/sanity-queries";
import { getChannel } from "@1sp/site-config/server";
import { PageBuilder } from "@/components/PageBuilder";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  JsonLdScript,
  generateCollectionPageJsonLd,
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
  CANONICAL_URL,
} from "@/lib/structured-data";

export const revalidate = 60;
const SUPPORTED_LOCALES = ["en"];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const channel = await getChannel();
  const { locale } = await params;
  const language = locale || "en";

  const page = await getPageBySlug("services", channel, language);

  if (!page) {
    return { title: "Services" };
  }

  const title = page.metadata?.title || page.title || "Services";
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
      canonical: "/services",
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

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const channel = await getChannel();
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("services", channel, language);

  if (!page) {
    return (
      <SiteWrapper channel={channel} language={language} navColor="light">
        <NotFound />
      </SiteWrapper>
    );
  }

  const navbarVariant = page?.navbarVariant || "light";
  const contentBlocks = page.content1sp as any[] | undefined;
  const needsAllCases = hasAutoCaseListingBlocks(contentBlocks);
  const hasServicesGallery = hasServicesGalleryBlock(contentBlocks);

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(channel, language) : Promise.resolve([]),
    hasServicesGallery ? getAllServices(language) : Promise.resolve([]),
  ]);

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(contentBlocks);

  // Extract structured data from page builder content
  const caseItems = extractCaseItemsFromContent(
    contentBlocks,
    mapCasesToItemList(allCasesRaw),
  );
  const ogImageUrl = resolveImageUrl(page.metadata?.image, { width: 1200, height: 630 });
  const services = mapServicesToCatalogItems(allServicesRaw);
  const people = extractPeopleFromContent(contentBlocks);
  const units = extractUnitsFromContent(contentBlocks);
  const itemListId = `${CANONICAL_URL}/services#case-list`;
  const serviceCatalogId = `${CANONICAL_URL}/services#service-catalog`;

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateCollectionPageJsonLd({
          title: page.metadata?.title || page.title || "Services",
          slug: "services",
          description: page.metadata?.description,
          locale: language,
          imageUrl: ogImageUrl,
          mainEntityId:
            services.length > 0
              ? serviceCatalogId
                : caseItems.length > 0
                ? itemListId
                : undefined,
        })}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
          {
            name: getBreadcrumbLabel(language, "services"),
            url: `${CANONICAL_URL}/services`,
          },
        ])}
      />
      {caseItems.length > 0 && (
        <JsonLdScript
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: "Case Studies",
            id: itemListId,
          })}
        />
      )}
      {services.length > 0 && (
        <JsonLdScript
          data={generateServiceCatalogJsonLd({
            services,
            locale: language,
            id: serviceCatalogId,
            name: getBreadcrumbLabel(language, "services"),
          })}
        />
      )}
      {people.length > 0 && (
        <JsonLdScript data={generatePeopleListJsonLd({ people })} />
      )}
      {units.length > 0 && (
        <JsonLdScript data={generateUnitsListJsonLd({ units })} />
      )}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />
      <HamburgerGradientMenu />
      <div className="min-h-screen px-1 md:px-2 mt-2">
        {page.content1sp ? (
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
