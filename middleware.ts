import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const res = NextResponse.next();

    const channel = "1spWeb";

    // Don't apply locale-prefix redirects to API or TRPC routes or studio presentation routes.
    // Visual editing calls the preview enable route at /api/draft-mode/enable and
    // also uses the /studio/presentation endpoint; middleware must not rewrite those.
    const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);
    const isStudioPresentation = pathname === '/studio/presentation' || /^\/[a-z]{2}(?:-[A-Z]{2})?\/studio\/presentation(\/|$)/.test(pathname);
    if (pathname.startsWith('/api') || pathname.startsWith('/trpc') || localePrefixedApiOrTrpc || isStudioPresentation) {
        res.cookies.set("channel", channel, { path: "/" });
        return res;
    }

    const segments = pathname.split("/").filter(Boolean);
    const candidate = segments[0] || "";
    const hasLocale = /^[a-z]{2}(-[A-Z]{2})?$/.test(candidate);
    const locale = hasLocale ? candidate : "en";

    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}`;
        url.search = search;
        return NextResponse.redirect(url);
    }

    if (!hasLocale) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}${pathname}`;
        url.search = search;
        return NextResponse.redirect(url);
    }

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
