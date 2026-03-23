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
import { getPageBySlug } from "@/lib/sanity/queries";
import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import NotFound from "@/components/ui/not-found";
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

  const page = await getPageBySlug("services", channel, language);

  if (!page) {
    return { title: "Services" };
  }

  const title = page.metadata?.title || page.title || "Services";
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
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
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

  // Extract structured data from page builder content
  const caseItems = extractCaseItemsFromContent(page.content1sp as any[] | undefined);
  const people = extractPeopleFromContent(page.content1sp as any[] | undefined);
  const units = extractUnitsFromContent(page.content1sp as any[] | undefined);

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateWebPageJsonLd({
          title: page.metadata?.title || page.title || "Services",
          slug: "services",
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
          fetchPriority="high"
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
          fetchPriority="high"
          imageSrcSet={heroPosterMobileSrcSet}
          imageSizes="100vw"
          media="(max-width: 768px)"
        />
      )}
      <HamburgerGradientMenu />
      <div className="min-h-screen px-1 md:px-2 mt-2">
        {page.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
