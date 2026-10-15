import {defineArrayMember, defineField, defineType} from 'sanity';
import {ShareNetworkIcon} from '@phosphor-icons/react';

export default defineType({
  name: 'msmSocialLinks',
  title: 'MSM Social Links',
  type: 'object',
  icon: ShareNetworkIcon,
  fields: [
    defineField({name: 'title', title: 'Section heading', type: 'string'}),
    defineField({
      name: 'color', title: 'Content color', type: 'string', initialValue: 'white',
      description: 'MSM palette color for the heading, icons and labels. Defaults to White.',
      options: {list: [
        {title: 'White', value: 'white'},
        {title: 'Cyan', value: 'cyan'},
        {title: 'Teal', value: 'teal'},
        {title: 'Deep teal', value: 'teal-deep'},
        {title: 'Magenta', value: 'magenta'},
        {title: 'Purple', value: 'purple'},
        {title: 'Maroon', value: 'maroon'},
        {title: 'Red', value: 'red'},
        {title: 'Orange', value: 'orange'},
        {title: 'Amber', value: 'amber'},
      ]},
    }),
    defineField({
      name: 'links', title: 'Social links', type: 'array',
      validation: rule => rule.required().min(1),
      of: [defineArrayMember({
        name: 'msmSocialLink', title: 'Social link', type: 'object',
        fields: [
          defineField({
            name: 'platform', title: 'Service', type: 'string', validation: rule => rule.required(),
            options: {list: [
              {title: 'Messenger', value: 'messenger'},
              {title: 'WhatsApp', value: 'whatsapp'},
              {title: 'Facebook', value: 'facebook'},
              {title: 'Instagram', value: 'instagram'},
              {title: 'LinkedIn', value: 'linkedin'},
            ]},
          }),
          defineField({name: 'label', title: 'Label', type: 'string', description: 'Optional. Uses the service name when empty.'}),
          defineField({name: 'url', title: 'Destination URL', type: 'url', validation: rule => rule.required().uri({scheme: ['http', 'https']})}),
          defineField({name: 'openInNewTab', title: 'Open in new tab', type: 'boolean', initialValue: true}),
        ],
        preview: {select: {title: 'label', platform: 'platform', subtitle: 'url'}, prepare: ({title, platform, subtitle}) => ({title: title || platform || 'Social link', subtitle})},
      })],
    }),
    defineField({name: 'navPointName', title: 'Navigation point name', type: 'string'}),
    defineField({name: 'hideFromNav', title: 'Hide from navigation', type: 'boolean', initialValue: false}),
  ],
  validation: rule => rule.custom((_value, context) => context.document?.channel === 'msmWeb' ? true : 'Use MSM Social Links on MSM pages.'),
  preview: {select: {title: 'title', links: 'links'}, prepare: ({title, links}) => ({title: title || 'MSM Social Links', subtitle: `${links?.length || 0} social links`})},
});
