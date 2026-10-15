import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getSiteConfig } from "@1sp/site-config";
import NewsArchive, { getNewsPageCount, newsMetadata, pageNumber } from "../news-archive";

type Props = { params: Promise<{ locale: string; page: string }> };

// Pages added after a deploy render on first visit and are then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  const pageCount = await getNewsPageCount();
  const pages = Array.from({ length: pageCount - 1 }, (_, i) => String(i + 2));
  return getSiteConfig("renaissanceWeb").locales.flatMap((locale) =>
    pages.map((page) => ({ locale, page })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return newsMetadata(pageNumber((await params).page) ?? 1);
}

export default async function NewsPageN({ params }: Props) {
  const { locale, page } = await params;
  const number = pageNumber(page);
  if (!number) notFound();
  if (number === 1) permanentRedirect("/news");
  return <NewsArchive language={locale || "en"} page={number} />;
}
