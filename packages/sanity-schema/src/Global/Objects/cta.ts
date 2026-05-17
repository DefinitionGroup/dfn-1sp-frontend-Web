import { defineType, defineField } from 'sanity'

/**
 * CTA object used by Button2
 * - Adds `variant` aligned with Button2 variants: "default" | "black" | "lime" | "limesmall"
 * - Keeps your existing `link` object for internal/external routing
 */
export default defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(80),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link', // your existing link type (internal/external)
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      description: 'Maps directly to Button2 variants',
      initialValue: 'default',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Black', value: 'black' },
          { title: 'Lime', value: 'lime' },
          { title: 'Lime (Small)', value: 'limesmall' },
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      text: 'text',
      linkType: 'link.linkType',
      pageTitle: 'link.page.title',
      url: 'link.externalUrl',
      variant: 'variant',
    },
    prepare({ text, linkType, pageTitle, url, variant }) {
      const dest = linkType === 'internal' ? (pageTitle ?? 'Page') : (url ?? 'URL')
      const subtitle = `${dest} • ${variant || 'default'}`
      return { title: text ?? 'CTA', subtitle }
    },
  },
})
