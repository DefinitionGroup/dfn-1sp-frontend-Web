export const DEFAULT_LOCALE = "en";

const EXTERNAL_PROTOCOL = /^(?:https?:|mailto:|tel:|sms:)/i;

export function localizedPath(href: string, locale?: string): string;
export function localizedPath(
  href: null | undefined,
  locale?: string,
): undefined;
export function localizedPath(
  href: string | null | undefined,
  locale?: string,
): string | undefined;
export function localizedPath(
  href?: string | null,
  locale: string = DEFAULT_LOCALE,
): string | undefined {
  if (!href) return undefined;

  const raw = href.trim() || "/";

  if (EXTERNAL_PROTOCOL.test(raw) || raw.startsWith("//")) {
    return raw;
  }

  const normalized = raw.startsWith("#")
    ? `/${raw}`
    : raw.startsWith("/")
      ? raw
      : `/${raw}`;
  const currentLocalePrefix = `/${locale}`;
  const withoutCurrentLocale =
    normalized === currentLocalePrefix
      ? "/"
      : normalized.startsWith(`${currentLocalePrefix}/`)
        ? normalized.slice(currentLocalePrefix.length)
        : normalized;

  if (locale === DEFAULT_LOCALE) {
    return withoutCurrentLocale;
  }

  return `/${locale}${withoutCurrentLocale === "/" ? "" : withoutCurrentLocale}`;
}
