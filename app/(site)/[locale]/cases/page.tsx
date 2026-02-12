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
import { getPageBySlug, getAllCases } from "@/lib/sanity/queries";
import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";
import {
  JsonLdScript,
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  extractCaseItemsFromContent,
  getBreadcrumbLabel,
  CANONICAL_URL,
  type CaseItemForList,
} from "@/lib/structured-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";
  const page = await getPageBySlug("cases", channel, language);

  return {
    title: page?.metadata?.title || "Cases",
    description: page?.metadata?.description,
    openGraph: {
      title: page?.metadata?.title || "Cases",
      description: page?.metadata?.description || undefined,
      ...(page?.metadata?.image && {
        images: [
          {
            url: urlFor(page.metadata.image).width(1200).height(630).url(),
            width: 1200,
            height: 630,
          },
        ],
      }),
    },
  };
}

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
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
    page?.content1sp as any[] | undefined,
    allCaseItems,
  );

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateWebPageJsonLd({
          title: page?.metadata?.title || "Cases",
          slug: "cases",
          description: page?.metadata?.description,
          locale: language,
        })}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          {
            name: getBreadcrumbLabel(language, "home"),
            url: `${CANONICAL_URL}/${language}`,
          },
          {
            name: getBreadcrumbLabel(language, "cases"),
            url: `${CANONICAL_URL}/${language}/cases`,
          },
        ])}
      />
      {caseItems.length > 0 && (
        <JsonLdScript
          data={generateItemListJsonLd({
            items: caseItems,
            locale: language,
            listName: getBreadcrumbLabel(language, "cases"),
          })}
        />
      )}

      <div className="  min-h-screen px-1  md:px-4">
        {page?.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
