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
import { getHomePage } from "@/lib/sanity/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";

import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
export const revalidate = 60;

const SUPPORTED_LOCALES = ["en", "de", "es"];

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
    alternates: {
      canonical: `/${language}`,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `/${l}`])
      ),
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

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
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
