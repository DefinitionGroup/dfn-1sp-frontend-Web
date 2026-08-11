import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_CONFIGS } from "@1sp/site-config";

const SITE = SITE_CONFIGS.renaissanceWeb;
const DEFAULT_LOCALE = SITE.defaultLocale;
const SUPPORTED_LOCALES = new Set<string>(SITE.locales);

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);

  if (pathname.startsWith("/api") || pathname.startsWith("/trpc") || localePrefixedApiOrTrpc) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0] || "";
  const looksLikeLocale = /^[a-z]{2}(-[A-Z]{2})?$/.test(candidate);

  if (candidate === DEFAULT_LOCALE) {
    const url = req.nextUrl.clone();
    url.pathname = `/${segments.slice(1).join("/")}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  if (looksLikeLocale && SUPPORTED_LOCALES.has(candidate)) {
    return NextResponse.next();
  }

  if (looksLikeLocale && !SUPPORTED_LOCALES.has(candidate)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 308);
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
