import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

    const channel = "1spWeb";
    const locale = "en";

    // Skip locale logic for API, TRPC, and Studio presentation routes
    const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);
    const isStudioPresentation = pathname === '/studio/presentation' || /^\/[a-z]{2}(?:-[A-Z]{2})?\/studio\/presentation(\/|$)/.test(pathname);
    if (pathname.startsWith('/api') || pathname.startsWith('/trpc') || localePrefixedApiOrTrpc || isStudioPresentation) {
        const res = NextResponse.next();
        res.cookies.set("channel", channel, { path: "/" });
        return res;
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

    const res = NextResponse.rewrite(url);
    res.cookies.set("channel", channel, { path: "/" });
    res.cookies.set("locale", locale, { path: "/" });

    return res;
}

export const config = {
    matcher: [
        '/((?!studio|_next|.*\\.(?:json|xml|txt|ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf)).*)',
        '/(api|trpc)(.*)',
    ],
};
