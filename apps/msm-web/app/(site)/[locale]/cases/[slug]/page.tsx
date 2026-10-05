import {JsonLdScript, CANONICAL_URL} from '@msm/lib/structured-data';
import {buildMsmMetadata} from '@msm/lib/metadata';
import {msmPath} from "@msm/lib/editorial";
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
import { getCaseBySlug, getAllCaseSlugs } from "@1sp/sanity-queries";
import { stegaClean } from "next-sanity";
import { notFound } from "next/navigation";
import CaseStudyPageClient from "./CaseStudyPageClient";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import type { Metadata } from "next";
import {
  generateCaseStudyJsonLd,
  generateBreadcrumbJsonLd,
  getBreadcrumbLabel,
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
    .filter((caseStudy) => caseStudy.channel?.includes("msmWeb"))
    .map((caseStudy) => ({
      locale: caseStudy.language || "en",
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
  const channel = "msmWeb";
  const language = locale || "en";

  const caseStudy = await getCaseBySlug(slug, channel, language);

  if (!caseStudy) {
    return {
      title: "Case Study not found",
    };
  }

  return buildMsmMetadata({locale: language, path: `cases/${slug}`, title: caseStudy.title, description: caseStudy.description, metadata: caseStudy.seo, fallbackImage: caseStudy.mainImageUrl, type: 'article', publishedAt: caseStudy.publishedAt});
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const channel = "msmWeb";
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const caseStudy = await getCaseBySlug(slug, channel, language);

  if (!caseStudy) {
    notFound();
  }

  return (
    <MsmSiteWrapper language={language} navColor="light">
      {/* Structured Data (JSON-LD) */}
      <JsonLdScript locale={language}
        data={generateCaseStudyJsonLd({
          title: caseStudy.title,
          slug,
          description: caseStudy.description,
          locale: language,
          imageUrl: caseStudy.mainImageUrl,
          publishedAt: caseStudy.publishedAt,
          clientName: caseStudy.client?.name,
          services: caseStudy.services,
        })}
      />
      <JsonLdScript locale={language}
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
            url: `${CANONICAL_URL}${msmPath(language, `cases/${slug}`)}`,
          },
        ])}
      />

      <div className="  min-h-screen px-1 pt-2 md:px-2">
        <CaseStudyPageClient caseStudy={caseStudy} locale={locale} />
      </div>
    </MsmSiteWrapper>
  );
}
