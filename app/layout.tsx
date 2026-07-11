import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@/components/CookiebotBanner";
import GoogleAnalyticsConsent from "@/components/GoogleAnalyticsConsent";
import {
  getRobotsMetadata,
  shouldLoadProductionTracking,
} from "@1sp/utils/deployment-tier";
import { getMetadataBaseUrl } from "@1sp/utils/site-url";
import { SITE_BRAND } from "@1sp/site-config";

const LOAD_PRODUCTION_TRACKING = shouldLoadProductionTracking();

const aspekta = localFont({
  src: [
    { path: "./fonts/AspektaVF.woff2", style: "normal" },
    { path: "./fonts/AspektaVF.ttf", style: "normal" },
  ],
  variable: "--font-aspekta",
  display: "swap",
  weight: "50 1000",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: SITE_BRAND.seo.defaultTitle,
    template: "%s",
  },
  description: SITE_BRAND.seo.defaultDescription,
  openGraph: {
    type: "website",
    siteName: SITE_BRAND.name,
    locale: SITE_BRAND.defaultLocale,
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: LOAD_PRODUCTION_TRACKING && SITE_BRAND.seo.googleSiteVerification
    ? { google: SITE_BRAND.seo.googleSiteVerification }
    : undefined,
  robots: getRobotsMetadata(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${aspekta.variable} `}
      suppressHydrationWarning
    >
      <head>{LOAD_PRODUCTION_TRACKING ? <CookiebotBanner /> : null}</head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {LOAD_PRODUCTION_TRACKING && SITE_BRAND.tracking.googleAnalyticsId ? (
          <GoogleAnalyticsConsent
            measurementId={SITE_BRAND.tracking.googleAnalyticsId}
          />
        ) : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
