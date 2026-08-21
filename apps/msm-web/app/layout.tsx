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
import { getSiteConfig } from "@1sp/site-config";
import { MSM_CANONICAL_URL } from "@msm/lib/site-url";

const MSM_SITE = getSiteConfig("msmWeb");
const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MSM_GOOGLE_MEASUREMENT_ID;
const LOAD_PRODUCTION_TRACKING = shouldLoadProductionTracking();

// Back to AspektaVF (variable font, shared identity with 1SP) — Cooper
// Hewitt was trialed July 2026 and reverted per Martin's font decision.
const aspekta = localFont({
  src: [
    { path: "./fonts/AspektaVF.woff2", style: "normal" },
    { path: "./fonts/AspektaVF.ttf", style: "normal" },
  ],
  variable: "--font-aspekta-vf",
  display: "swap",
  weight: "50 1000",
});

export const metadata: Metadata = {
  metadataBase: new URL(MSM_CANONICAL_URL),
  title: {
    default: MSM_SITE.seo.defaultTitle,
    template: "%s",
  },
  description: MSM_SITE.seo.defaultDescription,
  openGraph: {
    type: "website",
    siteName: MSM_SITE.name,
    locale: MSM_SITE.defaultLocale,
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
      className={`dark ${aspekta.variable} `}
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
