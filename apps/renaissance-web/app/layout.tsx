import localFont from "next/font/local";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@renaissance/components/CookiebotBanner";
import GoogleAnalyticsConsent from "@renaissance/components/GoogleAnalyticsConsent";
import {
  shouldLoadProductionTracking,
} from "@1sp/utils/deployment-tier";
import { isRenaissancePublic, renaissanceRobotsMetadata } from "@renaissance/lib/deployment";
import { getMetadataBaseUrl } from "@1sp/utils/site-url";
import { getSiteConfig } from "@1sp/site-config";

const RENAISSANCE_SITE = getSiteConfig("renaissanceWeb");
const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_RENAISSANCE_GOOGLE_MEASUREMENT_ID;
const LOAD_PRODUCTION_TRACKING = isRenaissancePublic() && shouldLoadProductionTracking();

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

// The 1SP face, used only inside embedded 1SP component groups. Not
// preloaded: pages without a 1SP group never request the file.
const aspekta = localFont({
  src: [
    { path: "./fonts/AspektaVF.woff2", style: "normal" },
    { path: "./fonts/AspektaVF.ttf", style: "normal" },
  ],
  variable: "--font-aspekta-source",
  display: "swap",
  weight: "50 1000",
  preload: false,
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
  robots: renaissanceRobotsMetadata(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${aspekta.variable} ${geistMono.variable}`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>{LOAD_PRODUCTION_TRACKING ? <CookiebotBanner /> : null}</head>
      <body className="antialiased" suppressHydrationWarning>
        <span
          hidden
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html:
              "<!-- RENAISSANCE-DESIGN-CONTRACT seed=wireframe-v2-taster-v4 | THESIS: A bold editorial games-communications world where Renaissance is the unmistakable lead signal. | OWN-WORLD: Petrol, teal, sand and white; compressed display type; diagonal light streaks; full-bleed game imagery. | STORY: Positioning, campaign proof, trusted company, integrated services, people, origin, global reach, direct contact. | FIRST VIEWPORT: Wordmark, one headline, one support statement, two actions and one dominant game world only. | FORM: Broad image planes, hard diagonals, restrained radii, no decorative card grid and no detached hero badges. | FINISH: Deliberate motion hierarchy, responsive composition, accessible contrast and reduced-motion support. -->",
          }}
        />
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
