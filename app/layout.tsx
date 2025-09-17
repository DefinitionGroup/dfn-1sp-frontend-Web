import type { Metadata } from "next";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import FrontNavOverlay from "@/components/FrontNavOverlay2";
import HamburgerGradientMenu from "@/components/HamburgerGradientMenu";

const aspekta = localFont({
  src: [
    {
      path: "./fonts/AspektaVF.woff2",
      style: "normal",
    },
    {
      path: "./fonts/AspektaVF.ttf",
      style: "normal",
    },
  ],
  variable: "--font-aspekta",
  display: "swap",
  weight: "50 1000",
});

const nyghtserif = localFont({
  src: [
    {
      path: "./fonts/NyghtSerif-Regular.woff2",
      style: "normal",
    },
  ],
  variable: "--font-nyghtserif",
  display: "swap",
  weight: "400 700",
});
export const metadata: Metadata = {
  title: "1SP Agency",
  description:
    "1SP is a full-service digital agency specializing in web design, development, and digital marketing solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const diagnostic = process.env.NEXT_PUBLIC_DIAG === "1";
  return (
    <ViewTransitions>
      <html lang="en" className={`${aspekta.variable} ${nyghtserif.variable}`}>
        <body className={`antialiased ${diagnostic ? "dialog" : ""}`}>
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
/**
 *   <div className="block md:hidden">
            <HamburgerGradientMenu />
          </div>
         
          <div className="hidden md:block">
            <FrontNavOverlay />
          </div>
 */
