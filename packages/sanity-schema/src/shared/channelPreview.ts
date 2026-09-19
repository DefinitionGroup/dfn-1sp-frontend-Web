import {SITE_CONFIGS, type WebsiteChannel} from '@1sp/site-config';

export function withChannelLabels(subtitle: string | undefined, channels: string[] | undefined) {
  const assignment = Array.isArray(channels) && channels.length ? channels.map(c => SITE_CONFIGS[c as WebsiteChannel]?.shortName || c).join(' · ') : 'Unassigned';
  return subtitle ? `${assignment} — ${subtitle}` : assignment;
}
