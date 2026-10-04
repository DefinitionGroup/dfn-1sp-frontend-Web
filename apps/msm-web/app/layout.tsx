import {buildMsmMetadata} from '@msm/lib/metadata';
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@/components/CookiebotBanner";
import GoogleAnalyticsConsent from "@/components/GoogleAnalyticsConsent";
import {
  shouldLoadProductionTracking,
} from "@1sp/utils/deployment-tier";
import { MSM_CANONICAL_URL } from "@msm/lib/site-url";

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
  ...buildMsmMetadata({title: 'MSM.digital'}),
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
