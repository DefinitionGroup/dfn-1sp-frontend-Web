import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@1sp/site-config";
import SiteHeader from "@studioco2/components/SiteHeader";
import Studioco2PageBuilder, { skipTarget } from "@studioco2/components/Studioco2PageBuilder";
import { clean } from "@studioco2/lib/media";
import { getPage, getPageSlugs } from "@studioco2/lib/queries";

const SITE = getSiteConfig("studioco2Web");

type Props = { params: Promise<{ locale: string; slug: string }> };

// Pages published after the build render on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  return Promise.all(SITE.locales.map(async (locale) => (await getPageSlugs(locale).catch(() => [])).map((slug) => ({ locale, slug: clean(slug) })))).then((all) => all.flat());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(slug, locale);
  if (!page) return {};
  return {
    title: clean(page.seo?.title) || `${clean(page.title) || "studioco2"} | studioco2`,
    description: clean(page.seo?.description) || SITE.seo.defaultDescription,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const page = await getPage(slug, locale);
  if (!page) notFound();
  const blocks = page.content ?? [];
  const hasHero = blocks.some((block) => block._type === "studioco2Hero");
  const skip = skipTarget(blocks);

  return (
    <>
      <a href={skip.href} className="skip-link">{skip.label}</a>
      {!hasHero && <div id="top" className="page-header"><SiteHeader /></div>}
      <main id="main" className="w-full max-w-full overflow-x-clip">
        <Studioco2PageBuilder blocks={blocks} />
      </main>
    </>
  );
}
