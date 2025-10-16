import { sanityFetch } from "@/sanity/lib/live";
import { CASE_STUDY_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CaseStudyPageClient from "./CaseStudyPageClient";

export const revalidate = 60;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  const { data: caseStudy } = await sanityFetch({
    query: CASE_STUDY_BY_SLUG_QUERY,
    params: { slug, channel, language },
  });

  if (!caseStudy) {
    notFound();
  }

  return <CaseStudyPageClient caseStudy={caseStudy} locale={locale} />;
}
