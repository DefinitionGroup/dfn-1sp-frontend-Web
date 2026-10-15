import {cache} from 'react';
import {sanityFetch} from '@1sp/sanity-queries/fetch';
import {getCaseStudiesByIds} from '@1sp/sanity-queries';

export {msmPath} from './site-url';

export const getMsmPerson = cache(async (slug: string, language: string) => {
  const {data} = await sanityFetch({query: `*[_type == "person" && "msmWeb" in channel && language == $language && siteContent[channel == "msmWeb"][0].slug.current == $slug][0]{
    _id, name, fullname, position, email, altText,
    "image": coalesce(siteContent[channel == "msmWeb"][0].image, image),
    "edition": siteContent[channel == "msmWeb"][0]
  }`, params: {slug, language}, tags: ['people']});
  if (!data) return null;
  const ids = (data.edition?.selectedCases || []).map((r: {_ref: string}) => r._ref);
  const cases = ids.length ? await getCaseStudiesByIds(ids, 'msmWeb', language) : [];
  return {...data, cases: ids.map((id: string) => cases.find(c => c?._id === id)).filter(Boolean)};
});
