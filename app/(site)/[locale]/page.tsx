import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import { GlobalDataComponent } from "@/components/globalDataComponent";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
export const revalidate = 60;

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

  const navbarVariant = page?.navbarVariant || "light";

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      <HamburgerGradientMenu />
      <div className="  min-h-screen px-1 md:px-4">

        {page?.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
