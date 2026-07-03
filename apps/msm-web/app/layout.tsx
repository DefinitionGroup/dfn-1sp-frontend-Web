import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@/components/CookiebotBanner";
import GoogleAnalyticsConsent from "@/components/GoogleAnalyticsConsent";
import { getMetadataBaseUrl } from "@1sp/utils/site-url";
import { getSiteConfig } from "@1sp/site-config";

const MSM_SITE = getSiteConfig("msmWeb");
const GOOGLE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MSM_GOOGLE_MEASUREMENT_ID;

const cooperHewitt = localFont({
  src: [
    { path: "./fonts/CooperHewitt-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/CooperHewitt-Book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CooperHewitt-BookItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/CooperHewitt-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/CooperHewitt-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/CooperHewitt-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cooper-hewitt",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
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
      className={`dark ${cooperHewitt.variable} `}
      suppressHydrationWarning
    >
      <head>
        <CookiebotBanner />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {GOOGLE_MEASUREMENT_ID ? (
          <GoogleAnalyticsConsent measurementId={GOOGLE_MEASUREMENT_ID} />
        ) : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
