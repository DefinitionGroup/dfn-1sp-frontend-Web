import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import NotFound from "@/components/ui/not-found";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { channel, language },
  });
  //console.log("Home page data:", page);
  return (
    <div className="  min-h-screen">
      {page?.content1sp ? (
        <PageBuilder content={page.content1sp} />
      ) : (
        <NotFound />
      )}
    </div>
  );
}
