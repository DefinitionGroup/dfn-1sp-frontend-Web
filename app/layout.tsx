import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ViewTransitions } from 'next-view-transitions'
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
  title: "Rotpunkt Küchen AI Image Generator",
  description: "Generate your dream kitchen images with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${aspekta.variable} `}
        suppressHydrationWarning
      >      
      
      <head>
   
     
      </head>
        <body className="antialiased" suppressHydrationWarning>
          {children} <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
