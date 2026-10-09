import {sanityFetch} from "@1sp/sanity-queries/fetch";
import Link from "next/link";
import {
  getAllCases,
  getAllPageSitemapSlugs,
  getAllServicesForChannel,
  getGlobalData,
} from "@1sp/sanity-queries";
import { getSiteConfig } from "@1sp/site-config";
import { stegaClean } from "next-sanity";
import type {
  FooterColumn,
  FooterColumnSource,
  FooterMenu,
  NavbarMenu,
} from "@1sp/sanity-types/menu";
import AiContentDisclosure from "@/components/AiContentDisclosure";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavbarMenuProvider } from "./menu/NavbarMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import ScrollToTop from "./ui/ScrollToTop";
import CornerMarkers from "./ui/CornerMarkers";
import MsmLogoAnimated from "./ui/MsmLogoAnimated";
import MosaicButton from "./ui/MosaicButton";
import MsmFooterExternalBanner from "./MsmFooterExternalBanner";

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

type MsmSiteWrapperProps = {
  children: React.ReactNode;
  language?: string;
  navColor?: "light" | "dark";
  overlayCaseStudies?: OverlayCaseStudy[];
};

const CHANNEL = "msmWeb";
// Footer links can point at pages of other network sites, which use locale-free URLs on their own domain.
const NETWORK_SITE_ORIGINS: Record<string, string> = { "1spWeb": "https://www.1sp.agency" };

type FooterCase = {
  _id?: string;
  title?: string;
  slug?: string | { current?: string };
};

type FooterService = {
  _id?: string;
  name?: string;
};

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

function getLocalePath(language: string, path = ""): string {
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  const localePrefix = language === "en" ? "" : `/${language}`;
  return `${localePrefix}${normalizedPath}` || "/";
}

function humanizeSlug(slug: string): string {
  return slug
    .split("/")
    .filter(Boolean)
    .at(-1)!
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dedupeLinks(links: FooterLink[]): FooterLink[] {
  return Array.from(new Map(links.map((link) => [link.href, link])).values());
}

function formatFooterIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function FooterColumnHeading({
  index,
  mobileIndex = index,
  title,
  href,
}: {
  index: number;
  /** Position in the reordered two-column mobile grid. */
  mobileIndex?: number;
  title: string;
  href?: string;
}) {
  const content = (
    <>
      {mobileIndex === index ? (
        <span className="font-aspekta text-white/30">{formatFooterIndex(index)}</span>
      ) : (
        <>
          <span className="font-aspekta text-white/30 md:hidden">
            {formatFooterIndex(mobileIndex)}
          </span>
          <span className="hidden font-aspekta text-white/30 md:inline">
            {formatFooterIndex(index)}
          </span>
        </>
      )}
      <span>{title}</span>
      {href ? (
        <span
          aria-hidden="true"
          className="ml-auto text-msm-cyan transition-transform duration-300 group-hover:translate-x-1"
        >
          ↗
        </span>
      ) : null}
    </>
  );
  const className =
    "group mb-5 flex items-center gap-2 border-b border-white/15 pb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-white";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <p className={className}>{content}</p>
  );
}

const footerLinkClassName =
  "group flex w-fit max-w-full items-start gap-2 text-sm leading-5 text-white/60 transition-[color,transform] duration-300 hover:translate-x-1 hover:text-white focus-visible:translate-x-1 focus-visible:text-white focus-visible:outline-none";

function FooterLinkItem({ link }: { link: FooterLink }) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="mt-px shrink-0 font-aspekta text-msm-cyan/45 transition-colors duration-300 group-hover:text-msm-cyan"
      >
        +
      </span>
      <span>{link.label}</span>
    </>
  );

  return link.external ? (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className={footerLinkClassName}
    >
      {content}
    </a>
  ) : (
    <Link href={link.href} className={footerLinkClassName}>
      {content}
    </Link>
  );
}

