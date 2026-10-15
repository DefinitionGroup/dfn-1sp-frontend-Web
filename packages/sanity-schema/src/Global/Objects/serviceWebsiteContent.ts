import {defineField, defineType} from 'sanity';
import {websiteChannelOptions} from '../../shared/channelOptions';
import {SITE_CONFIGS, type WebsiteChannel} from '@1sp/site-config';
import {ServiceBackgroundFocusInput} from '../../serviceBackgroundFocusInput';

export default defineType({
  name: 'serviceWebsiteContent', title: 'Service website edition', type: 'object',
  fields: [
    defineField({name: 'channel', title: 'Website', type: 'string', options: {list: websiteChannelOptions},
      validation: r => r.required().custom((value, context) => !value || (context.document?.channel as string[] | undefined)?.includes(value) || 'Assign this website in Settings first.')}),
    defineField({name: 'name', title: 'Service name override', type: 'string', description: 'Unset inherits the shared name.', validation: r => r.min(1).max(100)}),
    defineField({name: 'taglabel', title: 'Tag label override', type: 'string', validation: r => r.max(50)}),
    defineField({name: 'introText', title: 'Short introduction override', type: 'string', description: 'Used on service cards. Unset inherits shared text.', validation: r => r.max(150)}),
    defineField({name: 'serviceDescription', title: 'Full description override', type: 'text', description: 'Used on the Services page. Blank lines separate paragraphs; unset inherits shared text.'}),
    defineField({name: 'deliverables', title: 'Deliverables override', type: 'array', of: [{type: 'object', name: 'serviceDeliverable', fields: [
      defineField({name: 'title', type: 'string', validation: r => r.required().max(100)}),
      defineField({name: 'description', type: 'text', validation: r => r.required()}),
    ]}]}),
    defineField({name: 'sortOrder', title: 'Display order override', type: 'number', validation: r => r.integer().min(0)}),
    defineField({name: 'mediaMode', title: 'Media', type: 'string', initialValue: 'inherit', options: {layout: 'radio', list: [{title: 'Use shared media', value: 'inherit'}, {title: 'Custom media (including no media)', value: 'custom'}]}}),
    defineField({name: 'serviceBackground', title: 'Background image or video', type: 'cloudinaryImage', components: {input: ServiceBackgroundFocusInput}, hidden: ({parent}) => parent?.mediaMode !== 'custom'}),
    defineField({name: 'serviceicon', title: 'Service icon', type: 'cloudinaryImage', hidden: ({parent}) => parent?.mediaMode !== 'custom'}),
  ],
  preview: {select: {channel: 'channel', name: 'name'}, prepare: ({channel, name}) => ({title: SITE_CONFIGS[channel as WebsiteChannel]?.shortName || 'Choose website', subtitle: name || 'Shared content with optional overrides'})},
});
