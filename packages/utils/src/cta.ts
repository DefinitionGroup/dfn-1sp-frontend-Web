export type CtaLinkValue = {
  linkType?: string;
  type?: string;
  page?: unknown;
  externalUrl?: string;
  url?: string;
  href?: string;
  external?: string;
};

export type CtaValue = {
  text?: string;
  link?: CtaLinkValue | null;
  variant?: string;
};

export type CtaMiniValue = {
  heading?: string;
  paragraph?: string;
  buttonText?: string;
  link?: CtaLinkValue | null;
  variant?: string;
  buttonVariant?: string;
  alignment?: string;
};

export type RenderableCta = {
  text: string;
  href: string;
  variant: string;
};

export type RenderableCtaMini = {
  heading: string;
  paragraph: string;
  buttonText: string;
  href: string;
  variant?: string;
  alignment?: string;
};

function normalizedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveCtaLink(link?: CtaLinkValue | null): string {
  if (!link) return "";

  const linkType = link.linkType || link.type;
  const page = link.page;

  if (linkType === "internal" || (!linkType && page)) {
    let slug = "";
    if (typeof page === "string") {
      slug = page;
    } else if (page && typeof page === "object") {
      const value = page as Record<string, any>;
      slug =
        value.slug?.current ||
        value.current ||
        value.slug ||
        value.url ||
        "";
    }

    slug = normalizedText(slug);
    if (!slug) return "";
    return slug.startsWith("/") ? slug : `/${slug}`;
  }

  return normalizedText(
    link.externalUrl || link.url || link.href || link.external,
  );
}

export function getRenderableCta(value?: CtaValue | null): RenderableCta | null {
  const text = normalizedText(value?.text);
  const href = resolveCtaLink(value?.link);
  if (!text || !href || href === "#") return null;

  return {
    text,
    href,
    variant: normalizedText(value?.variant) || "default",
  };
}

export function getRenderableCtaMini(
  value?: CtaMiniValue | null,
): RenderableCtaMini | null {
  const heading = normalizedText(value?.heading);
  const buttonText = normalizedText(value?.buttonText);
  const href = resolveCtaLink(value?.link);
  if (!buttonText || !href || href === "#") return null;

  const variant = normalizedText(value?.variant || value?.buttonVariant);
  const alignment = normalizedText(value?.alignment);

  return {
    heading,
    paragraph: normalizedText(value?.paragraph),
    buttonText,
    href,
    ...(variant ? { variant } : {}),
    ...(alignment ? { alignment } : {}),
  };
}
