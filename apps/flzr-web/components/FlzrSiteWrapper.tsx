import Link from "next/link";
import { servicePageHref } from "@flzr/lib/service-pages";
import {
  getAllServicesForChannel,
  getGlobalData,
  getHomePage,
  getLocalizedNavigation,
} from "@1sp/sanity-queries";
import {
  getLanguageDefinition,
  getSiteConfig,
  type LocaleCode,
} from "@1sp/site-config";
import type { PageBuilderBlock } from "@1sp/sanity-types";
import type { FooterMenu, NavbarMenu } from "@1sp/sanity-types/menu";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavbarMenuProvider } from "./menu/NavbarMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import ScrollToTop from "./ui/ScrollToTop";
import FlzrFooterExternalBanner from "./FlzrFooterExternalBanner";

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

const FOOTER_COPY: Record<
  string,
  {
    services: string;
    aboutUs: string;
    legal: string;
    aboutLinks: [string, string];
    legalLinks: [string, string];
  }
> = {
  en: {
    services: "Services",
    aboutUs: "About us",
    legal: "Legal",
    aboutLinks: ["About us", "Jobs"],
    legalLinks: ["Disclaimer", "Data protection"],
  },
  de: {
    services: "Leistungen",
    aboutUs: "Über uns",
    legal: "Rechtliches",
    aboutLinks: ["Über uns", "Jobs"],
    legalLinks: ["Impressum", "Datenschutz"],
  },
  pl: {
    services: "Usługi",
    aboutUs: "O nas",
    legal: "Informacje prawne",
    aboutLinks: ["O nas", "Praca"],
    legalLinks: ["Informacje prawne", "Ochrona danych"],
  },
};

type FooterService = {
  _id?: string;
  name: string;
};

function getSelectedServices(content: PageBuilderBlock[]): FooterService[] {
  const services = content.flatMap((block) => {
    if (
      block._type !== "smartServicesCarousel" ||
      !Array.isArray(block.selectedServices)
    ) {
      return [];
    }

    return block.selectedServices.filter((service: FooterService) =>
      Boolean(service?.name),
    ) as FooterService[];
  });

  return Array.from(
    new Map(
      services.map((service) => [service._id ?? service.name, service]),
    ).values(),
  );
}

function FooterColumnHeading({
  index,
  title,
  href,
}: {
  index: string;
  title: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-white/35">{index}</span>
      <span>{title}</span>
      {href ? (
        <span
          aria-hidden="true"
          className="ml-auto transition-transform duration-300 group-hover:translate-x-1"
        >
          ↗
        </span>
      ) : null}
    </>
  );

  const className =
    "flzr-headline group mb-5 flex items-center gap-2 border-b border-white/15 pb-3 text-xs text-white";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <p className={className}>{content}</p>
  );
}

const footerLinkClassName =
  "group flex w-fit items-start gap-2 text-sm leading-5 text-white/65 transition-[color,transform] duration-300 hover:translate-x-1 hover:text-white focus-visible:translate-x-1 focus-visible:text-white focus-visible:outline-none";

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={footerLinkClassName}>
      <span aria-hidden="true" className="mt-px text-white/30">
        →
      </span>
      <span>{label}</span>
    </Link>
  );
}

/* Simplified footer (September 2026): three columns — services, about us,
   legal — plus the copyright / social row. The previous full footer is kept
   verbatim in ./menu/footer-backup-full.tsx. */
async function FlzrFooter({
  footer,
  language,
  homePage,
}: {
  footer: FooterMenu | null | undefined;
  language: string;
  homePage: { content?: PageBuilderBlock[] } | null | undefined;
}) {
  const copy = FOOTER_COPY[language] ?? FOOTER_COPY.en;
  const socialLinks = footer?.socialLinks ?? [];
  const content = Array.isArray(homePage?.content) ? homePage.content : [];
  const showsAllServices = language === "en" || content.some(
    (block) =>
      block._type === "servicesGalleryFiltered" ||
      block._type === "flzrServicesGrid",
  );
  const allServicesRaw = showsAllServices
    ? await getAllServicesForChannel(CHANNEL, language)
    : [];

  const services = Array.from(
    new Map(
      [...getSelectedServices(content), ...(allServicesRaw as FooterService[])]
        .filter((service) => Boolean(service?.name))
        .map((service) => [service._id ?? service.name, service]),
    ).values(),
  ).slice(0, 8);

  const aboutLinks = [
    { label: copy.aboutLinks[0], href: `/${language}/about-us` },
    { label: copy.aboutLinks[1], href: `/${language}/jobs` },
  ];
  const legalLinks = [
    { label: copy.legalLinks[0], href: `/${language}/disclaimer` },
    { label: copy.legalLinks[1], href: `/${language}/data-protection` },
  ];

  return (
    <footer className="mx-auto mb-12 w-[calc(100%-1rem)] max-w-[var(--flzr-shell-max)] overflow-hidden rounded-4xl bg-flzr-ink px-4 text-flzr-paper md:px-7">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-10 md:grid-cols-4 md:gap-x-10 md:py-14">
          <div className="col-span-2">
            <FooterColumnHeading
              index="01"
              title={copy.services}
              href={`/${language}/services`}
            />
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {services.map((service) => (
                <li key={service._id ?? service.name}>
                  <FooterLink
                    href={servicePageHref(service._id ?? "", language) ?? `/${language}/services`}
                    label={service.name}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading
              index="02"
              title={copy.aboutUs}
              href={`/${language}/about-us`}
            />
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading index="03" title={copy.legal} />
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/15 py-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{footer?.copyright || `© ${new Date().getFullYear()} FLZR`}</p>
          {socialLinks.length ? (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {socialLinks
                .filter((link) => Boolean(link.url))
                .map((link) => (
                  <a
                    key={link._key ?? link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none"
                  >
                    {link.name}
                  </a>
                ))}
            </div>
          ) : null}
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
  const [{ footer, hasCaseStudies, hasServices }, homePage, navigation] =
    await Promise.all([
      getGlobalData(CHANNEL, language),
      getHomePage(CHANNEL, language),
      getLocalizedNavigation(CHANNEL, language),
    ]);
  const site = getSiteConfig(CHANNEL);
  const nav = navigation.menu;
  const availableLocales = new Set(navigation.availableLocales);
  const languageOptions = site.locales.map((locale) => ({
    id: locale,
    label: getLanguageDefinition(locale as LocaleCode).title,
    available: availableLocales.has(locale),
  }));

  return (
    <FooterMenuProvider menu={footer as FooterMenu}>
      <NavbarMenuProvider
        menu={nav as NavbarMenu}
        hasCaseStudies={hasCaseStudies}
        hasServices={hasServices}
      >
        <NavColorProvider color={navColor}>
          {/* <PageWithMapVertical> */}
          <div className="min-h-screen bg-flzr-canvas text-flzr-ink">
            <FrontNavOverlay
              menuData={nav as NavbarMenu}
              color={navColor}
              channel={CHANNEL}
              locale={language}
              hasCaseStudies={hasCaseStudies}
              hasServices={hasServices}
              initialCaseStudies={overlayCaseStudies}
              languageOptions={languageOptions}
            />
            <main>{children}</main>
            <FlzrFooter
              footer={footer as FooterMenu}
              language={language}
              homePage={homePage}
            />
            {footer?.footerExternalBanner && (
              <FlzrFooterExternalBanner data={footer.footerExternalBanner} language={language} />
            )}
            <ScrollToTop />
          </div>
          {/* </PageWithMapVertical> */}
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
