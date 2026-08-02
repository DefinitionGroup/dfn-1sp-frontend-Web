/**
 * Case Study Detail Page
 * ======================
 *
 * Displays individual case study content.
 *
 * ## Performance Optimization (January 2026)
 *
 * - Uses `getCaseBySlug()` for cached data fetching
 * - Implements `generateStaticParams()` for build-time pre-rendering
 *
 * ## Static Generation
 *
 * `generateStaticParams()` tells Next.js to pre-render these pages at build time.
 * This means:
 * - First visitor gets instant HTML (no API call)
 * - ISR still works for new case studies (dynamicParams = true)
 * - Significantly reduces Sanity API usage
 *
 * ## SEO (February 2026)
 *
 * - Full generateMetadata with title, description, and OG image
 * - Canonical URLs to prevent duplicate content
 * - Twitter card metadata for social sharing
 */
import { getCaseBySlug, getAllCaseSlugs, getAllCases } from "@1sp/sanity-queries";
import { notFound } from "next/navigation";
import CaseStudyPageClient from "./CaseStudyPageClient";
import SiteWrapper from "@/components/SiteWrapper";
import type { Metadata } from "next";
import { getChannel } from "@1sp/site-config/server";
import {
  JsonLdScript,
  generateCaseStudyJsonLd,
  generateBreadcrumbJsonLd,
  getBreadcrumbLabel,
  CANONICAL_URL,
} from "@/lib/structured-data";

export const revalidate = 60;

// Allow new case studies to be rendered on-demand (ISR)
export const dynamicParams = true;

/**
 * Generate static params for all case studies at build time.
 *
 * This function runs during `next build` and tells Next.js which
 * case study pages to pre-render.
 *
 * @returns Array of { locale, slug } params for each case study
 */
export async function generateStaticParams() {
  const caseSlugs = await getAllCaseSlugs();

  return caseSlugs
    .filter(
      (caseStudy) =>
        caseStudy.channel?.includes("1spWeb") &&
        (caseStudy.language || "en") === "en",
    )
    .map((caseStudy) => ({
      locale: "en",
      slug: caseStudy.slug,
    }));
}

/**
 * Generate metadata for case study pages.
 *
 * Pulls title, description, and main image from the Sanity case study data.
 * Uses the same cached `getCaseBySlug` as the page component,
 * so only one API call is made per render.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const channel = await getChannel();
  const language = locale || "en";

  const caseStudy = await getCaseBySlug(slug, channel, language);

  if (!caseStudy) {
    return {
      title: "Case Study not found",
    };
  }

  const title = caseStudy.title;
  const description =
    caseStudy.description ||
    `${caseStudy.title}${caseStudy.client?.name ? ` — ${caseStudy.client.name}` : ""} | Case Study`;

  // Use mainImageUrl (Cloudinary secure_url) for OG image
  const ogImages = caseStudy.mainImageUrl
    ? [
        {
          url: caseStudy.mainImageUrl,
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
      canonical: `/cases/${slug}`,
    },
    openGraph: {
      title,
      description,
      locale: language,
      type: "article",
      images: ogImages,
      ...(caseStudy.publishedAt && {
        publishedTime: caseStudy.publishedAt,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const channel = await getChannel();
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const [caseStudy, overlayCasesRaw] = await Promise.all([
    getCaseBySlug(slug, channel, language),
    getAllCases(channel, language),
  ]);

  if (!caseStudy) {
    notFound();
  }

  const overlayCaseStudies = (overlayCasesRaw || []).map((item: any) => ({
    _id: item._id,
    title: item.title,
    subtitle: item.subtitle,
    slug: item.slug,
    description: item.description,
    services: Array.isArray(item.services)
      ? item.services.map((service: any) => ({
          _id: service._id,
          name: service.name,
          taglabel: service.taglabel,
        }))
      : [],
    mainImageUrl: item.mainImageUrl,
    mainVideoUrl: item.mainVideoUrl,
    client: item.client
      ? {
          _id: item.client._id,
          name: item.client.name,
          logoUrl: item.client.logoUrl,
        }
      : undefined,
    websiteUrl: item.websiteUrl,
    websiteUrlText: item.websiteUrlText,
  }));

  return (
    <SiteWrapper
      channel={channel}
      language={language}
      navColor="light"
      overlayCaseStudies={overlayCaseStudies}
    >
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript
        data={generateCaseStudyJsonLd({
          title: caseStudy.title,
          slug,
          description: caseStudy.description,
          locale: language,
          imageUrl: caseStudy.mainImageUrl,
          publishedAt: caseStudy.publishedAt,
          clientName: caseStudy.client?.name,
          services: caseStudy.services,
          units: caseStudy.units,
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
          {
            name: caseStudy.title,
            url: `${CANONICAL_URL}/cases/${slug}`,
          },
        ])}
      />

      <div className="  min-h-screen px-1 pt-2 md:px-2">
        <CaseStudyPageClient caseStudy={caseStudy} locale={locale} />
      </div>
    </SiteWrapper>
  );
}
