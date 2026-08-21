import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllMsmUnitSlugs, getMsmUnitBySlug } from "@1sp/sanity-queries";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import MsmUnitPage from "@msm/components/units/MsmUnitPage";
import type { MsmUnitDetail } from "@msm/components/units/types";
import { JsonLdScript, generateBreadcrumbJsonLd } from "@/lib/structured-data";
import { MSM_CANONICAL_URL as CANONICAL_URL } from "@msm/lib/site-url";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const units = await getAllMsmUnitSlugs();
  return units.map((unit: { language?: string; slug: string }) => ({
    locale: unit.language || "en",
    slug: unit.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const unit = await getMsmUnitBySlug(slug, locale || "en");
  if (!unit) return { title: "Unit not found" };

  const title = unit.metadata?.title || `${unit.name} | MSM.digital`;
  const description = unit.metadata?.description || unit.claim;
  const images = unit.heroImageUrl ? [{ url: unit.heroImageUrl, alt: unit.heroAlt || unit.name }] : [];

  return {
    title,
    description,
    keywords: unit.metadata?.keywords || undefined,
    alternates: { canonical: `/units/${slug}` },
    openGraph: { title, description, type: "website", locale, images },
    twitter: { card: "summary_large_image", title, description, images: images.map((image) => image.url) },
  };
}

export default async function UnitDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const language = locale || "en";
  const unit = await getMsmUnitBySlug(slug, language);
  if (!unit) notFound();

  return (
    <MsmSiteWrapper language={language} navColor="light">
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: unit.name,
          description: unit.claim,
          url: `${CANONICAL_URL}/units/${slug}`,
          parentOrganization: { "@type": "Organization", name: "MSM.digital", url: CANONICAL_URL },
        }}
      />
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: CANONICAL_URL },
          { name: "Units", url: `${CANONICAL_URL}/units` },
          { name: unit.name, url: `${CANONICAL_URL}/units/${slug}` },
        ])}
      />
      <div className="min-h-screen px-1 pt-2 md:px-2">
        <MsmUnitPage unit={unit as MsmUnitDetail} language={language} />
      </div>
    </MsmSiteWrapper>
  );
}
