/**
 * Contact Page
 * ============
 *
 * Displays the contact page with PageBuilder content and contact form.
 *
 * ## Performance Optimization (January 2026)
 *
 * Uses `getPageBySlug()` for cached data fetching.
 */
import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import SiteWrapper from "@/components/SiteWrapper";
import NotFound from "@/components/ui/not-found";
import ContactForm from "@/components/ui/ContactForm";
import { getPageBySlug } from "@/lib/sanity/queries";

export const revalidate = 60;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  // Uses cached fetch from centralized data layer
  const page = await getPageBySlug("contact", channel, language);

  if (!page) {
    return (
      <SiteWrapper channel={channel} language={language} navColor="light">
        <NotFound />
      </SiteWrapper>
    );
  }

  const navbarVariant = page?.navbarVariant || "light";

  return (
    <SiteWrapper channel={channel} language={language} navColor={navbarVariant}>
      <div className="min-h-screen">   <div className="  min-h-screen px-1 md:px-2">
        {page.content1sp?.length ? (
          <PageBuilder content={page.content1sp} language={language} />
        ) : null}
        <ContactForm
          language={language}
          channel={channel}
          settings={page.contactForm}
        />
      </div>  </div>
    </SiteWrapper>
  );
}
