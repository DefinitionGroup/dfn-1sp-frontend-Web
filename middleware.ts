import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const res = NextResponse.next();

    const channel = "1spWeb";

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
