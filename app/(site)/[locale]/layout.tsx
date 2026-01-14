import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { StegaErrorHandler } from "@/components/StegaErrorHandler";
import { TransitionLoader } from "@/components/TransitionLoader";

// Removed localFont imports and variables — font classes should be applied in root layout

import NoiseOverlay from "@/components/ui/NoiseOverlay";
import CustomCursor from "@/components/ui/CustomCursor";

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

  return (
    <>
      <NoiseOverlay />
      <CustomCursor />
      <TransitionLoader />
      {children}
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
