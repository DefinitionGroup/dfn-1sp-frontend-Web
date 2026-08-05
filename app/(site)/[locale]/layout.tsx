import { draftMode } from "next/headers";
import HtmlLangSetter from "@/components/HtmlLangSetter";
import AiContentDisclosure from "@/components/AiContentDisclosure";

/**
 * Locale-aware layout
 *
 * Sets the `lang` attribute on the `<html>` element dynamically based on the
 * URL locale parameter. This is critical for:
 * - SEO: Search engines use `lang` to determine page language
 * - Accessibility: Screen readers use `lang` for pronunciation
 * - i18n: Browsers use `lang` for spell-checking and font selection
 *
 * Note: We override the `<html>` lang attribute via HtmlLangSetter because the
 * root layout renders the `<html>` tag and nested layouts cannot re-render it.
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
  let diagnostics: React.ReactNode = null;
  if (process.env.NODE_ENV === "development") {
    const { default: SeoDiagnosticOverlay } = await import(
      "@/components/dev/SeoDiagnosticOverlay"
    );
    diagnostics = <SeoDiagnosticOverlay />;
  }

  let previewTools: React.ReactNode = null;
  if (isEnabled) {
    const [
      { VisualEditing },
      { SanityLive },
      { DisableDraftMode },
      { StegaErrorHandler },
    ] = await Promise.all([
      import("next-sanity/visual-editing"),
      import("@1sp/sanity-queries/live"),
      import("@/components/DisableDraftMode"),
      import("@/components/StegaErrorHandler"),
    ]);

    previewTools = (
      <>
        <StegaErrorHandler />
        <SanityLive />
        <VisualEditing />
        <DisableDraftMode />
      </>
    );
  }

  return (
    <>
      {/* Dynamically set lang attribute based on current locale */}
      <HtmlLangSetter locale={locale || "en"} />
      <AiContentDisclosure />
      {diagnostics}
      {children}
      {previewTools}
    </>
  );
}
