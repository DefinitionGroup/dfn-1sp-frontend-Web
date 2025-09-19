// app/(site)/[locale]/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
import { NAVBAR_QUERY, FOOTER_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/live";
import { DisableDraftMode } from "@/components/DisableDraftMode";

// NOTE: globals.css is already loaded by root layout; remove this import here.
// If you really need it here, the correct path would be: ../../globals.css

const aspekta = localFont({
  src: [
    { path: "../../fonts/AspektaVF.woff2", style: "normal" },
    { path: "../../fonts/AspektaVF.ttf", style: "normal" },
  ],
  variable: "--font-aspekta",
  display: "swap",
  weight: "50 1000",
});

const nyghtserif = localFont({
  src: [{ path: "../../fonts/NyghtSerif-Regular.woff2", style: "normal" }],
  variable: "--font-nyghtserif",
  display: "swap",
  weight: "400 700",
});

export const metadata: Metadata = {
  title: "1SP Agency",
  description:
    "1SP is a full-service digital agency specializing in web design, development, and digital marketing solutions.",
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const { data: navbar } = await sanityFetch({ query: NAVBAR_QUERY });
  const { data: footer } = await sanityFetch({ query: FOOTER_QUERY });

  return (
    <div className={`${aspekta.variable} ${nyghtserif.variable}`}>
      {/* {navbar && <Navbar {...navbar} />} */}
      {children}
      {/* {footer && <Footer data={footer} />} */}

      <SanityLive />
      {isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </div>
  );
}
