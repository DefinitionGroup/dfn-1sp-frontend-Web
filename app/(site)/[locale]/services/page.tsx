/**
 * Services Page
 * =============
 *
 * Displays the services overview page with PageBuilder content.
 *
 * ## Performance Optimization (January 2026)
 *
 * Uses `getPageBySlug()` for cached data fetching.
 */
import { getPageBySlug } from "@/lib/sanity/queries";
import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";

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

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("services", channel, language);

  const navbarVariant = page?.navbarVariant || "light";

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      <HamburgerGradientMenu />
      <div className="min-h-screen px-1 md:px-2">
        {page?.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}
