import { stegaClean } from '@sanity/client/stega';

export const CAMPAIGN_REGIONS = [
  {value:'',label:'All regions'}, {value:'uk-campaigns',label:'UK'},
  {value:'emea-campaigns',label:'EMEA'}, {value:'na-campaigns',label:'North America'},
  {value:'worldwide-campaigns',label:'Worldwide'},
];
export interface DiscoverableCase {
  title: string; subtitle?: string; description?: string; client?: {name: string};
  discovery?: {regions?: string[]; genres?: string[]; platforms?: string[]};
}
export function matchesCampaign(study: DiscoverableCase, region: string, search: string) {
  const clean = stegaClean(study);
  if (region && !clean.discovery?.regions?.includes(region)) return false;
  const text = [clean.title, clean.subtitle, clean.description, clean.client?.name,
    ...clean.discovery?.genres || [], ...clean.discovery?.platforms || []].join(' ').toLowerCase();
  return search.trim().toLowerCase().split(/\s+/).every(term => text.includes(term));
}