type FooterColumnData = {
  key: string;
  title: string;
  href?: string;
  links: FooterLink[];
};

// Mobile grid order classes, indexed by mobile position.
const footerMobileOrderClassName = ["order-1", "order-2", "order-3", "order-4"];

// The mobile footer is a two-column grid. With four columns the short last one
// (Connect) moves up beside the first so both rows end at a similar height.
function getFooterMobileOrder(columnCount: number): number[] {
  const order = Array.from({ length: columnCount }, (_, index) => index);
  return columnCount === 4 ? [0, 3, 1, 2] : order;
}

const footerGridColumnClassName: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

function getFooterColumnSource(column: FooterColumn): FooterColumnSource {
  const source = stegaClean(column.source);
  return source === "cases" || source === "services" || source === "pages"
    ? source
    : "manual";
}

function getFooterColumnLimit(column: FooterColumn, fallback: number): number {
  const limit = column.limit;
  return typeof limit === "number" && Number.isInteger(limit) && limit > 0
    ? limit
    : fallback;
}

async function MsmFooter({
  footer,
  nav,
  language,
  hasCaseStudies,
  hasServices,
}: {
  footer: FooterMenu | null | undefined;
  nav: NavbarMenu | null | undefined;
  language: string;
  hasCaseStudies: boolean;
  hasServices: boolean;
}) {
  const site = getSiteConfig(CHANNEL);
  const socialLinks = footer?.socialLinks ?? [];
  // Editor-defined columns replace the automatic grid as soon as one exists.
  const configuredColumns = (footer?.footerColumns ?? []).filter((column) =>
    Boolean(column?.title),
  );
  const usesConfiguredColumns = configuredColumns.length > 0;
  const sources = new Set<FooterColumnSource>(
    usesConfiguredColumns
      ? configuredColumns.map(getFooterColumnSource)
      : ["pages", "cases", "services"],
  );
  const needsCases = hasCaseStudies && sources.has("cases");
  const needsServices = hasServices && sources.has("services");
  const needsPages = sources.has("pages");

  const [casesRaw, servicesRaw, pagesRaw, servicePages] = await Promise.all([
    needsCases ? getAllCases(CHANNEL, language) : Promise.resolve([]),
    needsServices
      ? getAllServicesForChannel(CHANNEL, language)
      : Promise.resolve([]),
    needsPages ? getAllPageSitemapSlugs(CHANNEL) : Promise.resolve([]),
    needsServices
      ? sanityFetch<{slug:{current:string}; services:{_ref:string}[]}[]>({query: '*[_type == "page" && channel == "msmWeb" && language == $language && msmPageKind == "service"]{slug, services}', params:{language}})
      : Promise.resolve({ data: [] }),
  ]);

  const cases = (casesRaw as FooterCase[])
    .map((caseItem) => {
      const slug =
        typeof caseItem.slug === "string"
          ? caseItem.slug
          : caseItem.slug?.current;
      return slug && caseItem.title
        ? {
            label: caseItem.title,
            href: getLocalePath(language, `cases/${slug}`),
          }
        : null;
    })
    .filter((link): link is FooterLink => Boolean(link));

  const services = (servicesRaw as FooterService[])
    .filter((service) => Boolean(service.name))
    .map((service) => ({
      label: service.name!,
      href: getLocalePath(language, servicePages.data.find(page=>page.services?.some(ref=>ref._ref===service._id))?.slug?.current || "services"),
    }));

  const navLinks = (nav?.menuItems ?? [])
    .filter((item) => Boolean(item.slug))
    .map((item) => ({
      label: item.displayName || item.title || humanizeSlug(item.slug!),
      href: getLocalePath(language, item.slug!),
    }));

  const pageLinks = pagesRaw
    .filter((page) => page.language === language)
    .map((page) => ({
      label: humanizeSlug(page.slug),
      href: getLocalePath(language, page.slug),
    }));

  const exploreLinks = dedupeLinks([
    { label: "Home", href: getLocalePath(language) },
    ...navLinks,
    ...pageLinks,
    ...(hasCaseStudies
      ? [{ label: "All cases", href: getLocalePath(language, "cases") }]
      : []),
    ...(hasServices
      ? [{ label: "All services", href: getLocalePath(language, "services") }]
      : []),
    { label: "Contact", href: getLocalePath(language, "contact") },
  ]);

  const socialFooterLinks = socialLinks.flatMap((link) =>
    link.url
      ? [{ label: link.name || "Social", href: link.url, external: true }]
      : [],
  );

  const getManualLinks = (column: FooterColumn): FooterLink[] =>
    (column.links ?? []).flatMap((link): FooterLink[] => {
      if (stegaClean(link.linkType) === "external") {
        return link.externalUrl
          ? [{ label: link.displayName || link.externalUrl, href: link.externalUrl, external: true }]
          : [];
      }
      const caseSlug = link.case?.slug?.current;
      // A homepage's slug is not a public path; the page lives at the site root.
      const path = link.isCaseLink
        ? caseSlug ? `cases/${caseSlug}` : undefined
        : link.isHomepage ? "" : link.slug;
      if (path == null) return [];
      const label = link.displayName || (path ? humanizeSlug(path) : "Home");
      const pageChannel = link.isCaseLink ? CHANNEL : stegaClean(link.pageChannel) || CHANNEL;
      if (pageChannel === CHANNEL) return [{ label, href: getLocalePath(language, path) }];
      // Pages of other network sites keep their own domain; skip sites without a known one.
      const origin = NETWORK_SITE_ORIGINS[pageChannel];
      return origin ? [{ label, href: path ? `${origin}/${path}` : origin, external: true }] : [];
    });

  const columns: FooterColumnData[] = usesConfiguredColumns
    ? configuredColumns.map((column, index) => {
        const source = getFooterColumnSource(column);
        const base = { key: column._key ?? String(index), title: column.title! };

        switch (source) {
          case "cases":
            return {
              ...base,
              href: hasCaseStudies ? getLocalePath(language, "cases") : undefined,
              links: cases.slice(0, getFooterColumnLimit(column, 10)),
            };
          case "services":
            return {
              ...base,
              href: hasServices ? getLocalePath(language, "services") : undefined,
              links: services.slice(0, getFooterColumnLimit(column, 12)),
            };
          case "pages":
            return {
              ...base,
              links: exploreLinks.slice(0, getFooterColumnLimit(column, 12)),
            };
          default:
            return { ...base, links: getManualLinks(column) };
        }
      })
    : [
        { key: "explore", title: "Explore", links: exploreLinks.slice(0, 12) },
        {
          key: "cases",
          title: "Cases",
          href: getLocalePath(language, "cases"),
          links: cases.slice(0, 10),
        },
        {
          key: "capabilities",
          title: "Capabilities",
          href: getLocalePath(language, "services"),
          links: services.slice(0, 12),
        },
        {
          key: "connect",
          title: "Connect",
          links: dedupeLinks([
            { label: "Start a project", href: getLocalePath(language, "contact") },
            ...socialFooterLinks,
          ]).slice(0, 12),
        },
      ];
  const visibleColumns = columns.filter((column) => column.links.length > 0);
  const mobileOrder = getFooterMobileOrder(visibleColumns.length);
  const locations = footer?.locations ?? [];

  const statement =
    site.seo.defaultDescription !== "MSM website."
      ? site.seo.defaultDescription
      : "Building demand. Driving growth. Leading the curve.";

  return (
    <footer className="relative mx-1 mb-1 overflow-hidden bg-msm-surface px-4 text-msm-ink md:mx-4 md:mb-4 md:px-7">
      <CornerMarkers
        className="text-white/35 text-xl"
        inset="1rem"
        animateOnView
        animationDelay={0.1}
        stagger={0.12}
        flickerDuration={0.22}
        pronounced
      />

      <div className="relative mx-auto max-w-[1480px] border-t border-white/15">
        <div className="grid gap-10 py-10 md:grid-cols-12 md:py-14">
          <div className="md:col-span-7 lg:col-span-6">
            <div className="flex items-center gap-3">
              <MsmLogoAnimated
                size={56}
                className="h-12 w-12 md:h-14 md:w-14"
              />
              <span className="font-aspekta text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                Digital growth partner
              </span>
            </div>
            <p className="msm-headline mt-7 max-w-2xl text-[clamp(1.75rem,1.2rem+2vw,3.25rem)] leading-[0.98] tracking-[-0.04em] text-white">
              {statement}
            </p>
          </div>

          <div className="flex items-end md:col-span-5 md:justify-end lg:col-span-6">
            <Link
              href={getLocalePath(language, "contact")}
              className="group flex w-full items-center justify-between border-b border-white/30 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:border-msm-cyan md:max-w-md"
            >
              <span>Start a project</span>
              <span
                aria-hidden="true"
                className="font-aspekta text-xl text-msm-cyan transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>

        {visibleColumns.length ? (
          <div
            className={`grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/15 py-10 md:gap-x-10 md:py-12 ${
              footerGridColumnClassName[visibleColumns.length] ?? "md:grid-cols-4"
            }`}
          >
            {visibleColumns.map((column, columnIndex) => {
              const mobileIndex = mobileOrder.indexOf(columnIndex);
              return (
                <div
                  key={column.key}
                  className={`${footerMobileOrderClassName[mobileIndex] ?? ""} md:order-none`}
                >
                  <FooterColumnHeading
                    index={columnIndex}
                    mobileIndex={mobileIndex}
                    title={column.title}
                    href={column.href}
                  />
                  <ul className="space-y-3">
                    {column.links.map((link, linkIndex) => (
                      <li key={`${link.href}-${linkIndex}`}>
                        <FooterLinkItem link={link} />
                      </li>
                    ))}
                  </ul>

                  {columnIndex === visibleColumns.length - 1 && locations.length ? (
                    <div className="mt-8 space-y-4 border-t border-white/15 pt-5 text-xs leading-5 text-white/45">
                      {locations.map((location) => (
                        <address key={location._key} className="not-italic">
                          <span className="block font-semibold text-white/80">
                            {location.name}
                          </span>
                          {location.address}
                        </address>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="overflow-hidden border-t border-white/15 pt-8">
          <p
            aria-hidden="true"
            className="whitespace-nowrap text-[clamp(3.7rem,14vw,13rem)] font-black leading-[0.72] tracking-[-0.035em] text-white/[0.06]"
          >
            MSM.DIGITAL
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-6 font-aspekta text-[10px] uppercase tracking-[0.1em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {footer?.copyright ||
              `© ${new Date().getFullYear()} MSM.DIGITAL`}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            <MosaicButton
              href={getLocalePath(language, "contact")}
              size="sm"
              text="Contact"
            />
            {socialLinks
              .filter((link) => Boolean(link.url))
              .map((link) => (
                <a
                  key={link._key ?? link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-300 hover:text-white"
                >
                  {link.name}
                </a>
              ))}
            <div className="normal-case">
              <AiContentDisclosure tone="dark" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function MsmSiteWrapper({
  children,
  language = "en",
  navColor = "light",
  overlayCaseStudies,
}: MsmSiteWrapperProps) {
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
          {/* <PageWithMapVertical> */}
            <div className="msm-site min-h-screen bg-msm-paper text-msm-ink">
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
              <MsmFooter
                footer={footer as FooterMenu}
                nav={nav as NavbarMenu}
                language={language}
                hasCaseStudies={hasCaseStudies}
                hasServices={hasServices}
              />
              {footer?.footerExternalBanner && (
                <MsmFooterExternalBanner data={footer.footerExternalBanner} language={language} />
              )}
              <ScrollToTop />
            </div>
          {/* </PageWithMapVertical> */}
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
