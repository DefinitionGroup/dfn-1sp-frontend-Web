import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import HamburgerGradientMenu from "@/components/HamburgerGradientMenu";
import HeaderImageVideoComp from "@/components/HeaderImageVideoComp";
import FrontNavOverlay from "@/components/FrontNavOverlay2";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import TypewriterChangeContentExample from "@/components/TyperwriterHeadline";

export default async function Home({ params }: { params: { locale: string } }) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = params.locale || "en";

  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { channel, language },
  });
  //console.log("Home page data:", page);
  return (
    <main className="pt-20 md:pt-24 lg:pt-28 min-h-screen">
      {Array.isArray(page?.content1sp) ? (
        <PageBuilder content={page.content1sp} />
      ) : (
        "No content available"
      )}
    </main>
  );
}
