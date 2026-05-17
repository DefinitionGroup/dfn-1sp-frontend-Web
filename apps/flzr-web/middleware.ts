import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_LOCALE = "en";

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const localePrefixedApiOrTrpc = /^\/[a-z]{2}(?:-[A-Z]{2})?\/(api|trpc)(\/|$)/.test(pathname);

  if (pathname.startsWith("/api") || pathname.startsWith("/trpc") || localePrefixedApiOrTrpc) {
    return NextResponse.next();
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
