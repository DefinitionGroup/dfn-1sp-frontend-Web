import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { StegaErrorHandler } from "@/components/StegaErrorHandler";

/**
 * Locale-aware layout
 *
 * Sets the `lang` attribute on the `<html>` element dynamically based on the
 * URL locale parameter. This is critical for:
 * - SEO: Search engines use `lang` to determine page language
 * - Accessibility: Screen readers use `lang` for pronunciation
 * - i18n: Browsers use `lang` for spell-checking and font selection
 *
 * Note: We override the `<html>` lang attribute via a script because the root
 * layout renders the `<html>` tag and nested layouts cannot re-render it.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { isEnabled } = await draftMode();
  const { locale } = await params;

  return (
    <>
      {/* Dynamically set lang attribute based on current locale */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale || "en"}";`,
        }}
      />
      {children}
      <StegaErrorHandler />
      {isEnabled && (
        <>
          <SanityLive />
          <VisualEditing />
          <DisableDraftMode />
        </>
      )}
    </>
  );
}
