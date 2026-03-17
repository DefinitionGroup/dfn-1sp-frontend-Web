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
import { cloudinaryPosterUrl, cloudinaryPosterSrcSet } from "@/utils/utils";
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

/** Extract hero video URL from page builder content for preload hint */
function extractHeroVideoUrl(content: any[]): string | undefined {
  if (!Array.isArray(content)) return undefined;
  for (const block of content) {
    if (block?._type === "oneSPHeader") {
      const media = block?.media;
      const url = media?.secure_url || media?.url;
      if (url && (/\/video\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url))) {
        return url;
      }
    }
  }
  return undefined;
}

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

  const title = page?.metadata?.title || "Cases";
  const description = page?.metadata?.description;

  const ogImages = page?.metadata?.image
    ? [
        {
          url: urlFor(page.metadata.image).width(1200).height(630).url(),
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

  // LCP optimization: preload hero poster image
  const heroVideoUrl = page?.content1sp
    ? extractHeroVideoUrl(page.content1sp as any[])
    : undefined;
  const heroPosterDesktop = heroVideoUrl
    ? cloudinaryPosterUrl(heroVideoUrl, { maxWidth: 1280 })
    : undefined;
  const heroPosterMobile = heroVideoUrl
    ? cloudinaryPosterUrl(heroVideoUrl, { maxWidth: 480, portrait: true })
    : undefined;
  const heroPosterDesktopSrcSet = heroVideoUrl
    ? cloudinaryPosterSrcSet(heroVideoUrl, [960, 1280, 1600, 1920])
    : undefined;
  const heroPosterMobileSrcSet = heroVideoUrl
    ? cloudinaryPosterSrcSet(heroVideoUrl, [360, 480, 640, 750], {
        portrait: true,
      })
    : undefined;

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
          })}
        />
      )}

      {/* Preload the hero poster for fast LCP */}
      {heroVideoUrl && (
        <>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        </>
      )}
      {heroPosterDesktop && (
        <link
          rel="preload"
          as="image"
          href={heroPosterDesktop}
          // @ts-expect-error — fetchpriority is valid HTML but not yet in React types
          fetchpriority="high"
          imageSrcSet={heroPosterDesktopSrcSet}
          imageSizes="100vw"
          media="(min-width: 769px)"
        />
      )}
      {heroPosterMobile && (
        <link
          rel="preload"
          as="image"
          href={heroPosterMobile}
          // @ts-expect-error — fetchpriority is valid HTML but not yet in React types
          fetchpriority="high"
          imageSrcSet={heroPosterMobileSrcSet}
          imageSizes="100vw"
          media="(max-width: 768px)"
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
