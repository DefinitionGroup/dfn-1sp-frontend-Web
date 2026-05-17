import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@/components/CookiebotBanner";
import GoogleAnalyticsConsent from "@/components/GoogleAnalyticsConsent";
import { getMetadataBaseUrl } from "@/lib/site-url";
import { SITE_BRAND } from "@/lib/site-config";

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
  verification: SITE_BRAND.seo.googleSiteVerification
    ? { google: SITE_BRAND.seo.googleSiteVerification }
    : undefined,
  robots: {
    index: true,
    follow: true,
  },
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
      <head>
        <CookiebotBanner />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {SITE_BRAND.tracking.googleAnalyticsId ? (
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
