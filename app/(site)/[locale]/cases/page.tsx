import { sanityFetch } from "@/sanity/lib/live";
import { CASE_STUDIES_QUERY } from "@/sanity/lib/queries";
import { cookies } from "next/headers";
import CasesPageClient from "./CasesPageClient";

export const revalidate = 60;

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  const { data: caseStudies } = await sanityFetch({
    query: CASE_STUDIES_QUERY,
    params: { channel, language },
  });

  return <CasesPageClient caseStudies={caseStudies || []} locale={locale} />;
}
