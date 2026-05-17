import { NextResponse } from "next/server";
import type { NextResponse as NextResponseType } from "next/server";
import type { NextRequest } from "next/server";
import { resolveChannelFromHost } from "@/lib/site-config";

/**
 * Middleware — locale-free public URLs + (optional) host → channel cookie
 *
 * Public URLs have no locale prefix: `/about`, `/cases/my-case`.
 * Internally, Next.js routes still live under `[locale]`, so middleware
 * rewrites `/about` → `/en/about` behind the scenes.
 *
 * Old `/en/...` URLs get 301-redirected to the clean version for SEO.
 *
 * If `NEXT_PUBLIC_HOST_CHANNEL_MAP` is configured, middleware writes a
 * `channel` cookie based on the incoming Host header. This is intended for
 * multi-host deployments (one Vercel project serving several brands). For
 * one-deployment-per-brand setups, leave the map empty and pin the channel
 * via `NEXT_PUBLIC_CHANNEL` instead — middleware then runs as a pure
 * pass-through for channel.
 */
export default function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    const locale = "en";

    const applyChannelCookie = (response: NextResponseType) => {
        const channel = resolveChannelFromHost(req.headers.get("host"));
        if (channel && req.cookies.get("channel")?.value !== channel) {
            response.cookies.set("channel", channel, {
                path: "/",
                sameSite: "lax",
            });
        }
        return response;
    };

    // Skip locale logic for API, TRPC, and Studio presentation routes
    const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);
    const isStudioPresentation = pathname === '/studio/presentation' || /^\/[a-z]{2}(?:-[A-Z]{2})?\/studio\/presentation(\/|$)/.test(pathname);
    if (pathname.startsWith('/api') || pathname.startsWith('/trpc') || localePrefixedApiOrTrpc || isStudioPresentation) {
        return applyChannelCookie(NextResponse.next());
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
        return applyChannelCookie(NextResponse.redirect(url, 301));
    }

    // Rewrite clean URLs → internal [locale] routes
    // e.g. / → /en, /about → /en/about, /cases/foo → /en/cases/foo
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    url.search = search;

    return applyChannelCookie(NextResponse.rewrite(url));
}

export const config = {
    matcher: [
        '/((?!studio|_next|.*\\.(?:json|xml|txt|ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf)).*)',
        '/(api|trpc)(.*)',
    ],
};
