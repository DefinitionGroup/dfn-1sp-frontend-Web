/**
 * Home Page
 * =========
 *
 * The main landing page for each locale (e.g., /en, /de).
 *
 * ## Performance Optimization (January 2026)
 *
 * Previously: `generateMetadata()` and the page component each called
 * `sanityFetch()` separately, resulting in 2 API calls for the same data.
 *
 * Now: Both use `getHomePage()` from the centralized data layer, which
 * wraps the fetch in React's `cache()`. This means only 1 API call is made,
 * even though `getHomePage()` is called twice.
 *
 * ## How This Works
 *
 * React's `cache()` function memoizes results within a single server render.
 * When `generateMetadata()` calls `getHomePage('1spWeb', 'en')` and then the
 * page component calls the same function with the same args, React returns
 * the cached result without making another API call.
 */
import { getHomePage } from "@/lib/sanity/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { cookies } from "next/headers";
import NotFound from "@/components/ui/not-found";
import SiteWrapper from "@/components/SiteWrapper";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";

import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch - shared with page component
  const page = await getHomePage(channel, language);

  if (!page) {
    return {
      title: "Page not found",
    };
  }

  return {
    title: page.metadata?.title || page.title,
    description: page.metadata?.description,
    openGraph: {
      images: page.metadata?.image
        ? [urlFor(page.metadata.image).width(1200).height(630).url()]
        : [],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const { locale } = await params;
  const language = locale || "en";

  // Uses cached fetch - deduped with generateMetadata call
  const page = await getHomePage(channel, language);

  const navbarVariant = page?.navbarVariant || "light";

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      <HamburgerGradientMenu />
      <div className="  min-h-screen px-1 md:px-4 ">
        {page?.content1sp ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : (
          <NotFound />
        )}
      </div>
    </SiteWrapper>
  );
}

