import type {Metadata} from 'next';
import type {PageMetadata} from '@1sp/sanity-types';
import {stegaClean} from '@sanity/client/stega';
import {resolveImageUrl} from '@1sp/sanity-queries/image';
import {assetUrl, cloudinaryPosterUrl, isVideoAsset} from '@1sp/utils/cloudinary';
import {getRobotsMetadata} from '@1sp/utils/deployment-tier';
import {msmCanonicalUrl} from './site-url';

const descriptions = {
  en: 'MSM.digital brings together communications, channel marketing, AR/VR and technology services for gaming, tech and consumer electronics brands.',
  de: 'MSM.digital vereint Kommunikation, Channel Marketing, AR/VR und Technologie für Marken aus Gaming, Tech und Consumer Electronics.',
};

// Existing MSM homepage media; social crawlers receive a still frame, not video.
export const MSM_DEFAULT_SHARING_IMAGE = 'https://res.cloudinary.com/dsu07dnes/video/upload/so_0,w_1200,h_630,c_fill,g_auto/v1788796799/MSM_VIDEO_WIP_ndnprm.jpg';

export function sharingImage(source: unknown): string | undefined {
  if (!source) return undefined;
  const asset = typeof source === 'object' ? (source as {asset?: object}).asset || source : undefined;
  const url = typeof source === 'string' ? source : assetUrl(asset);
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return undefined;
    } catch { return undefined; }
  }
  const image = url && isVideoAsset(asset, url) ? cloudinaryPosterUrl(url, {maxWidth: 1200}) : url;
  if (!image && !(asset && typeof asset === 'object' && '_ref' in asset)) return undefined;
  try {
    return resolveImageUrl(image ? {secure_url: image} : source, {width: 1200, height: 630});
  } catch {
    return undefined;
  }
}

export type MsmMetadataInput = {
  locale?: string;
  path?: string;
  title?: string;
  description?: string;
  metadata?: PageMetadata | null;
  fallbackImage?: unknown;
  fallbackImageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  publishedAt?: string;
  languages?: Record<string, string>;
};

export function buildMsmMetadata({
  locale = 'en', path = '', title, description, metadata, fallbackImage,
  fallbackImageAlt, type = 'website', publishedAt, languages,
}: MsmMetadataInput): Metadata {
  const seo = stegaClean(metadata ?? {});
  const rawTitle = seo.title?.trim() || stegaClean(title || '').trim() || 'MSM.digital';
  const pageTitle = /MSM(?:\.digital)?/i.test(rawTitle) ? rawTitle : `${rawTitle} | MSM.digital`;
  const pageDescription = seo.description?.trim() || stegaClean(description || '').trim() || descriptions[locale === 'de' ? 'de' : 'en'];
  const socialTitle = seo.openGraphTitle?.trim() || pageTitle;
  const socialDescription = seo.openGraphDescription?.trim() || pageDescription;
  const candidates = [
    {url: sharingImage(seo.openGraphImage), alt: (seo.openGraphImage as {alt?: string} | undefined)?.alt},
    {url: sharingImage(seo.image), alt: (seo.image as {alt?: string} | undefined)?.alt},
    {url: sharingImage(stegaClean(fallbackImage)), alt: stegaClean(fallbackImageAlt || '')},
    {url: MSM_DEFAULT_SHARING_IMAGE, alt: 'MSM.digital'},
  ];
  const selected = candidates.find(image => image.url)!;
  const images = [{url: selected.url!, width: 1200, height: 630, alt: selected.alt?.trim() || socialTitle}];
  const canonical = msmCanonicalUrl(locale, stegaClean(path));
  const robots = getRobotsMetadata();

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: seo.keywords,
    alternates: {canonical, ...(languages && Object.keys(languages).length > 1 ? {languages} : {})},
    robots: seo.noIndex ? {...robots, index: false} : robots,
    openGraph: {
      title: socialTitle, description: socialDescription, siteName: 'MSM.digital',
      url: canonical, locale: locale === 'de' ? 'de_DE' : 'en_US', type, images,
      ...(languages ? {alternateLocale: Object.keys(languages).filter(language => language !== locale).map(language => language === 'de' ? 'de_DE' : 'en_US')} : {}),
      ...(type === 'article' && publishedAt && Number.isFinite(Date.parse(publishedAt)) ? {publishedTime: stegaClean(publishedAt)} : {}),
    },
    twitter: {card: 'summary_large_image', title: socialTitle, description: socialDescription, images: images.map(image => ({url: image.url, alt: image.alt}))},
  };
}

/** Published CMS references supply reciprocal links only for actual translations. */
export async function buildMsmRouteMetadata(input: MsmMetadataInput & {documentId?: string}): Promise<Metadata> {
  const {getMsmSeoInventory} = await import('./seo-inventory');
  const inventory = await getMsmSeoInventory();
  const source = inventory.find(route => route.id === input.documentId?.replace(/^drafts\./, ''));
  return buildMsmMetadata({...input, languages: source?.languages});
}
