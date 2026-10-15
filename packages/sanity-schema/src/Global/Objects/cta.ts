import { defineType, defineField } from 'sanity'

/**
 * CTA object used by Button2
 * - Adds `variant` aligned with Button2 variants.
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
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link', // your existing link type (internal/external)
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      description: 'Maps directly to Button2 variants',
      initialValue: 'glass',
      options: {
        list: [
          { title: 'Ghost - light surface', value: 'ghostLight' },
          { title: 'Ghost - dark surface', value: 'ghostDark' },
          { title: 'Ghost - bright brand surface', value: 'ghostBright' },
          { title: 'Glass', value: 'glass' },
          { title: 'Violet', value: 'violet' },
          { title: 'Violet (Small)', value: 'violetsmall' },
          { title: 'Black', value: 'black' },
          { title: 'Animated Strands', value: 'strands' },
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
