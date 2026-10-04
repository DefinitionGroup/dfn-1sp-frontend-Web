import {JsonLdScript as SharedJsonLdScript, CANONICAL_URL as SHARED_CANONICAL_URL} from '@/lib/structured-data';
import {buildMsmMetadata} from './metadata';
import {MSM_CANONICAL_URL, msmPath} from './site-url';

export const CANONICAL_URL = MSM_CANONICAL_URL;

/** Scope the shared generators' website identities and routes to MSM. */
export function scopeMsmStructuredData(data: unknown, locale = 'en'): unknown {
  if (typeof data === 'string') {
    const origin = [SHARED_CANONICAL_URL, MSM_CANONICAL_URL].find(base => data === base || data.startsWith(`${base}/`) || data.startsWith(`${base}#`));
    if (!origin) return data;
    const suffix = data.slice(origin.length);
    // Website/organization identifiers are stable across translations.
    if (/^\/?#(?:organization|website|logo)(?:$|[-/])/.test(suffix)) return `${MSM_CANONICAL_URL}${suffix}`;
    if (suffix.startsWith('/de/') || suffix === '/de') return `${MSM_CANONICAL_URL}${suffix}`;
    return `${MSM_CANONICAL_URL}${msmPath(locale, suffix)}`;
  }
  if (Array.isArray(data)) return data.map(item => scopeMsmStructuredData(item, locale));
  if (data && typeof data === 'object') {
    const node = data as Record<string, unknown>;
    const result = Object.fromEntries(Object.entries(node).map(([key, value]) => [key, scopeMsmStructuredData(value, locale)]));
    const ownIdentity = [SHARED_CANONICAL_URL, `${SHARED_CANONICAL_URL}/#organization`, `${SHARED_CANONICAL_URL}/#website`].includes(String(node['@id']));
    if (ownIdentity && node.name === '1SP Agency') {
      result.name = 'MSM.digital';
      if (node.description) result.description = buildMsmMetadata({locale}).description;
    }
    return result;
  }
  return data;
}

export function JsonLdScript({data, locale = 'en'}: {data: Record<string, unknown> | Record<string, unknown>[]; locale?: string}) {
  return <SharedJsonLdScript data={scopeMsmStructuredData(data, locale) as typeof data} />;
}
