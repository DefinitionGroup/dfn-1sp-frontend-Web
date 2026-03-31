import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CANONICAL_SITE_URL } from "@/lib/site-url";

/**
 * Middleware — locale-free public URLs
 *
 * Public URLs have no locale prefix: `/about`, `/cases/my-case`.
 * Internally, Next.js routes still live under `[locale]`, so middleware
 * rewrites `/about` → `/en/about` behind the scenes.
 *
 * Old `/en/...` URLs get 301-redirected to the clean version for SEO.
 */
export default function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const canonicalUrl = new URL(CANONICAL_SITE_URL);
    const canonicalHost = canonicalUrl.hostname.toLowerCase();
    const requestHost = req.nextUrl.hostname.toLowerCase();

    const locale = "en";

    // Canonicalize www/non-www variants to the configured production hostname.
    const stripWww = (host: string) => host.replace(/^www\./, "");
    if (
        stripWww(requestHost) === stripWww(canonicalHost) &&
        requestHost !== canonicalHost
    ) {
        const url = req.nextUrl.clone();
        url.protocol = canonicalUrl.protocol;
        url.hostname = canonicalUrl.hostname;
        url.search = search;
        return NextResponse.redirect(url, 301);
    }

    // Skip locale logic for API, TRPC, and Studio presentation routes
    const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);
    const isStudioPresentation = pathname === '/studio/presentation' || /^\/[a-z]{2}(?:-[A-Z]{2})?\/studio\/presentation(\/|$)/.test(pathname);
    if (pathname.startsWith('/api') || pathname.startsWith('/trpc') || localePrefixedApiOrTrpc || isStudioPresentation) {
        return NextResponse.next();
    }

    // Detect if the URL already has a locale prefix (e.g. /en/about, /de/about)
    const segments = pathname.split("/").filter(Boolean);
    const candidate = segments[0] || "";
    const hasLocale = /^[a-z]{2}(-[A-Z]{2})?$/.test(candidate);

    // 301 redirect old locale-prefixed URLs → clean URLs
    // e.g. /en → /, /en/about → /about, /en/cases/foo → /cases/foo
    if (hasLocale) {
        const url = req.nextUrl.clone();
        const rest = segments.slice(1).join("/");
        url.pathname = rest ? `/${rest}` : "/";
        url.search = search;
        return NextResponse.redirect(url, 301);
    }

    // Rewrite clean URLs → internal [locale] routes
    // e.g. / → /en, /about → /en/about, /cases/foo → /en/cases/foo
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    url.search = search;

    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        '/((?!studio|_next|.*\\.(?:json|xml|txt|ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf)).*)',
        '/(api|trpc)(.*)',
    ],
};
