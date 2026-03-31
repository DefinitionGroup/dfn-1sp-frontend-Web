import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import CookiebotBanner from "@/components/CookiebotBanner";
import { getMetadataBaseUrl } from "@/lib/site-url";

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
    default: "1SP Agency | People-Powered Brand Engagement",
    template: "%s",
  },
  description:
    "1SP is a full-service agency specializing in brand engagement, experiential marketing, creative content, and talent management.",
  openGraph: {
    type: "website",
    siteName: "1SP Agency",
    locale: "en",
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
      className={`${aspekta.variable} `}
      suppressHydrationWarning
    >
      <head>
        <CookiebotBanner />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
