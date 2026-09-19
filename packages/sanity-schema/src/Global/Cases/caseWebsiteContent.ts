import { caseDiscoveryField } from './caseDiscovery';
import { defineField, defineType } from 'sanity';
import { SITE_CONFIGS, WEBSITE_CHANNELS } from '@1sp/site-config';
import CaseEditionInput from './CaseEditionInput';

export const caseSeoFields = [
  defineField({ name: 'title', title: 'SEO title', type: 'string' }),
  defineField({ name: 'description', title: 'SEO description', type: 'text', rows: 3 }),
];

export default defineType({
  name: 'caseWebsiteContent', title: 'Website edition', type: 'object',
  components: { input: CaseEditionInput },
  fields: [
    caseDiscoveryField(),
    defineField({ name: 'channel', title: 'Website', type: 'string',
      options: { list: WEBSITE_CHANNELS.map(value => ({ value, title: SITE_CONFIGS[value].shortName })) },
      validation: r => r.required().custom((value, context) => !value || (context.document?.channel as string[] | undefined)?.includes(value) || 'Assign this website in Publication before adding its edition.') }),
    defineField({ name: 'title', title: 'Title override', type: 'string', description: 'Unset uses the shared title.', validation: r => r.custom(value => value == null || (typeof value === 'string' && Boolean(value.trim())) || 'Use a title or unset this override.') }),
    defineField({ name: 'hideDescription', title: 'Hide summary on this website', type: 'boolean', description: 'Explicitly removes the summary instead of inheriting it.' }),
    defineField({ name: 'description', title: 'Summary override', type: 'text', rows: 4, description: 'Unset inherits the shared summary.', hidden: ({ parent }) => parent?.hideDescription === true }),
    defineField({ name: 'hideSubtitle', title: 'Hide subtitle on this website', type: 'boolean' }),
    defineField({ name: 'subtitle', title: 'Subtitle override', type: 'string', hidden: ({ parent }) => parent?.hideSubtitle === true }),
    defineField({ name: 'seo', title: 'SEO overrides', type: 'object', fields: caseSeoFields }),
    defineField({ name: 'mediaMode', title: 'Hero media', type: 'string', initialValue: 'inherit', options: { layout: 'radio', list: [{ title: 'Use shared media', value: 'inherit' }, { title: 'Custom media (replaces image and video)', value: 'custom' }] } }),
    ...(['mainImage', 'mainVideo'] as const).map(name => defineField({ name, title: name === 'mainImage' ? 'Hero image' : 'Hero video', type: 'cloudinary.asset', hidden: ({ parent }) => parent?.mediaMode !== 'custom' })),
    defineField({ name: 'isVerticalVideo', title: 'Vertical video', type: 'boolean', hidden: ({ parent }) => parent?.mediaMode !== 'custom' }),
    defineField({ name: 'bodyMode', title: 'Case body', type: 'string', initialValue: 'inherit', options: { layout: 'radio', list: [{ title: 'Use shared blocks', value: 'inherit' }, { title: 'Custom blocks (complete composition)', value: 'custom' }] } }),
    defineField({ name: 'casesPageBuilder', title: 'Website case blocks', type: 'array', hidden: ({ parent }) => parent?.bodyMode !== 'custom',
      of: ['headlineChallenge', 'challengeAndSolution', 'approachSection', 'resultsMetrics'].map(type => ({ type })) }),
  ],
  preview: { select: { channel: 'channel', title: 'title', mode: 'bodyMode' }, prepare: ({ channel, title, mode }) => ({ title: SITE_CONFIGS[channel as keyof typeof SITE_CONFIGS]?.shortName || 'Choose a website', subtitle: title || (mode === 'custom' ? 'Custom case blocks' : 'Shared content with optional overrides') }) },
});
