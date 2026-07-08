/**
 * Cases Listing Page
 * ==================
 *
 * Displays the cases overview page with PageBuilder content.
 * Includes structured data (ItemList) for Google carousel rich results.
 *
 * ## Performance Optimization (January 2026)
 *
 * Uses `getPageBySlug()` for cached data fetching.
 */
import { getPageBySlug, getAllCases } from "@1sp/sanity-queries";
import { PageBuilder } from "@/components/PageBuilder";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import { resolveImageUrl } from "@1sp/sanity-queries/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import { getChannel } from "@1sp/site-config/server";
import {
  JsonLdScript,
  generateCollectionPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  extractCaseItemsFromContent,
  getBreadcrumbLabel,
  CANONICAL_URL,
  type CaseItemForList,
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
  const page = await getPageBySlug("cases", channel, language);

  const title = page?.metadata?.title || "Cases";
  const description = page?.metadata?.description;
  const ogImageUrl = resolveImageUrl(page?.metadata?.image, { width: 1200, height: 630 });

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
    keywords: page?.metadata?.keywords ?? undefined,
    alternates: {
      canonical: "/cases",
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

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const channel = await getChannel();
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("cases", channel, language);

  const navbarVariant = page?.navbarVariant || "light";

  // Fetch all cases as fallback for auto-mode galleries (ItemList structured data)
  const allCasesRaw = await getAllCases(channel, language);
  const allCaseItems: CaseItemForList[] = (allCasesRaw || [])
    .filter((cs: any) => cs?.title && cs?.slug?.current)
    .map((cs: any) => ({
      title: cs.title,
      slug: cs.slug.current,
      description: cs.description || null,
      imageUrl: cs.mainImageUrl || null,
    }));

  // Extract case items from page builder content (manual selections)
  // plus fallback to allCaseItems for auto-mode galleries
  const caseItems = extractCaseItemsFromContent(
    page?.content as any[] | undefined,
    allCaseItems,
  );
  const itemListId = `${CANONICAL_URL}/cases#case-list`;
  const ogImageUrl = resolveImageUrl(page?.metadata?.image, { width: 1200, height: 630 });

  // LCP optimization: preload hero poster image
  const heroPreload = getHeroPreloadData(page?.content as any[] | undefined);

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateCollectionPageJsonLd({
          title: page?.metadata?.title || "Cases",
          slug: "cases",
          description: page?.metadata?.description,
          locale: language,
          imageUrl: ogImageUrl,
          mainEntityId: caseItems.length > 0 ? itemListId : undefined,
        })}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
          {
            name: getBreadcrumbLabel(language, "cases"),
            url: `${CANONICAL_URL}/cases`,
          },
        ])}
      />
      {caseItems.length > 0 && (
        <JsonLdScript
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: getBreadcrumbLabel(language, "cases"),
            id: itemListId,
          })}
        />
      )}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />

      <div className="  min-h-screen px-1  md:px-4">
        {page?.content ? (
          <PageBuilder
            content={page.content}
            language={language}
            channel={channel}
            deferAfter={2}
          />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
