import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import NotFound from "@/components/ui/not-found";
import { cookies } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug, channel, language },
  });
  return (
    <div className=" min-h-screen">
      {page?.content1sp ? (
        <PageBuilder content={page.content1sp} />
      ) : (
        <NotFound />
      )}
    </div>
  );
}
