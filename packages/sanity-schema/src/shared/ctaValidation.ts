type LinkValue = {
  linkType?: string;
  type?: string;
  page?: unknown;
  externalUrl?: string;
  url?: string;
  href?: string;
};

type CtaValue = {
  text?: string;
  link?: LinkValue;
};

type CtaMiniValue = {
  heading?: string;
  paragraph?: string;
  buttonText?: string;
  link?: LinkValue;
};

type ValidationOptions = {
  enabled?: boolean;
};

function normalizedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasPageDestination(page: unknown): boolean {
  if (typeof page === "string") return normalizedText(page).length > 0;
  if (!page || typeof page !== "object") return false;

  const value = page as Record<string, any>;
  return Boolean(
    normalizedText(value._ref) ||
      normalizedText(value.slug?.current) ||
      normalizedText(value.current) ||
      normalizedText(value.slug) ||
      normalizedText(value.url),
  );
}

function hasExternalDestination(link?: LinkValue): boolean {
  return Boolean(
    normalizedText(link?.externalUrl) ||
      normalizedText(link?.url) ||
      normalizedText(link?.href),
  );
}

function hasLinkIntent(link?: LinkValue): boolean {
  return Boolean(
    hasPageDestination(link?.page) || hasExternalDestination(link),
  );
}

function hasValidDestination(link?: LinkValue): boolean {
  if (!link) return false;

  const linkType = link.linkType || link.type;
  if (linkType === "internal") return hasPageDestination(link.page);
  if (linkType === "external") return hasExternalDestination(link);

  return hasPageDestination(link.page) || hasExternalDestination(link);
}

export function validateOptionalCta(
  value?: unknown,
  options: ValidationOptions = {},
): true | string {
  if (options.enabled === false) return true;

  const cta = value as CtaValue | undefined;
  const text = normalizedText(cta?.text);
  const hasContent = Boolean(text || hasLinkIntent(cta?.link));
  if (!hasContent) return true;

  if (!text) return "Add button text or clear the CTA.";
  if (text.length > 80) return "Button text must be 80 characters or fewer.";
  if (!hasValidDestination(cta?.link)) {
    return "Select a valid internal page or external URL, or clear the CTA.";
  }

  return true;
}

export function validateOptionalCtaMini(
  value?: unknown,
  options: ValidationOptions = {},
): true | string {
  if (options.enabled === false) return true;

  const cta = value as CtaMiniValue | undefined;
  const heading = normalizedText(cta?.heading);
  const paragraph = normalizedText(cta?.paragraph);
  const buttonText = normalizedText(cta?.buttonText);
  const hasContent = Boolean(
    heading || paragraph || buttonText || hasLinkIntent(cta?.link),
  );
  if (!hasContent) return true;

  if (!heading) return "Add a CTA heading or clear the CTA.";
  if (heading.length > 80) return "CTA heading must be 80 characters or fewer.";
  if (!buttonText) return "Add button text or clear the CTA.";
  if (buttonText.length > 80) {
    return "Button text must be 80 characters or fewer.";
  }
  if (!hasValidDestination(cta?.link)) {
    return "Select a valid internal page or external URL, or clear the CTA.";
  }

  return true;
}
