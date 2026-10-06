import {JsonLdScript, CANONICAL_URL} from '@msm/lib/structured-data';
import {buildMsmMetadata, buildMsmRouteMetadata} from '@msm/lib/metadata';
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllMsmUnitSlugs, getMsmUnitBySlug, getMsmUnits } from "@1sp/sanity-queries";
import MsmSiteWrapper from "@msm/components/MsmSiteWrapper";
import MsmUnitPage from "@msm/components/units/MsmUnitPage";
import type { MsmUnitDetail, MsmUnitSummary } from "@msm/components/units/types";
import { generateBreadcrumbJsonLd } from "@/lib/structured-data";

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
  if (!unit) return buildMsmMetadata({title: 'Unit not found', metadata: {noIndex: true}});

  return buildMsmRouteMetadata({locale, path: `units/${slug}`, documentId: unit._id, title: unit.name, description: unit.claim, metadata: unit.metadata, fallbackImage: unit.heroImageUrl, fallbackImageAlt: unit.heroAlt});
}

export default async function UnitDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const language = locale || "en";
  const [unit, units] = await Promise.all([getMsmUnitBySlug(slug, language), getMsmUnits(language)]);
  if (!unit) notFound();

  const resolvedMetadata = buildMsmMetadata({locale: language, path: `units/${slug}`, title: unit.name, description: unit.claim, metadata: unit.metadata, fallbackImage: unit.heroImageUrl, fallbackImageAlt: unit.heroAlt});

  return (
    <MsmSiteWrapper language={language} navColor="light">
      <JsonLdScript locale={language}
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: unit.name,
          description: resolvedMetadata.description,
          image: (resolvedMetadata.openGraph as {images: {url: string}[]}).images[0].url,
          url: `${CANONICAL_URL}/units/${slug}`,
          parentOrganization: { "@type": "Organization", name: "MSM.digital", url: CANONICAL_URL },
        }}
      />
      <JsonLdScript locale={language}
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: CANONICAL_URL },
          { name: "Units", url: `${CANONICAL_URL}/units` },
          { name: unit.name, url: `${CANONICAL_URL}/units/${slug}` },
        ])}
      />
      <div className="min-h-screen">
        <MsmUnitPage unit={unit as MsmUnitDetail} language={language} units={units as MsmUnitSummary[]} />
      </div>
    </MsmSiteWrapper>
  );
}
