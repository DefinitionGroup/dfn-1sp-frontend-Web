import {sanityFetch} from '@1sp/sanity-queries/fetch';
import {servicePresentationFields} from '@1sp/sanity-queries/service-presentation';
import {assetUrl, isVideoAsset, cloudinaryPosterUrl} from '@1sp/utils/cloudinary';
import {msmPath} from '@msm/lib/editorial';
import InteractiveServiceCarousel from '../pg-InteractiveServiceCarousel';
import type {CloudinaryAsset} from '@1sp/sanity-types';

type Service = {
  _id: string; name: string; introText?: string; serviceDescription?: string;
  backgroundAsset?: CloudinaryAsset;
  page?: {slug?: {current?: string}};
};
export default async function InteractiveServiceCarouselBlock({
  selectedServices, language = 'en', channel = 'msmWeb', ...props
}: {
  selectedServices?: ({_ref?: string; _id?: string} | null)[] | null; language?: string; channel?: string;
  title?: string; navPointName?: string; hideFromNav?: boolean; _key?: string;
}) {
  if (channel !== 'msmWeb') return null;
  const ids = (selectedServices ?? []).map(item => item?._ref || item?._id).filter((id): id is string => Boolean(id));
  if (!ids.length) return null;
  let services: Service[];
  try {
    const {data} = await sanityFetch<Service[]>({query: `*[_type == "services" && _id in $ids && $channel in channel && language == $language]{
    _id, ${servicePresentationFields()},
    "page": *[_type == "page" && channel == $channel && language == $language && msmPageKind == "service" && ^._id in services[]._ref] | order(_id asc)[0]{slug}
  }`, params: {ids, channel, language}, tags: ['services', 'page']});
    services = data ?? [];
  } catch (error) {
    console.error('MSM service carousel could not load its services', error);
    // The authored service directory remains available below this optional block.
    return null;
  }
  const items = [...new Set(ids)].flatMap(id => {
    const service = services.find(item => item._id === id);
    const slug = service?.page?.slug?.current;
    if (!service || !slug) return [];
    const media = service.backgroundAsset;
    const url = assetUrl(media);
    const video = isVideoAsset(media, url);
    return [{id, name: service.name, description: service.introText || service.serviceDescription?.split('\n\n')[0],
      href: msmPath(language, slug), video: video ? url : undefined,
      image: video ? cloudinaryPosterUrl(url, {maxWidth: 960}) : url}];
  });
  if (!items.length) return null;
  return <InteractiveServiceCarousel {...props} id={`service-carousel-${props._key || 'services'}`} items={items} language={language} />;
}
