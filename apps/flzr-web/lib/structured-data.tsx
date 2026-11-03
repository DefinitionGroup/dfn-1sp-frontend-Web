import { getSiteConfig } from "@1sp/site-config";
import {
  CANONICAL_URL,
  JsonLdScript as SharedJsonLdScript,
  SITE_DESCRIPTION as SHARED_SITE_DESCRIPTION,
  SITE_NAME as SHARED_SITE_NAME,
} from "@/lib/structured-data";

const FLZR_NAME = getSiteConfig("flizrWeb").name;

function isOwnIdentity(id: unknown): boolean {
  return typeof id === "string" && (id === CANONICAL_URL || id.startsWith(`${CANONICAL_URL}/#`));
}

/**
 * The shared generators describe 1SP. On FLZR's own identity nodes
 * (organization, website, logo, homepage, local business) the 1SP name
 * becomes FLZR's and the 1SP description is dropped rather than repeated.
 */
export function scopeFlzrStructuredData(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(scopeFlzrStructuredData);
  if (!data || typeof data !== "object") return data;

  const node = data as Record<string, unknown>;
  const result: Record<string, unknown> = Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, scopeFlzrStructuredData(value)]),
  );
  if (!isOwnIdentity(node["@id"])) return result;

  for (const key of ["name", "caption"]) {
    const value = result[key];
    if (typeof value === "string" && value.startsWith(SHARED_SITE_NAME)) {
      result[key] = `${FLZR_NAME}${value.slice(SHARED_SITE_NAME.length)}`;
    }
  }
  if (result.description === SHARED_SITE_DESCRIPTION) delete result.description;
  return result;
}

export function JsonLdScript({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <SharedJsonLdScript data={scopeFlzrStructuredData(data) as typeof data} />;
}
