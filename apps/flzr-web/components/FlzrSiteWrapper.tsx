import Image from "next/image";
import Link from "next/link";
import { getGlobalData } from "@/lib/sanity/queries";
import { getSiteConfig } from "@1sp/site-config";
import type { FooterMenu, NavbarMenu } from "@1sp/sanity-types/menu";

type FlzrSiteWrapperProps = {
  children: React.ReactNode;
  language?: string;
  navColor?: "light" | "dark";
};

const CHANNEL = "flizrWeb";
const FALLBACK_LINKS = [
  { href: "/cases", label: "Cases" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

function normalizePath(slug?: string | null): string {
  if (!slug || slug === "home" || slug === "homepage" || slug === "index") {
    return "/";
  }

  return `/${slug.replace(/^\/+/, "")}`;
}

function getNavLinks(menu: NavbarMenu | null | undefined) {
  const cmsLinks =
    menu?.menuItems
      ?.map((item) => ({
        href: normalizePath(item.slug),
        label: item.displayName || item.title || item.slug || "",
      }))
      .filter((item) => item.label) ?? [];

  return cmsLinks.length ? cmsLinks : FALLBACK_LINKS;
}

function FlzrNav({
  menu,
  navColor = "light",
}: {
  menu: NavbarMenu | null | undefined;
  navColor?: "light" | "dark";
}) {
  const links = getNavLinks(menu);
  const isDark = navColor === "dark";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-7">
      <nav
        aria-label="FLZR navigation"
        className={[
          "mx-auto flex h-14 max-w-[1480px] items-center justify-between border-b backdrop-blur-md",
          isDark
            ? "border-flzr-ink/15 text-flzr-ink"
            : "border-white/20 text-white",
        ].join(" ")}
      >
        <Link href="/" aria-label="FLZR home" className="flex items-center gap-3">
          <Image
            src="/units/FLZR/flzr_logo.svg"
            alt="FLZR"
            width={112}
            height={32}
            priority
            className={isDark ? "h-8 w-auto" : "h-8 w-auto brightness-0 invert"}
          />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium uppercase tracking-[0.08em] md:flex">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="transition-opacity hover:opacity-65"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/contact"
          className={[
            "inline-flex h-9 items-center border px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
            isDark
              ? "border-flzr-ink text-flzr-ink hover:bg-flzr-ink hover:text-white"
              : "border-white text-white hover:bg-white hover:text-flzr-ink",
          ].join(" ")}
        >
          Start
        </Link>
      </nav>
    </header>
  );
}

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
}: FlzrSiteWrapperProps) {
  const { nav, footer } = await getGlobalData(CHANNEL, language);

  return (
    <div className="min-h-screen bg-flzr-paper text-flzr-ink">
      <FlzrNav menu={nav as NavbarMenu} navColor={navColor} />
      <main>{children}</main>
      <FlzrFooter footer={footer as FooterMenu} />
    </div>
  );
}
