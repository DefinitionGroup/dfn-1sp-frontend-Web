import { sanityFetch } from "@/sanity/lib/live";
import { SERVICES_QUERY, CASE_STUDIES_QUERY } from "@/sanity/lib/queries";
import { cookies } from "next/headers";
import ServicesPageClient from "./ServicesPageClient";

export const revalidate = 60;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  const { data: services } = await sanityFetch({
    query: SERVICES_QUERY,
    params: { language },
  });

  const { data: caseStudies } = await sanityFetch({
    query: CASE_STUDIES_QUERY,
    params: { channel, language },
  });

  return (
    <ServicesPageClient
      services={services || []}
      caseStudies={caseStudies || []}
      locale={locale}
    />
  );
}
