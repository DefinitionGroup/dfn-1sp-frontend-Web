import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_LOCALE = "en";
const LEGACY_V2_REDIRECTS = new Map([
  ["/home-v2", "/"],
  ["/services-v2", "/services"],
  ["/agency-v2", "/agency"],
]);

function getLegacyV2Redirect(pathname: string): string | null {
  const localizedMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/.*)$/);

  if (localizedMatch) {
    const [, locale, localizedPath] = localizedMatch;
    const destination = LEGACY_V2_REDIRECTS.get(localizedPath);
    if (!destination) return null;
    return `/${locale}${destination === "/" ? "" : destination}`;
  }

  return LEGACY_V2_REDIRECTS.get(pathname) || null;
}

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);

  if (pathname.startsWith("/api") || pathname.startsWith("/trpc") || localePrefixedApiOrTrpc) {
    return NextResponse.next();
  }

  const legacyV2Redirect = getLegacyV2Redirect(pathname);
  if (legacyV2Redirect) {
    const url = req.nextUrl.clone();
    url.pathname = legacyV2Redirect;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0] || "";
  const hasLocale = /^[a-z]{2}(-[A-Z]{2})?$/.test(candidate);

  if (hasLocale) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:json|xml|txt|ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
