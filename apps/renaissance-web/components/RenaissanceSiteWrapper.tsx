import Image from "next/image";
import Link from "next/link";
import {
  getAllCases,
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
import {
  getRenaissanceEuropeanLocations,
  getRenaissanceGlobeSectionId,
} from "@renaissance/data/europeanLocations";
import type { PageBuilderBlock } from "@1sp/sanity-types";
import type { FooterMenu, NavbarMenu } from "@1sp/sanity-types/menu";
import {
  extractCaseItemsFromContent,
  hasCaseListingBlocks,
  mapCasesToItemList,
} from "@renaissance/lib/structured-data";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavbarMenuProvider } from "./menu/NavbarMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";
import ScrollToTop from "./ui/ScrollToTop";
import { localizedPath } from "@renaissance/lib/routes";

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

type RenaissanceSiteWrapperProps = {
  children: React.ReactNode;
  language?: string;
  navColor?: "light" | "dark";
  overlayCaseStudies?: OverlayCaseStudy[];
  homePageContent?: PageBuilderBlock[];
};

const CHANNEL = "renaissanceWeb";

const FOOTER_COPY: Record<
  string,
  {
    startProject: string;
    cases: string;
    services: string;
    locations: string;
    company: string;
    companyLinks: [string, string, string, string];
  }
> = {
  en: {
    startProject: "Start a project",
    cases: "Stories",
    services: "Services",
    locations: "Locations",
    company: "Company",
    companyLinks: ["About us", "Jobs", "Disclaimer", "Data protection"],
  },
  de: {
    startProject: "Projekt starten",
    cases: "Projekte",
    services: "Leistungen",
    locations: "Standorte",
    company: "Unternehmen",
    companyLinks: ["Über uns", "Jobs", "Impressum", "Datenschutz"],
  },
  pl: {
    startProject: "Rozpocznij projekt",
    cases: "Realizacje",
    services: "Usługi",
    locations: "Lokalizacje",
    company: "Firma",
    companyLinks: ["O nas", "Praca", "Informacje prawne", "Ochrona danych"],
  },
};

type FooterService = {
  _id?: string;
  name: string;
};

type FooterLocation = {
  _key?: string;
  name: string;
  detail?: string;
};

function getFooterLocations(language: string): FooterLocation[] {
  return getRenaissanceEuropeanLocations(language).map((location) => ({
    _key: location.code,
    name: location.name,
  }));
}

