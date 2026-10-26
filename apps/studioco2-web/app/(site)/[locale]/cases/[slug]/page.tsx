import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getSiteConfig } from "@1sp/site-config";
import CaseBody from "@studioco2/components/CaseBody";
import CaseMedia from "@studioco2/components/CaseMedia";
import SiteHeader from "@studioco2/components/SiteHeader";
import { caseHref } from "@studioco2/lib/content";
import { clean, cloudinary, imageUrl } from "@studioco2/lib/media";
import { getCase, getCaseOrder, getCaseSlugs } from "@studioco2/lib/queries";

const SITE = getSiteConfig("studioco2Web");

type Props = { params: Promise<{ locale: string; slug: string }> };

// Cases assigned to Studio CO2 after the build render on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  return Promise.all(SITE.locales.map(async (locale) => (await getCaseSlugs(locale).catch(() => [])).map((slug) => ({ locale, slug: clean(slug) })))).then((all) => all.flat());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getCase(slug, locale);
  if (!item) return {};
  const image = imageUrl(item.mainImageUrl, 1200);
  return {
    title: `${clean(item.seo?.title || item.title) || "Case"} | studioco2`,
    description: clean(item.seo?.description || item.description) || SITE.seo.defaultDescription,
    alternates: { canonical: `/cases/${slug}` },
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function CasePage({ params }: Props) {
  const { locale, slug } = await params;
  const [item, order] = await Promise.all([getCase(slug, locale), getCaseOrder(locale).catch(() => [])]);
  if (!item) notFound();

  const title = item.title || "Untitled case";
  const services = (item.services ?? []).filter((service): service is string => Boolean(service));
  const facts = [
    ["Client", item.client],
    ["Discipline", item.discipline],
    ["Sector", item.sector],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));
  const position = order.findIndex((entry) => clean(entry.slug) === clean(slug));
  const next = order.length > 1 && position >= 0 ? order[(position + 1) % order.length] : null;

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <div id="top" className="page-header"><SiteHeader /></div>
      <main id="main" className="case-page w-full max-w-full overflow-x-clip">
        <section className="case-hero section-pad" aria-labelledby="case-title">
          <div className="work-top"><Link href="/#work"><ArrowLeft /> Selected work</Link>{item.subtitle && <span>{item.subtitle}</span>}</div>
          <h1 id="case-title" className="case-title">{title}</h1>
          {item.description && <p className="case-summary">{item.description}</p>}
          {(facts.length > 0 || services.length > 0) && <dl className="case-facts">
            {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            {services.length > 0 && <div><dt>Services</dt><dd>{services.join(" / ")}</dd></div>}
          </dl>}
          <figure className="case-figure case-hero-media">
            <CaseMedia video={cloudinary(item.mainVideoUrl, "q_auto")} image={imageUrl(item.mainImageUrl, 2400)} alt={title} className="case-figure-media" />
          </figure>
        </section>
        <CaseBody blocks={item.casesPageBuilder ?? []} />
        {next && <nav className="case-next section-pad" aria-label="Next case">
          <span className="case-label">Next case</span>
          <Link href={caseHref(next.slug) ?? "/#work"} className="case-next-link">{next.title}<ArrowRight /></Link>
        </nav>}
      </main>
    </>
  );
}
