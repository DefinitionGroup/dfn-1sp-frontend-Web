// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const { pathname, search } = req.nextUrl;

    // Project only hosts 1sp here — always use 1spWeb
    const channel = "1spWeb";

    // Is the first segment a locale like "en" or "en-US"?
    const segments = pathname.split("/").filter(Boolean);
    const candidate = segments[0] || "";
    const hasLocale = /^[a-z]{2}(-[A-Z]{2})?$/.test(candidate);
    const locale = hasLocale ? candidate : "en"; // set your default here

    // If we're at root "/", push to "/<locale>"
    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}`;
        // keep any query params
        url.search = search;
        return NextResponse.redirect(url);
    }

    // Cookies for your server components/fetchers
    res.cookies.set("channel", channel, { path: "/" });
    res.cookies.set("locale", locale, { path: "/" });

    return res;
}

export const config = {
    matcher: [
        // Run on everything except Studio, Next internals, and common static files
        '/((?!studio|_next|.*\\.(?:json|xml|txt|ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf)).*)',
        '/(api|trpc)(.*)',
    ],
};
