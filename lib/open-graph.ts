import { SITE_BRAND } from "@1sp/site-config";

/**
 * A page's `openGraph` replaces the root layout's instead of merging with it,
 * so every 1SP page spreads in the site name and its canonical path here.
 * Next.js resolves the path against `metadataBase` into an absolute og:url.
 */
export function openGraphIdentity(canonicalPath: string) {
  return {
    siteName: SITE_BRAND.name,
    url: canonicalPath,
  };
}
