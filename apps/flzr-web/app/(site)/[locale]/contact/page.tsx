/**
 * Contact Page
 * ============
 *
 * Displays the contact page with PageBuilder content and contact form.
 *
 * ## SEO (March 2026)
 *
 * - Full generateMetadata with title, description, OG image, keywords
 * - ContactPage JSON-LD + BreadcrumbList structured data
 * - Hero video poster preload for LCP optimization
 */
import FlzrPageBuilder from "@flzr/components/FlzrPageBuilder";
import FlzrSiteWrapper from "@flzr/components/FlzrSiteWrapper";
import NotFound from "@flzr/components/ui/not-found";
import ContactForm from "@flzr/components/ui/ContactForm";
import { getAllCases, getAllServicesForChannel, getPageBySlug } from "@1sp/sanity-queries";
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  JsonLdScript,
  generateContactPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  hasAutoCaseListingBlocks,
  hasServicesGalleryBlock,
  mapCasesToItemList,
  mapServicesToCatalogItems,
  generateServiceCatalogJsonLd,
  extractCaseItemsFromContent,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
  CANONICAL_URL,
} from "@/lib/structured-data";

export const revalidate = 60;
const CHANNEL = "flizrWeb";
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

  const page = await getPageBySlug("contact", CHANNEL, language);

  if (!page) {
    return { title: "Contact" };
  }

  const title = page.metadata?.title || page.title || "Contact";
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
      canonical: "/contact",
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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("contact", CHANNEL, language);

  if (!page) {
    return (
      <FlzrSiteWrapper language={language} navColor="light">
        <NotFound />
      </FlzrSiteWrapper>
    );
  }

  const navbarVariant = page?.navbarVariant || "light";
  const contentBlocks = page.content as any[] | undefined;
  const needsAllCases = hasAutoCaseListingBlocks(contentBlocks);
  const hasServicesGallery = hasServicesGalleryBlock(contentBlocks);

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(CHANNEL, language) : Promise.resolve([]),
    hasServicesGallery ? getAllServicesForChannel(CHANNEL, language) : Promise.resolve([]),
  ]);

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(contentBlocks);

  // Extract structured data from page builder content
  const caseItems = extractCaseItemsFromContent(contentBlocks, mapCasesToItemList(allCasesRaw));
  const services = mapServicesToCatalogItems(allServicesRaw);
  const people = extractPeopleFromContent(contentBlocks);
  const units = extractUnitsFromContent(contentBlocks);

  return (
    <FlzrSiteWrapper language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateContactPageJsonLd({
          locale: language,
          title: page.metadata?.title || page.title || "Contact",
          description: page.metadata?.description,
        })}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
          {
            name: getBreadcrumbLabel(language, "contact"),
            url: `${CANONICAL_URL}/contact`,
          },
        ])}
      />
      {caseItems.length > 0 && (
        <JsonLdScript
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: "Case Studies",
          })}
        />
      )}
      {services.length > 0 && (
        <JsonLdScript
          data={generateServiceCatalogJsonLd({
            services,
            locale: language,
            id: `${CANONICAL_URL}/contact#service-catalog`,
            name: "Services",
            url: `${CANONICAL_URL}/contact`,
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

      <div className="min-h-screen">
        <div className="min-h-screen px-1 md:px-2">
          {contentBlocks?.length ? (
            <FlzrPageBuilder
              content={contentBlocks}
              language={language}
              deferAfter={2}
            />
          ) : null}
          <ContactForm
            language={language}
            channel={CHANNEL}
            settings={page.contactForm}
          />
        </div>
      </div>
    </FlzrSiteWrapper>
  );
}
