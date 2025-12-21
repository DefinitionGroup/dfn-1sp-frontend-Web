import { cookies } from "next/headers";
import { PageBuilder } from "@/components/PageBuilder";
import SiteWrapper from "@/components/SiteWrapper";
import NotFound from "@/components/ui/not-found";
import ContactForm from "@/components/ui/ContactForm";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";

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

  const { data: page } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug: "contact", channel, language },
  });

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
