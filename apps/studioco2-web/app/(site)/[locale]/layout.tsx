import { SITE_CONFIGS } from "@1sp/site-config";
import SiteFooter from "@studioco2/components/SiteFooter";
import SiteProvider from "@studioco2/components/SiteProvider";
import { siteContact, siteNavigation } from "@studioco2/data/homepageFallback";

// English only; middleware serves public URLs from this internal /en segment.
export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_CONFIGS.studioco2Web.locales.map((locale) => ({ locale }));
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider navigation={siteNavigation}>
      {children}
      <SiteFooter contact={siteContact} />
    </SiteProvider>
  );
}
