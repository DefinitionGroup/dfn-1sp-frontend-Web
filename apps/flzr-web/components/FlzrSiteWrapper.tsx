import Image from "next/image";
import Link from "next/link";
import {
  getAllCases,
  getAllServicesForChannel,
  getGlobalData,
  getHomePage,
} from "@1sp/sanity-queries";
import { getSiteConfig } from "@1sp/site-config";
import type { PageBuilderBlock } from "@1sp/sanity-types";
import type { FooterMenu, NavbarMenu } from "@1sp/sanity-types/menu";
import {
  extractCaseItemsFromContent,
  hasAutoCaseListingBlocks,
  mapCasesToItemList,
} from "@/lib/structured-data";
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

type FooterService = {
  _id?: string;
  name: string;
};

type FooterLocation = {
  _key?: string;
  name: string;
  detail?: string;
};

function getHomepageLocations(
  content: PageBuilderBlock[],
  footer: FooterMenu | null | undefined,
): FooterLocation[] {
  const homepageLocations = content.flatMap((block) => {
    if (block._type !== "globeComponent" || !Array.isArray(block.locations)) {
      return [];
    }

    return block.locations
      .filter((location: { name?: string }) => Boolean(location?.name))
      .map(
        (location: {
          _key?: string;
          name: string;
          subtitle?: string;
        }) => ({
          _key: location._key,
          name: location.name,
          detail: location.subtitle,
        }),
      );
  });

  if (homepageLocations.length) return homepageLocations;

  return (footer?.locations ?? [])
    .filter((location) => Boolean(location.name))
    .map((location) => ({
      _key: location._key,
      name: location.name ?? "",
      detail: location.address,
    }));
}

function getSelectedServices(content: PageBuilderBlock[]): FooterService[] {
  const services = content.flatMap((block) => {
    if (
      block._type !== "smartServicesCarousel" ||
      !Array.isArray(block.selectedServices)
    ) {
      return [];
    }

    return block.selectedServices.filter(
      (service: FooterService) => Boolean(service?.name),
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
    "group mb-5 flex items-center gap-2 border-b border-white/15 pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-white";

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

async function FlzrFooter({
  footer,
  language,
  homePage,
}: {
  footer: FooterMenu | null | undefined;
  language: string;
  homePage: { content?: PageBuilderBlock[] } | null | undefined;
}) {
  const site = getSiteConfig(CHANNEL);
  const socialLinks = footer?.socialLinks ?? [];
  const content = Array.isArray(homePage?.content) ? homePage.content : [];
  const needsAllCases = hasAutoCaseListingBlocks(content);
  const showsAllServices = content.some(
    (block) => block._type === "servicesGalleryFiltered",
  );

  const [allCasesRaw, allServicesRaw] = await Promise.all([
    needsAllCases ? getAllCases(CHANNEL, language) : Promise.resolve([]),
    showsAllServices
      ? getAllServicesForChannel(CHANNEL, language)
      : Promise.resolve([]),
  ]);

  const cases = extractCaseItemsFromContent(
    content,
    mapCasesToItemList(allCasesRaw),
  ).slice(0, 6);
  const services = Array.from(
    new Map(
      [...getSelectedServices(content), ...(allServicesRaw as FooterService[])]
        .filter((service) => Boolean(service?.name))
        .map((service) => [service._id ?? service.name, service]),
    ).values(),
  ).slice(0, 8);
  const locations = getHomepageLocations(content, footer);
  const homepageStatement = content.find(
    (block) => typeof block.headline === "string" && block.headline.trim(),
  )?.headline as string | undefined;

  const companyLinks = [
    { label: "About us", href: `/${language}/about-us` },
    { label: "Jobs", href: `/${language}/jobs` },
    { label: "Disclaimer", href: `/${language}/disclaimer` },
    { label: "Data protection", href: `/${language}/data-protection` },
  ];

  return (
    <footer className="container mx-auto mb-12 w-[calc(100%-0.5rem)] overflow-hidden rounded-4xl bg-flzr-ink px-4 text-flzr-paper md:px-7">
      <div className="mx-auto max-w-[1480px] border-t border-white/15">
        <div className="grid gap-10 py-10 md:grid-cols-12 md:py-14">
          <div className="md:col-span-6 lg:col-span-5">
            <Image
              src="/units/FLZR/flzr_logo.svg"
              alt="FLZR"
              width={154}
              height={44}
              className="h-10 w-auto brightness-0 invert md:h-11"
              style={{ width: "auto" }}
            />
            <p className="mt-7 max-w-xl text-[clamp(1.35rem,1.05rem+1.2vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white">
              {homepageStatement || site.seo.defaultDescription}
            </p>
          </div>

          <div className="flex items-end md:col-span-6 md:justify-end lg:col-span-7">
            <Link
              href={`/${language}/contact`}
              className="group flex w-full items-center justify-between border-b border-white/30 py-4 text-base font-semibold text-white transition-colors duration-300 hover:border-flzr-violet md:max-w-sm"
            >
              <span>Start a project</span>
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
              title="Cases"
              href={`/${language}/cases`}
            />
            <ul className="space-y-3">
              {cases.map((caseItem) => (
                <li key={caseItem.slug}>
                  <Link
                    href={`/${language}/cases/${caseItem.slug}`}
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
              title="Services"
              href={`/${language}/services`}
            />
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service._id ?? service.name}>
                  <Link
                    href={`/${language}#services`}
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
            <FooterColumnHeading index="03" title="Locations" />
            <ul className="space-y-4">
              {locations.map((location) => (
                <li key={location._key ?? `${location.name}-${location.detail}`}>
                  <Link
                    href={`/${language}#globe-component`}
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
            <FooterColumnHeading index="04" title="Company" />
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
  const [{ nav, footer, hasCaseStudies, hasServices }, homePage] =
    await Promise.all([
      getGlobalData(CHANNEL, language),
      getHomePage(CHANNEL, language),
    ]);

  return (
    <FooterMenuProvider menu={footer as FooterMenu}>
      <NavbarMenuProvider
        menu={nav as NavbarMenu}
        hasCaseStudies={hasCaseStudies}
        hasServices={hasServices}
      >
        <NavColorProvider color={navColor}>
          {/* <PageWithMapVertical> */}
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
              <FlzrFooter
                footer={footer as FooterMenu}
                language={language}
                homePage={homePage}
              />
              <ScrollToTop />
            </div>
          {/* </PageWithMapVertical> */}
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
