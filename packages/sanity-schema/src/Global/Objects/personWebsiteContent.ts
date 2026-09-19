import {defineField, defineType} from 'sanity';
import {websiteChannelOptions} from '../../shared/channelOptions';

export default defineType({
  name: 'personWebsiteContent', title: 'Person website edition', type: 'object',
  fields: [
    defineField({name: 'channel', title: 'Website', type: 'string', options: {list: websiteChannelOptions}, validation: r => r.required().custom((v, c) => !v || (c.document?.channel as string[] | undefined)?.includes(v) || 'Assign this website first.')}),
    defineField({name: 'slug', title: 'Profile route', type: 'slug', description: 'Website-specific profile address; leaves the shared slug unchanged.', options: {isUnique: async (slug, context: any) => {
      const id = context.document?._id?.replace(/^drafts\./, '');
      const editionKey = context.path?.find((p: any) => typeof p === 'object' && p._key)?._key;
      const channel = context.document?.siteContent?.find((e: any) => e._key === editionKey)?.channel;
      const count = await context.getClient({apiVersion: '2025-09-16'}).fetch('count(*[_type == "person" && language == $language && !(_id in [$id, $draft]) && siteContent[channel == $channel][0].slug.current == $slug])', {language: context.document.language, channel, slug, id, draft: `drafts.${id}`});
      return count === 0;
    }}, validation: r => r.required()}),
    defineField({name: 'seo', title: 'SEO', type: 'metadata'}),
    defineField({name: 'phone', title: 'Phone link', type: 'url', validation:r=>r.uri({scheme:['tel']})}),
    defineField({name: 'quote', title: 'Personal quote', type: 'text'}),
    defineField({name: 'iDo', title: 'I do', type: 'text'}),
    defineField({name: 'askMe', title: 'Ask me', type: 'text'}),
    defineField({name: 'biography', title: 'Biography', type: 'text', rows: 10}),
    defineField({name: 'selectedCasesHeading', title: 'Selected cases heading', type: 'string'}),
    defineField({name: 'selectedCases', title: 'Selected cases', type: 'array', of: [{type: 'reference', to: [{type: 'caseStudy'}], options: {filter: ({document, parentPath}: any) => {const key = parentPath?.find((p: any) => p?._key)?._key; const channel = (document.siteContent || []).find((e: any) => e._key === key)?.channel; return {filter: 'language == $language && $channel in channel', params: {language: document.language, channel: channel || ''}};}}}], validation: r => r.unique()}),
  ],
  preview: {select: {title: 'channel', subtitle: 'slug.current'}},
});
