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
 */
import { getCaseBySlug, getAllCaseSlugs } from "@/lib/sanity/queries";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CaseStudyPageClient from "./CaseStudyPageClient";
import SiteWrapper from "@/components/SiteWrapper";

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

  return caseSlugs.map((caseStudy) => ({
    locale: caseStudy.language || "en",
    slug: caseStudy.slug,
  }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const caseStudy = await getCaseBySlug(slug, language);

  if (!caseStudy) {
    notFound();
  }

  return (
    <SiteWrapper channel={channel} language={language} navColor="light">
      <div className="  min-h-screen px-1 pt-2 md:px-2">
        <CaseStudyPageClient caseStudy={caseStudy} locale={locale} />
      </div>
    </SiteWrapper>
  );
}
