import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookiebotBanner from "@/components/CookiebotBanner";

const aspekta = localFont({
  src: [
    { path: "./fonts/AspektaVF.woff2", style: "normal" },
    { path: "./fonts/AspektaVF.ttf", style: "normal" },
  ],
  variable: "--font-aspekta",
  display: "swap",
  weight: "50 1000",
});

/**
 * Base URL for generating absolute URLs in metadata (OG images, canonicals).
 *
 * - In production:  uses NEXT_PUBLIC_VERCEL_URL (set by Vercel)
 * - In development: falls back to localhost
 */
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "1SP Agency | People-Powered Brand Engagement",
    template: "%s | 1SP Agency",
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
      className={`${aspekta.variable} `}
      suppressHydrationWarning
    >
      <head>
        <CookiebotBanner />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children} <SpeedInsights />
      </body>
    </html>
  );
}
