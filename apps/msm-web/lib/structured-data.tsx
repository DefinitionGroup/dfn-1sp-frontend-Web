import {JsonLdScript as SharedJsonLdScript, CANONICAL_URL as SHARED_CANONICAL_URL} from '@/lib/structured-data';
import {buildMsmMetadata} from './metadata';
import {MSM_CANONICAL_URL, msmCanonicalUrl} from './site-url';
import type {Metadata} from 'next';

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
    return msmCanonicalUrl(locale, suffix);
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

export function alignMsmPageStructuredData(data: unknown, metadata: Metadata): unknown {
  if (Array.isArray(data)) return data.map(node => alignMsmPageStructuredData(node, metadata));
  if (!data || typeof data !== 'object') return data;
  const node = data as Record<string, unknown>;
  if (node['@graph']) return {...node, '@graph': alignMsmPageStructuredData(node['@graph'], metadata)};
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  if (!types.some(type => ['WebPage', 'CollectionPage', 'ContactPage', 'Article', 'ProfilePage'].includes(String(type)))) return data;
  const image = (metadata.openGraph as {images?: {url: string; alt?: string}[]})?.images?.[0];
  const url = String(metadata.alternates?.canonical || node.url || '');
  return {...node, url,
    ...(typeof node['@id'] === 'string' && node['@id'].endsWith('#webpage') ? {'@id': `${url}#webpage`} : {}),
    ...(types.includes('Article') ? {headline: metadata.title} : {name: metadata.title}),
    description: metadata.description,
    ...(image ? {image: {'@type': 'ImageObject', url: image.url, width: 1200, height: 630, caption: image.alt}} : {}),
  };
}

export function JsonLdScript({data, locale = 'en', metadata}: {data: Record<string, unknown> | Record<string, unknown>[]; locale?: string; metadata?: Metadata}) {
  const scoped = scopeMsmStructuredData(data, locale);
  return <SharedJsonLdScript data={(metadata ? alignMsmPageStructuredData(scoped, metadata) : scoped) as typeof data} />;
}
