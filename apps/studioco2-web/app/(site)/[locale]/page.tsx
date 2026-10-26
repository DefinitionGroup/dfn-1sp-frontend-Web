import type { Metadata } from "next";
import { preload } from "react-dom";
import { getSiteConfig } from "@1sp/site-config";
import Studioco2PageBuilder, { skipTarget } from "@studioco2/components/Studioco2PageBuilder";
import { fallbackBlocks, fallbackProjectNote } from "@studioco2/data/homepageFallback";
import { heroContent } from "@studioco2/lib/content";
import { clean } from "@studioco2/lib/media";
import { getHomePage } from "@studioco2/lib/queries";
import type { HeroBlock } from "@studioco2/lib/types";

const SITE = getSiteConfig("studioco2Web");

type Props = { params: Promise<{ locale: string }> };

/** CMS-first; without a published homepage with content, the P5 fallback renders. */
async function loadHome(locale: string) {
  const page = await getHomePage(locale).catch((error) => {
    console.error("Studio CO2 homepage query failed; rendering the fallback.", error);
    return null;
  });
  return page?.content?.length ? { page, blocks: page.content, fallback: false } : { page, blocks: fallbackBlocks, fallback: true };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { page } = await loadHome(locale);
  return {
    title: clean(page?.seo?.title) || SITE.seo.defaultTitle,
    description: clean(page?.seo?.description) || SITE.seo.defaultDescription,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const { blocks, fallback } = await loadHome(locale);
  const hero = blocks.find((block) => block._type === "studioco2Hero") as HeroBlock | undefined;
  const poster = hero && heroContent(hero).video?.poster;
  if (poster) preload(poster, { as: "image", fetchPriority: "high" });
  const skip = skipTarget(blocks);

  return (
    <>
      <a href={skip.href} className="skip-link">{skip.label}</a>
      <main id="main" className="w-full max-w-full overflow-x-clip">
        <Studioco2PageBuilder blocks={blocks} projectNote={fallback ? fallbackProjectNote : undefined} />
      </main>
    </>
  );
}
