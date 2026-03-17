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
import { getPageBySlug, getAllPageSlugs } from "@/lib/sanity/queries";
import NotFound from "@/components/ui/not-found";
import { cookies } from "next/headers";
import SiteWrapper from "@/components/SiteWrapper";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";
import { cloudinaryPosterUrl, cloudinaryPosterSrcSet } from "@/utils/utils";
import {
  JsonLdScript,
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  extractCaseItemsFromContent,
  extractPeopleFromContent,
  generatePeopleListJsonLd,
  extractUnitsFromContent,
  generateUnitsListJsonLd,
  getBreadcrumbLabel,
  CANONICAL_URL,
} from "@/lib/structured-data";

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

  const ogImages = page.metadata?.image
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
      {page && (
        <>
          <JsonLdScript
            data={generateWebPageJsonLd({
              title: page.metadata?.title || page.title || slug,
              slug,
              description: page.metadata?.description,
              locale: language,
              imageUrl: page.metadata?.image
                ? urlFor(page.metadata.image).width(1200).height(630).url()
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
                name: page.title || slug,
                url: `${CANONICAL_URL}/${slug}`,
              },
            ])}
          />
          {/* ItemList for case carousels / galleries on this page */}
          {(() => {
            const caseItems = extractCaseItemsFromContent(
              page.content1sp as any[] | undefined,
            );
            return caseItems.length > 0 ? (
              <JsonLdScript
                data={generateItemListJsonLd({
                  items: caseItems,
                  locale: language,
                })}
              />
            ) : null;
          })()}
          {/* Person & Unit structured data from page builder content */}
          {(() => {
            const people = extractPeopleFromContent(page.content1sp as any[] | undefined);
            return people.length > 0 ? <JsonLdScript data={generatePeopleListJsonLd({ people })} /> : null;
          })()}
          {(() => {
            const units = extractUnitsFromContent(page.content1sp as any[] | undefined);
            return units.length > 0 ? <JsonLdScript data={generateUnitsListJsonLd({ units })} /> : null;
          })()}
        </>
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
      <HamburgerGradientMenu />
      <div className="  min-h-screen px-1 md:px-2">
        {page?.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
