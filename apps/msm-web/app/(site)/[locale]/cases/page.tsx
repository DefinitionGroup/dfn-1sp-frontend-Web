import {JsonLdScript, CANONICAL_URL} from '@msm/lib/structured-data';
import {buildMsmMetadata, buildMsmRouteMetadata} from '@msm/lib/metadata';
import {msmPath} from "@msm/lib/editorial";
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
import MsmPageBuilder from "@msm/components/MsmPageBuilder";
import NotFound from "@msm/components/ui/not-found";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import { getChannelFromEnv, getSiteConfig } from "@1sp/site-config";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  extractCaseItemsFromContent,
  getBreadcrumbLabel,
  type CaseItemForList,
} from "@/lib/structured-data";

export const revalidate = 60;
const CHANNEL = "msmWeb";
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
  const page = await getPageBySlug("cases", CHANNEL, language);

  return buildMsmRouteMetadata({locale: language, path: 'cases', documentId: page?._id, title: page?.title || 'Cases', metadata: page?.metadata});
}

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("cases", CHANNEL, language);

  const navbarVariant = page?.navbarVariant || "light";

  // Fetch all cases as fallback for auto-mode galleries (ItemList structured data)
  const allCasesRaw = await getAllCases(CHANNEL, language);
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
  const resolvedMetadata = buildMsmMetadata({locale: language, path: 'cases', title: page?.title, metadata: page?.metadata});
  const ogImageUrl = (resolvedMetadata.openGraph as {images: {url: string}[]}).images[0].url;

  // LCP optimization: preload hero poster image
  const contentBlocks = page?.content as any[] | undefined;
  const heroPreload = getHeroPreloadData(contentBlocks);

  return (
    <MsmSiteWrapper language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript locale={language} metadata={resolvedMetadata}
        data={generateCollectionPageJsonLd({
          title: page?.metadata?.title || "Cases",
          slug: "cases",
          description: resolvedMetadata.description || undefined,
          locale: language,
          imageUrl: ogImageUrl,
          mainEntityId: caseItems.length > 0 ? itemListId : undefined,
        })}
      />
      <JsonLdScript locale={language} metadata={resolvedMetadata}
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: CANONICAL_URL,
          },
          {
            name: getBreadcrumbLabel(language, "cases"),
            url: `${CANONICAL_URL}${msmPath(language, "cases")}`,
          },
        ])}
      />
      {caseItems.length > 0 && (
        <JsonLdScript locale={language} metadata={resolvedMetadata}
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
        {contentBlocks?.length ? (
          <MsmPageBuilder
            content={contentBlocks}
            language={language}
            channel={CHANNEL}
            deferAfter={2}
          />
        ) : (
          <NotFound />
        )}
      </div>
    </MsmSiteWrapper>
  );
}
