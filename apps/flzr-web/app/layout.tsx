import localFont from "next/font/local";
import { Geist_Mono, PT_Sans } from "next/font/google";
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
import { getSiteConfig } from "@1sp/site-config";

const FLZR_SITE = getSiteConfig("flizrWeb");
const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FLZR_GOOGLE_MEASUREMENT_ID;
const LOAD_PRODUCTION_TRACKING = shouldLoadProductionTracking();

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const ptSans = PT_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-pt-sans",
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const aspekta = localFont({
  src: [
    { path: "./fonts/AspektaVF.woff2", style: "normal" },
    { path: "./fonts/AspektaVF.ttf", style: "normal" },
  ],
  variable: "--font-aspekta-source",
  display: "swap",
  weight: "50 1000",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: FLZR_SITE.seo.defaultTitle,
    template: "%s",
  },
  description: FLZR_SITE.seo.defaultDescription,
  openGraph: {
    type: "website",
    siteName: FLZR_SITE.name,
    locale: FLZR_SITE.defaultLocale,
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
      className={`${ptSans.variable} ${aspekta.variable} ${geistMono.variable}`}
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
