import { getSiteConfig } from "@1sp/site-config";
import NewsArchive, { newsMetadata } from "./news-archive";

export const metadata = newsMetadata(1);

export function generateStaticParams() {
  return getSiteConfig("renaissanceWeb").locales.map((locale) => ({ locale }));
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <NewsArchive language={locale || "en"} page={1} />;
}
