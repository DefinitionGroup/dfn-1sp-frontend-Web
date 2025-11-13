import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import NotFound from "@/components/ui/not-found";

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

  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug: "services", channel, language },
  });

  return (
    <div className="min-h-screen">
      {page?.content1sp ? (
        <PageBuilder content={page.content1sp} />
      ) : (
        <NotFound />
      )}
    </div>
  );
}
