import Link from "next/link";
import {
  getAllCases,
  getAllPageSitemapSlugs,
  getAllServicesForChannel,
  getGlobalData,
} from "@1sp/sanity-queries";
import { getSiteConfig } from "@1sp/site-config";
import type { FooterMenu, NavbarMenu } from "@1sp/sanity-types/menu";
import FrontNavOverlay from "./menu/FrontNavOverlay";
import { FooterMenuProvider } from "./menu/FooterMenuContext";
import { NavbarMenuProvider } from "./menu/NavbarMenuContext";
import { NavColorProvider } from "./menu/NavColorContext";
import PageWithMapVertical from "./ui/PageWithMapVertical";
import ScrollToTop from "./ui/ScrollToTop";
import CornerMarkers from "./ui/CornerMarkers";
import MsmLogoAnimated from "./ui/MsmLogoAnimated";

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
      <span className="font-mono text-white/30">{index}</span>
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
        className="mt-px shrink-0 font-mono text-msm-cyan/45 transition-colors duration-300 group-hover:text-msm-cyan"
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
  const [casesRaw, servicesRaw, pagesRaw] = await Promise.all([
    hasCaseStudies ? getAllCases(CHANNEL, language) : Promise.resolve([]),
    hasServices
      ? getAllServicesForChannel(CHANNEL, language)
      : Promise.resolve([]),
    getAllPageSitemapSlugs(CHANNEL),
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
    .filter((link): link is FooterLink => Boolean(link))
    .slice(0, 10);

  const services = (servicesRaw as FooterService[])
    .filter((service) => Boolean(service.name))
    .map((service) => ({
      label: service.name!,
      href: `${getLocalePath(language, "services")}#services`,
    }))
    .slice(0, 12);

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
  ]).slice(0, 12);

  const configuredLinks = (footer?.footerColumns ?? []).flatMap((column) =>
    (column.links ?? []).flatMap((link) => {
      const caseSlug = link.case?.slug?.current;
      const internalSlug = link.isCaseLink
        ? caseSlug && `cases/${caseSlug}`
        : link.slug;
      const href =
        link.linkType === "external"
          ? link.externalUrl
          : internalSlug
            ? getLocalePath(language, internalSlug)
            : undefined;

      return href
        ? [
            {
              label:
                link.displayName ||
                (internalSlug ? humanizeSlug(internalSlug) : href),
              href,
              external: link.linkType === "external",
            },
          ]
        : [];
    }),
  );

  const connectLinks = dedupeLinks([
    { label: "Start a project", href: getLocalePath(language, "contact") },
    ...configuredLinks,
    ...socialLinks.flatMap((link) =>
      link.url
        ? [{ label: link.name || "Social", href: link.url, external: true }]
        : [],
    ),
  ]).slice(0, 12);

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
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                Digital growth partner
              </span>
            </div>
            <p className="mt-7 max-w-2xl text-[clamp(1.75rem,1.2rem+2vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white">
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
                className="font-mono text-xl text-msm-cyan transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/15 py-10 md:grid-cols-4 md:gap-x-10 md:py-12">
          <div>
            <FooterColumnHeading index="01" title="Explore" />
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading
              index="02"
              title="Cases"
              href={getLocalePath(language, "cases")}
            />
            <ul className="space-y-3">
              {cases.map((link) => (
                <li key={link.href}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading
              index="03"
              title="Capabilities"
              href={getLocalePath(language, "services")}
            />
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterColumnHeading index="04" title="Connect" />
            <ul className="space-y-3">
              {connectLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>

            {(footer?.locations ?? []).length ? (
              <div className="mt-8 space-y-4 border-t border-white/15 pt-5 text-xs leading-5 text-white/45">
                {footer?.locations?.map((location) => (
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
        </div>

        <div className="overflow-hidden border-t border-white/15 pt-8">
          <p
            aria-hidden="true"
            className="whitespace-nowrap text-[clamp(3.7rem,14vw,13rem)] font-black leading-[0.72] tracking-[-0.035em] text-white/[0.06]"
          >
            MSM.DIGITAL
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-6 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {footer?.copyright ||
              `© ${new Date().getFullYear()} MSM.DIGITAL`}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href={getLocalePath(language, "contact")}
              className="transition-colors duration-300 hover:text-white"
            >
              Contact
            </Link>
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
            <div className="min-h-screen bg-msm-paper text-msm-ink">
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
              <ScrollToTop />
            </div>
          {/* </PageWithMapVertical> */}
        </NavColorProvider>
      </NavbarMenuProvider>
    </FooterMenuProvider>
  );
}
