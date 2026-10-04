import type {Metadata} from 'next';
import type {PageMetadata} from '@1sp/sanity-types';
import {stegaClean} from '@sanity/client/stega';
import {resolveImageUrl} from '@1sp/sanity-queries/image';
import {assetUrl, cloudinaryPosterUrl, isVideoAsset} from '@1sp/utils/cloudinary';
import {getRobotsMetadata} from '@1sp/utils/deployment-tier';
import {MSM_CANONICAL_URL, msmPath} from './site-url';

const descriptions = {
  en: 'MSM.digital brings together communications, channel marketing, AR/VR and technology services for gaming, tech and consumer electronics brands.',
  de: 'MSM.digital vereint Kommunikation, Channel Marketing, AR/VR und Technologie für Marken aus Gaming, Tech und Consumer Electronics.',
};

// Existing MSM homepage media; social crawlers receive a still frame, not video.
export const MSM_DEFAULT_SHARING_IMAGE = 'https://res.cloudinary.com/dsu07dnes/video/upload/so_0,w_1200,h_630,c_fill,g_auto/v1788796799/MSM_VIDEO_WIP_ndnprm.jpg';

function sharingImage(source: unknown): string | undefined {
  if (!source) return undefined;
  const asset = typeof source === 'object' ? (source as {asset?: object}).asset || source : undefined;
  const url = typeof source === 'string' ? source : assetUrl(asset);
  const image = url && isVideoAsset(asset, url) ? cloudinaryPosterUrl(url, {maxWidth: 1200}) : url;
  if (!image && !(asset && typeof asset === 'object' && '_ref' in asset)) return undefined;
  try {
    return resolveImageUrl(image ? {secure_url: image} : source, {width: 1200, height: 630});
  } catch {
    return undefined;
  }
}

export function buildMsmMetadata({
  locale = 'en', path = '', title, description, metadata, fallbackImage,
  type = 'website', publishedAt,
}: {
  locale?: string;
  path?: string;
  title?: string;
  description?: string;
  metadata?: PageMetadata | null;
  fallbackImage?: unknown;
  type?: 'website' | 'article' | 'profile';
  publishedAt?: string;
}): Metadata {
  const seo = stegaClean(metadata ?? {});
  const rawTitle = (seo.title || stegaClean(title || '') || 'MSM.digital').trim();
  const pageTitle = /MSM(?:\.digital)?/i.test(rawTitle) ? rawTitle : `${rawTitle} | MSM.digital`;
  const pageDescription = seo.description?.trim() || stegaClean(description || '').trim() || descriptions[locale === 'de' ? 'de' : 'en'];
  const socialTitle = seo.openGraphTitle?.trim() || pageTitle;
  const socialDescription = seo.openGraphDescription?.trim() || pageDescription;
  const imageUrl = [seo.openGraphImage, seo.image, stegaClean(fallbackImage)].map(sharingImage).find(Boolean) || MSM_DEFAULT_SHARING_IMAGE;
  const images = [{url: imageUrl, width: 1200, height: 630, alt: socialTitle}];
  const canonical = `${MSM_CANONICAL_URL}${msmPath(locale, stegaClean(path))}`;
  const robots = getRobotsMetadata();

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: seo.keywords,
    alternates: {canonical},
    robots: seo.noIndex ? {...robots, index: false} : robots,
    openGraph: {
      title: socialTitle, description: socialDescription, siteName: 'MSM.digital',
      url: canonical, locale: locale === 'de' ? 'de_DE' : 'en_US', type, images,
      ...(type === 'article' && publishedAt ? {publishedTime: stegaClean(publishedAt)} : {}),
    },
    twitter: {card: 'summary_large_image', title: socialTitle, description: socialDescription, images: images.map(image => image.url)},
  };
}
