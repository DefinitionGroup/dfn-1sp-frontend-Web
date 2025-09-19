import { PageBuilder } from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";
import NotFound from "@/components/ui/not-found";
import { cookies } from "next/headers";

export default async function Page(props: any) {
  const { params } = props as { params: { locale: string; slug: string } };

  // read channel from cookie (middleware sets it) and locale from route params
  const cookieStore = cookies();
  const channel = (await cookieStore).get("channel")?.value || "1spWeb";
  const language = params.locale || "en";
  const slug = params.slug;

  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug, channel, language },
  });

  return (
    <main className="pt-20 md:pt-24 lg:pt-28 min-h-screen">
      {page?.content ? <PageBuilder content={page.content} /> : <NotFound />}
    </main>
  );
}
