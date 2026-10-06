import type {PageMetadata} from '@1sp/sanity-types';
import {msmCanonicalUrl} from './site-url';

export type MsmSeoDocument = {
  _id: string;
  _type: 'page' | 'caseStudy' | 'msmUnit' | 'person';
  language?: string;
  slug?: string;
  isHomepage?: boolean;
  _updatedAt?: string;
  metadata?: PageMetadata;
};
export type MsmTranslation = {ids: string[]};

export const MSM_SEO_INVENTORY_QUERY = `{
  "documents": *[!(_id in path("drafts.**")) && language in ["en", "de"] && (
    (_type == "page" && channel == "msmWeb" && defined(slug.current)) ||
    (_type == "caseStudy" && "msmWeb" in channel && isPublished == true && defined(slug.current)) ||
    (_type == "msmUnit" && isActive != false && defined(slug.current)) ||
    (_type == "person" && "msmWeb" in channel && defined(siteContent[channel == "msmWeb"][0].slug.current))
  )]{_id, _type, _updatedAt, language, isHomepage,
    "slug": select(_type == "person" => siteContent[channel == "msmWeb"][0].slug.current, slug.current),
    "metadata": select(_type in ["caseStudy", "person"] => siteContent[channel == "msmWeb"][0].seo, metadata)
  },
  "translations": *[_type == "translation.metadata"]{"ids": translations[].value._ref}
}`;

export function msmSeoPath(document: MsmSeoDocument): string {
  if (document._type === 'page') return document.isHomepage ? '' : document.slug || '';
  const prefix = {caseStudy: 'cases', msmUnit: 'units', person: 'people'}[document._type];
  return `${prefix}/${document.slug}`;
}

export function buildMsmSeoInventory(documents: MsmSeoDocument[], translations: MsmTranslation[]) {
  const routes = documents.map(document => ({
    ...document, id: document._id, path: msmSeoPath(document),
    url: msmCanonicalUrl(document.language || 'en', msmSeoPath(document)),
    indexable: document.metadata?.noIndex !== true,
    sitemap: document.metadata?.noIndex !== true && document.metadata?.excludeFromSitemap !== true,
    languages: undefined as Record<string, string> | undefined,
  }));
  for (const group of translations) {
    const members = routes.filter(route => group.ids.includes(route.id) && route.indexable);
    if (members.length < 2 || new Set(members.map(route => route._type)).size !== 1 || new Set(members.map(route => route.language)).size !== members.length) continue;
    const languages = Object.fromEntries(members.map(route => [route.language!, route.url]));
    for (const member of members) member.languages = languages;
  }
  return routes;
}
