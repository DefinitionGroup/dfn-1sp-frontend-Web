import type {MetadataRoute} from 'next';
import {getMsmSeoInventory} from '@msm/lib/seo-inventory';

/** One published catalogue drives canonicals, translations and sitemap. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getMsmSeoInventory();
  const unique = new Map(routes.filter(route => route.sitemap).map(route => [route.url, route]));
  return [...unique.values()].map(route => ({
    url: route.url,
    ...(route._updatedAt ? {lastModified: new Date(route._updatedAt)} : {}),
    changeFrequency: route._type === 'page' ? 'weekly' : 'monthly',
    priority: route.isHomepage ? 1 : route._type === 'page' ? 0.8 : 0.7,
    ...(route.languages ? {alternates: {languages: route.languages}} : {}),
  }));
}
