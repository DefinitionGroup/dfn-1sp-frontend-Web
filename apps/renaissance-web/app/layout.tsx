import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@renaissance/components/CookiebotBanner";
import GoogleAnalyticsConsent from "@renaissance/components/GoogleAnalyticsConsent";
import {
  getRobotsMetadata,
  shouldLoadProductionTracking,
} from "@1sp/utils/deployment-tier";
import { getMetadataBaseUrl } from "@1sp/utils/site-url";
import { getSiteConfig } from "@1sp/site-config";

const RENAISSANCE_SITE = getSiteConfig("renaissanceWeb");
const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_RENAISSANCE_GOOGLE_MEASUREMENT_ID;
const LOAD_PRODUCTION_TRACKING = shouldLoadProductionTracking();

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: RENAISSANCE_SITE.seo.defaultTitle,
    template: "%s",
  },
  description: RENAISSANCE_SITE.seo.defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: RENAISSANCE_SITE.name,
    locale: RENAISSANCE_SITE.defaultLocale,
  },
  twitter: {
    card: "summary_large_image",
  },
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
      className={`${ibmPlexSans.variable} ${geistMono.variable}`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>{LOAD_PRODUCTION_TRACKING ? <CookiebotBanner /> : null}</head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {LOAD_PRODUCTION_TRACKING && GOOGLE_MEASUREMENT_ID ? (
          <GoogleAnalyticsConsent measurementId={GOOGLE_MEASUREMENT_ID} />
        ) : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