function getSelectedServices(content: PageBuilderBlock[]): FooterService[] {
  const services = content.flatMap((block) => {
    if (
      block._type === "cardContainerComponent" &&
      Array.isArray(block.cards)
    ) {
      return block.cards
        .filter((card: { headline?: string }) => Boolean(card?.headline))
        .map((card: { _key?: string; headline: string }) => ({
          _id: card._key,
          name: card.headline,
        }));
    }

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
    "renaissance-headline group mb-5 flex items-center gap-2 border-b border-white/15 pb-3 text-xs text-white";

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

async function RenaissanceFooter({
  footer,
  language,
  homePage,
}: {
  footer: FooterMenu | null | undefined;
  language: string;
  homePage: { content?: PageBuilderBlock[] } | null | undefined;
}) {
  const site = getSiteConfig(CHANNEL);
  const copy = FOOTER_COPY[language] ?? FOOTER_COPY.en;
  const socialLinks = footer?.socialLinks ?? [];
  const content = Array.isArray(homePage?.content) ? homePage.content : [];
  const needsAllCases = hasCaseListingBlocks(content);
  const showsAllServices = content.some(
    (block) => block._type === "servicesGalleryFiltered",
  );

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(CHANNEL, language) : Promise.resolve([]),
    showsAllServices
      ? getAllServicesForChannel(CHANNEL, language)
      : Promise.resolve([]),
  ]);

  const extractedCases = extractCaseItemsFromContent(
    content,
    mapCasesToItemList(allCasesRaw),
  ).slice(0, 6);
  const carouselStories = content
    .filter((block) => block._type === "carousel" && Array.isArray(block.items))
    .flatMap((block) => block.items as Array<{ _key?: string; title?: string }>)
    .filter((item) => Boolean(item?.title))
    .slice(0, 6);
  const cases = extractedCases.length
    ? extractedCases.map((caseItem) => ({
        key: caseItem.slug,
        title: caseItem.title,
        href: localizedPath(`/cases/${caseItem.slug}`, language),
      }))
    : carouselStories.map((story) => ({
        key: story._key ?? story.title ?? "story",
        title: story.title ?? "Story",
        href: localizedPath("/#stories", language),
      }));
  const services = Array.from(
    new Map(
      [...getSelectedServices(content), ...(allServicesRaw as FooterService[])]
        .filter((service) => Boolean(service?.name))
        .map((service) => [service._id ?? service.name, service]),
    ).values(),
  ).slice(0, 8);
  const globeBlock = content.find(
    (block) => block._type === "globeComponent",
  ) as
    | {
        sectionTitle?: string;
        navPointName?: string;
        locations?: Array<{ _key?: string; name?: string; subtitle?: string }>;
      }
    | undefined;
  const configuredLocations = Array.isArray(globeBlock?.locations)
    ? globeBlock.locations
        .filter((location) => Boolean(location?.name))
        .map((location) => ({
          _key: location._key,
          name: location.name as string,
          detail: location.subtitle,
        }))
    : [];
  const locations = configuredLocations.length
    ? configuredLocations
    : getFooterLocations(language);
  const globeSectionId = getRenaissanceGlobeSectionId(
    globeBlock?.navPointName || globeBlock?.sectionTitle,
  );
  const homepageStatement = content.find(
    (block) => typeof block.headline === "string" && block.headline.trim(),
  )?.headline as string | undefined;

  const companyLinks = [
    { label: copy.companyLinks[0], href: localizedPath("/about-us", language) },
    { label: copy.companyLinks[1], href: localizedPath("/jobs", language) },
    { label: copy.companyLinks[2], href: localizedPath("/disclaimer", language) },
    { label: copy.companyLinks[3], href: localizedPath("/data-protection", language) },
  ];

  return (
    <footer className="container mx-auto mb-12 w-[calc(100%-0.5rem)] overflow-hidden rounded-4xl bg-renaissance-ink px-4 text-renaissance-paper md:px-7">
      <div className="mx-auto max-w-[1480px] border-t border-white/15">
        <div className="grid gap-10 py-10 md:grid-cols-12 md:py-14">
          <div className="md:col-span-6 lg:col-span-5">
            <Image
              src="/units/RENAISSANCE/renaissance-horz_logo.svg"
              alt="Renaissance"
              width={286}
              height={59}
              className="h-10 w-auto brightness-0 invert md:h-11"
              style={{ width: "auto" }}
            />
            <p className="renaissance-headline mt-7 max-w-xl text-[clamp(1.35rem,1.05rem+1.2vw,2.25rem)] leading-[1.08] text-white">
              {homepageStatement || site.seo.defaultDescription}
            </p>
          </div>

          <div className="flex items-end md:col-span-6 md:justify-end lg:col-span-7">
            <Link
              href={localizedPath("/contact", language)}
              className="group flex w-full items-center justify-between border-b border-white/30 py-4 text-base font-semibold text-white transition-colors duration-300 hover:border-renaissance-accent md:max-w-sm"
            >
              <span>{copy.startProject}</span>
              <span
                aria-hidden="true"
                className="text-xl transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/15 py-10 md:grid-cols-4 md:gap-x-10 md:py-12">
          <div>
            <FooterColumnHeading
              index="01"
              title={copy.cases}
              href={cases[0]?.href || localizedPath("/#stories", language)}
            />
            <ul className="space-y-3">
              {cases.map((caseItem) => (
                <li key={caseItem.key}>
                  <Link
                    href={caseItem.href}
                    className={footerLinkClassName}
                  >
                    <span aria-hidden="true" className="mt-px text-white/30">
                      →
                    </span>
                    <span>{caseItem.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading
              index="02"
              title={copy.services}
              href={localizedPath("/services", language)}
            />
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service._id ?? service.name}>
                  <Link
                    href={localizedPath("/#services", language)}
                    className={footerLinkClassName}
                  >
                    <span aria-hidden="true" className="mt-px text-white/30">
                      →
                    </span>
                    <span>{service.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading index="03" title={copy.locations} />
            <ul className="space-y-4">
              {locations.map((location) => (
                <li
                  key={location._key ?? `${location.name}-${location.detail}`}
                >
                  <Link
                    href={localizedPath(`/#${globeSectionId}`, language)}
                    className={footerLinkClassName}
                  >
                    <span aria-hidden="true" className="mt-px text-white/30">
                      →
                    </span>
                    <span>
                      <span className="block capitalize text-white">
                        {location.name}
                      </span>
                      {location.detail ? (
                        <span className="mt-1 block text-xs text-white/45">
                          {location.detail}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading index="04" title={copy.company} />
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLinkClassName}>
                    <span aria-hidden="true" className="mt-px text-white/30">
                      →
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/15 py-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{footer?.copyright || `© ${new Date().getFullYear()} Renaissance`}</p>
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

export default async function RenaissanceSiteWrapper({
  children,
  language = "en",
  navColor = "light",
  overlayCaseStudies,
  homePageContent,
}: RenaissanceSiteWrapperProps) {
  const [{ footer, hasCaseStudies, hasServices }, homePage, navigation] =
    await Promise.all([
      getGlobalData(CHANNEL, language),
      getHomePage(CHANNEL, language),
      getLocalizedNavigation(CHANNEL, language),
    ]);
  const site = getSiteConfig(CHANNEL);
  const nav = navigation.menu;
  const availableLocales = new Set(navigation.availableLocales);
  const languageOptions = site.locales.length > 1
    ? site.locales.map((locale) => ({
        id: locale,
        label: getLanguageDefinition(locale as LocaleCode).title,
        available: availableLocales.has(locale),
      }))
    : [];
  const effectiveHomePage = homePage?.content?.length
    ? homePage
    : homePageContent?.length
      ? { content: homePageContent }
      : homePage;

  return (
    <FooterMenuProvider menu={footer as FooterMenu}>
      <NavbarMenuProvider
        menu={nav as NavbarMenu}
        hasCaseStudies={hasCaseStudies}
        hasServices={hasServices}
      >
        <NavColorProvider color={navColor}>
          {/* <PageWithMapVertical> */}
          <div className="renaissance-page min-h-screen bg-renaissance-paper text-renaissance-ink">
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
            <RenaissanceFooter
              footer={footer as FooterMenu}
              language={language}
              homePage={effectiveHomePage}
            />
            <ScrollToTop />
          </div>
          {/* </PageWithMapVertical> */}
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
