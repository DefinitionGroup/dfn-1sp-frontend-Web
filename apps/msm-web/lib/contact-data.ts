import {cache} from 'react';
import {sanityFetch} from '@1sp/sanity-queries/fetch';
import type {CloudinaryAsset} from '@1sp/sanity-types';
import {contactEmail} from './contact-content';

export type ContactPerson = {
  _id: string; name: string; fullname?: string; position?: string;
  email?: string; altText?: string; image?: CloudinaryAsset | null; profileUrl?: string;
};

export const getMsmContactPeople = cache(async (language: string): Promise<ContactPerson[]> => {
  const {data} = await sanityFetch<ContactPerson[]>({query: `*[_type == "person" && $channel in channel && language == $language] | order(fullname asc, name asc) {
    _id, name, fullname, position, email, altText,
    "image": coalesce(siteContent[channel == $channel][0].image, image),
    "profileUrl": select(defined(siteContent[channel == $channel][0].slug.current) => "/" + select(language == "en" => "", language + "/") + "people/" + siteContent[channel == $channel][0].slug.current, profileUrl)
  }`, params: {channel: 'msmWeb', language}, tags: ['people']});
  return (data || []).map(person => ({...person, email: contactEmail(person.email)}));
});
