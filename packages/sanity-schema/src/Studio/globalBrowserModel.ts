import {getGlobalLanguageDefinitions, SITE_CONFIGS, WEBSITE_CHANNELS, type WebsiteChannel} from '@1sp/site-config';

export const GLOBAL_BROWSER_TYPES = ['caseStudy', 'person', 'client', 'services'] as const;
export type GlobalBrowserType = typeof GLOBAL_BROWSER_TYPES[number];
export const GLOBAL_BROWSER_LANGUAGES = getGlobalLanguageDefinitions();

// Raw perspective keeps editorial status visible. Prefer a draft before filtering:
// a published assignment must not reappear after its draft removes that assignment.
const FILTER = `_type == $schemaType && !(_id in path("versions.**"))
  && (_id in path("drafts.**") || !defined(*[_id == "drafts." + ^._id][0]._id))
  && ($language == "all" || language == $language)
  && ($channel == "all" || ($channel == "unassigned" && (!defined(channel) || count(channel) == 0)) || $channel in channel)
  && ($search == "" || coalesce(name, title, "") match $search || siteContent[].name match $search || siteContent[].title match $search)`;

export const GLOBAL_BROWSER_QUERY = `{
  "total": count(*[${FILTER}]),
  "items": *[${FILTER}] | order(coalesce(siteContent[channel == $channel][0].name, siteContent[channel == $channel][0].title, name, title) asc, _id asc)[0...$limit]{
    _id, _type, language, channel, "sourceId": coalesce(_originalId, _id),
    "title": coalesce(siteContent[channel == $channel][0].name, siteContent[channel == $channel][0].title, name, title, "Untitled"),
    "hasPublished": !(_id in path("drafts.**")) || defined(*[_id == string::split(^._id, "drafts.")[1]][0]._id),
    "image": coalesce(logo.secure_url, image.secure_url, mainImage.secure_url)
  }
}`;

export function globalBrowserScope(params?: Record<string, string | undefined>) {
  const channel = params?.channel;
  const language = params?.language;
  return {
    channel: channel === 'unassigned' || WEBSITE_CHANNELS.includes(channel as WebsiteChannel) ? channel! : 'all',
    language: language === 'all' || GLOBAL_BROWSER_LANGUAGES.some(l => l.id === language) ? language! : 'en',
  };
}

export function channelLabels(channels?: string[]) {
  return Array.isArray(channels) && channels.length
    ? channels.map(c => SITE_CONFIGS[c as WebsiteChannel]?.shortName || c).join(' · ')
    : 'Unassigned';
}

export function globalCreateTemplate(type: GlobalBrowserType, channel: string, language: string) {
  if (language === 'all') return null;
  if (WEBSITE_CHANNELS.includes(channel as WebsiteChannel) && !SITE_CONFIGS[channel as WebsiteChannel].locales.includes(language as any)) return null;
  return {template: `${type}-global-browser`, parameters: {language, channel: WEBSITE_CHANNELS.includes(channel as WebsiteChannel) ? channel : ''}};
}
