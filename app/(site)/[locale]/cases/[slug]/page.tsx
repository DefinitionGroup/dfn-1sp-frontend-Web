import { sanityFetch } from "@/sanity/lib/live";
import { CASE_STUDY_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CaseStudyPageClient from "./CaseStudyPageClient";
import SiteWrapper from "@/components/SiteWrapper";

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

  return (
    <SiteWrapper channel={channel} language={language} navColor="light">
      <div className="  min-h-screen px-1 border-3 pt-2  border-green-400 md:px-8">
        <CaseStudyPageClient caseStudy={caseStudy} locale={locale} />
      </div>
    </SiteWrapper>
  );
}
