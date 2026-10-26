import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteConfig } from "@1sp/site-config";
import { getMetadataBaseUrl } from "@1sp/utils/site-url";
import { studioco2RobotsMetadata } from "@studioco2/lib/deployment";

const SITE = getSiteConfig("studioco2Web");

// Aspekta is the general sans-serif; Pixel Code Thin (100) is the pixel UI face.
const aspekta = localFont({
  src: "./fonts/AspektaVF.woff2",
  variable: "--font-aspekta",
  weight: "100 900",
  display: "swap",
});

const pixelCode = localFont({
  src: "./fonts/PixelCode-Thin.woff2",
  variable: "--font-pixel",
  weight: "100",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: SITE.seo.defaultTitle,
  description: SITE.seo.defaultDescription,
  robots: studioco2RobotsMetadata(),
};

export const viewport: Viewport = {
  themeColor: "#eeefed",
};

// Applies the OS theme before first paint. SiteProvider follows it after
// hydration and owns the theme once the visitor picks one in the header.
const themeScript = `try{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${aspekta.variable} ${pixelCode.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
