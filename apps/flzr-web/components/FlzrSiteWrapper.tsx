import Image from "next/image";
import { getGlobalData } from "@1sp/sanity-queries";
import { getSiteConfig } from "@1sp/site-config";
import type { FooterMenu, NavbarMenu } from "@1sp/sanity-types/menu";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavbarMenuProvider } from "./menu/NavbarMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import ScrollToTop from "./ui/ScrollToTop";

type OverlayCaseStudy = {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string; taglabel?: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
};

type FlzrSiteWrapperProps = {
  children: React.ReactNode;
  language?: string;
  navColor?: "light" | "dark";
  overlayCaseStudies?: OverlayCaseStudy[];
};

const CHANNEL = "flizrWeb";

function FlzrFooter({ footer }: { footer: FooterMenu | null | undefined }) {
  const site = getSiteConfig(CHANNEL);
  const socialLinks = footer?.socialLinks ?? [];

  return (
    <footer className="bg-flzr-ink px-4 py-10 text-flzr-paper md:px-7">
      <div className="mx-auto grid max-w-[1480px] gap-10 border-t border-white/15 pt-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src="/units/FLZR/flzr_logo.svg"
            alt="FLZR"
            width={126}
            height={36}
            className="h-9 w-auto brightness-0 invert"
          />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
            {site.seo.defaultDescription}
          </p>
        </div>

        <div className="text-sm text-white/70">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            Locations
          </p>
          {(footer?.locations ?? []).length ? (
            <div className="space-y-3">
              {footer?.locations?.map((location) => (
                <div key={location._key}>
                  <p className="text-white">{location.name}</p>
                  <p>{location.address}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Independent FLZR website shell.</p>
          )}
        </div>

        <div className="text-sm text-white/70">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            Social
          </p>
          <div className="flex flex-wrap gap-4">
            {socialLinks.length ? (
              socialLinks.map((link) => (
                <a
                  key={link._key}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  {link.name}
                </a>
              ))
            ) : (
              <span>Channels pending</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function FlzrSiteWrapper({
  children,
  language = "en",
  navColor = "light",
  overlayCaseStudies,
}: FlzrSiteWrapperProps) {
  const { nav, footer, hasCaseStudies, hasServices } = await getGlobalData(
    CHANNEL,
    language
  );

  return (
    <FooterMenuProvider menu={footer as FooterMenu}>
      <NavbarMenuProvider
        menu={nav as NavbarMenu}
        hasCaseStudies={hasCaseStudies}
        hasServices={hasServices}
      >
        <NavColorProvider color={navColor}>
          <PageWithMapVertical>
            <div className="min-h-screen bg-flzr-paper text-flzr-ink">
              <FrontNavOverlay
                menuData={nav as NavbarMenu}
                color={navColor}
                channel={CHANNEL}
                locale={language}
                hasCaseStudies={hasCaseStudies}
                hasServices={hasServices}
                initialCaseStudies={overlayCaseStudies}
              />
              <main>{children}</main>
              <FlzrFooter footer={footer as FooterMenu} />
              <ScrollToTop />
            </div>
          </PageWithMapVertical>
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
