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
import { getHomePage, getGlobalData } from "@/lib/sanity/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";
import { getHeroPreloadData, HeroPreloadLinks } from "@/lib/hero-utils";
import {
  JsonLdScript,
  generateHomepageJsonLd,
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

import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
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

  // Uses cached fetch - shared with page component
  const page = await getHomePage(channel, language);

  if (!page) {
    return {
      title: "Page not found",
    };
  }

  const title = page.metadata?.title || page.title || "Home";
  const description =
    page.metadata?.description ||
    "1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.";

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
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch - deduped with generateMetadata call
  const page = await getHomePage(channel, language);

  const navbarVariant = page?.navbarVariant || "light";

  // Structured data: get social links & logo (cached — deduped with SiteWrapper)
  const globalData = await getGlobalData(channel, language);

  // LCP optimization: preload hero poster image so the browser discovers it
  // during HTML parsing, well before JavaScript mounts the client component.
  const heroPreload = getHeroPreloadData(page?.content1sp as any[] | undefined);

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
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
      {(() => {
        const caseItems = extractCaseItemsFromContent(
          page?.content1sp as any[] | undefined,
        );
        return caseItems.length > 0 ? (
          <JsonLdScript
            data={generateItemListJsonLd({
              items: caseItems,
              locale: language,
              listName: "Featured Case Studies",
            })}
          />
        ) : null;
      })()}

      {/* Person & Unit structured data from page builder content */}
      {(() => {
        const people = extractPeopleFromContent(page?.content1sp as any[] | undefined);
        return people.length > 0 ? <JsonLdScript data={generatePeopleListJsonLd({ people })} /> : null;
      })()}
      {(() => {
        const units = extractUnitsFromContent(page?.content1sp as any[] | undefined);
        return units.length > 0 ? <JsonLdScript data={generateUnitsListJsonLd({ units })} /> : null;
      })()}

      {/* Preload the hero poster for fast LCP */}
      <HeroPreloadLinks {...heroPreload} />
      <HamburgerGradientMenu />
      <div className="  min-h-screen px-1 md:px-4 ">
        {page?.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
