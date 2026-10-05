import { resolveLink } from "@1sp/utils/cloudinary";
import type { CTA } from "@1sp/sanity-types";

// Once a case has a connected person, its contact section replaces legacy
// mail/contact CTAs. Download, campaign and other project links remain visible.
export function isCaseContactCta(block: { cta?: CTA }) {
  const target = resolveLink(block.cta?.link);
  return /^mailto:/i.test(target) || /^\/(?:en\/|de\/)?contact\/?(?:[?#].*)?$/.test(target);
}
