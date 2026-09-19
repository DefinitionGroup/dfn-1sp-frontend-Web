import type {CarouselItem, RenaissanceCarouselCase} from '@1sp/sanity-types';
import {stegaClean} from '@sanity/client/stega';
import {assetUrl} from '@1sp/utils/cloudinary';

/** Input is already channel/language filtered and edition-resolved by GROQ. */
export function caseCarouselItems(cases: RenaissanceCarouselCase[] = []): CarouselItem[] {
  const seen = new Set<string>();
  return cases.flatMap(caseStudy => {
    const slug = stegaClean(caseStudy?.slug?.current || '').trim();
    if (!caseStudy?._id || seen.has(caseStudy._id) || !slug || !stegaClean(caseStudy.title || '').trim()) return [];
    const image = caseStudy.mainImageUrl ? {_type: 'cloudinary.asset', secure_url: caseStudy.mainImageUrl} : caseStudy.mainImage;
    const video = caseStudy.mainVideoUrl ? {_type: 'cloudinary.asset', secure_url: caseStudy.mainVideoUrl} : caseStudy.mainVideo;
    if (!assetUrl(image) && !assetUrl(video)) return [];
    seen.add(caseStudy._id);
    return [{id: caseStudy._id, title: caseStudy.title, subtitle: caseStudy.subtitle,
      description: caseStudy.description, image, video,
      linkHref: `/cases/${encodeURIComponent(slug)}`}];
  });
}
