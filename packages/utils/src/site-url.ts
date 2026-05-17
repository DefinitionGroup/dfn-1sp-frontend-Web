const DEFAULT_CANONICAL_SITE_URL = "https://www.1sp.agency";
const DEFAULT_LOCAL_DEV_URL = "http://localhost:3000";

function normalizeUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export const CANONICAL_SITE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
  DEFAULT_CANONICAL_SITE_URL,
);

export function getMetadataBaseUrl(): URL {
  return new URL(CANONICAL_SITE_URL);
}

export function getRevalidationBaseUrl(): string {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    DEFAULT_LOCAL_DEV_URL,
  );
}
