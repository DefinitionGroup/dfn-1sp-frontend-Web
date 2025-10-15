// app/(site)/[locale]/layout.tsx
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { StegaErrorHandler } from "@/components/StegaErrorHandler";
import SiteWrapper from "@/components/SiteWrapper";
import { cookies } from "next/headers";

// Removed localFont imports and variables — font classes should be applied in root layout

export const metadata: Metadata = {
  title: "1SP Agency",
  description:
    "1SP is a full-service digital agency specializing in web design, development, and digital marketing solutions.",
};

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { isEnabled } = await draftMode();
  const { locale } = await params;
  const cookieStore = await cookies();
  const channel = cookieStore.get("channel")?.value || "1spWeb";
  const language = locale || "en";

  return (
    <>
      <SiteWrapper channel={channel} language={language}>
        {children}
      </SiteWrapper>
      <SanityLive />
      <StegaErrorHandler />
      {isEnabled && (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  );
}
