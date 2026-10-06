type Seo = {title?: string; description?: string; image?: unknown; openGraphTitle?: string; openGraphDescription?: string; openGraphImage?: unknown};
type Edition = {_key: string; channel: string; title?: string; description?: string; hideDescription?: boolean; seo?: Seo; image?: unknown; mainImage?: unknown; mainVideo?: unknown; mediaMode?: string};
export type MsmMetadataDocument = {_type?: string; channel?: unknown; language?: string; title?: string; name?: string; fullname?: string; description?: string; position?: string; claim?: string; image?: unknown; mainImage?: unknown; mainVideo?: unknown; heroMedia?: unknown; heroImageSource?: string; metadata?: Seo; seo?: Seo; siteContent?: Edition[]};

function validImage(source: unknown): boolean {
  if (!source) return false;
  if (typeof source === 'object') {
    const image = source as {asset?: unknown; secure_url?: string; url?: string; _ref?: string};
    if (image.asset) return validImage(image.asset);
    if (image._ref) return /^image-/.test(image._ref);
    return validImage(image.secure_url || image.url);
  }
  if (typeof source !== 'string') return false;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

/** Match the route inputs and the case query's null-only inheritance. */
export function msmMetadataPreview(document: MsmMetadataDocument | undefined, key: string | undefined, seo: Seo) {
  const edition = document?.siteContent?.find(item => item._key === key);
  const defaultDescription = document?.language === 'de'
    ? 'MSM.digital vereint Kommunikation, Channel Marketing, AR/VR und Technologie für Marken aus Gaming, Tech und Consumer Electronics.'
    : 'MSM.digital brings together communications, channel marketing, AR/VR and technology services for gaming, tech and consumer electronics brands.';
  let fallbackTitle = document?.title;
  let fallbackDescription: string | undefined;
  let resolvedTitle = seo.title;
  let resolvedDescription = seo.description;
  let media: unknown;
  if (document?._type === 'caseStudy') {
    fallbackTitle = edition?.title ?? document.title;
    fallbackDescription = edition?.hideDescription ? '' : edition?.description ?? document.description;
    resolvedTitle = seo.title ?? edition?.title ?? document.seo?.title ?? document.title;
    resolvedDescription = seo.description ?? (edition?.hideDescription ? '' : edition?.description ?? document.seo?.description ?? document.description);
    media = edition?.mediaMode === 'custom' ? edition.mainImage || edition.mainVideo : document.mainImage || document.mainVideo;
  } else if (document?._type === 'person') {
    fallbackTitle = document.fullname || document.name;
    fallbackDescription = document.position;
    media = edition?.image ?? document.image;
  } else if (document?._type === 'msmUnit') {
    fallbackTitle = document.name;
    fallbackDescription = document.claim;
    media = document.image || document.heroMedia || document.heroImageSource;
  }
  const rawTitle = resolvedTitle?.trim() || fallbackTitle?.trim() || 'MSM.digital';
  const title = /MSM(?:\.digital)?/i.test(rawTitle) ? rawTitle : `${rawTitle} | MSM.digital`;
  const description = resolvedDescription?.trim() || fallbackDescription?.trim() || defaultDescription;
  const imageSource = validImage(seo.openGraphImage) ? 'Social Sharing Image' : validImage(seo.image) ? 'Meta Image' : validImage(media) ? 'Case / profile / unit media' : 'MSM homepage video still';
  return {title, description, socialTitle: seo.openGraphTitle?.trim() || title, socialDescription: seo.openGraphDescription?.trim() || description, imageSource};
}
