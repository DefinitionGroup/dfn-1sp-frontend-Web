import { draftMode } from "next/headers";
import { SITE_CONFIGS } from "@1sp/site-config";
import SiteFooter from "@studioco2/components/SiteFooter";
import SiteProvider from "@studioco2/components/SiteProvider";
import { fallbackContact, siteNavigation } from "@studioco2/data/homepageFallback";
import { contactContent } from "@studioco2/lib/content";
import { getContact } from "@studioco2/lib/queries";

// English only; middleware serves public URLs from this internal /en segment.
export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_CONFIGS.studioco2Web.locales.map((locale) => ({ locale }));
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const settings = await getContact(locale).catch((error) => {
    console.error("Studio CO2 contact settings query failed; using the fallback.", error);
    return null;
  });
  // Contact details come from Site Settings once its email is set.
  const contact = settings?.email ? contactContent(settings, fallbackContact) : fallbackContact;

  const { isEnabled: draft } = await draftMode();
  let previewTools: React.ReactNode = null;
  if (draft) {
    const [{ VisualEditing }, { SanityLive }, { default: DisableDraftMode }] = await Promise.all([
      import("next-sanity/visual-editing"),
      import("@1sp/sanity-queries/live"),
      import("@studioco2/components/DisableDraftMode"),
    ]);
    previewTools = <><SanityLive /><VisualEditing /><DisableDraftMode /></>;
  }

  return (
    <SiteProvider navigation={siteNavigation}>
      {children}
      <SiteFooter contact={contact} />
      {previewTools}
    </SiteProvider>
  );
}
