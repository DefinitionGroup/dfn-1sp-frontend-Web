import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'msmUnitsGrid',
  title: 'MSM Units Grid',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'OUR UNITS' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'intro', title: 'Introduction', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'selectionMode',
      title: 'Unit Selection',
      type: 'string',
      initialValue: 'auto',
      options: {
        list: [
          { title: 'All active Units', value: 'auto' },
          { title: 'Manual selection', value: 'manual' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'selectedUnits',
      title: 'Selected Units',
      type: 'array',
      hidden: ({ parent }) => parent?.selectionMode !== 'manual',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'msmUnit' }] })],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      (context.document as { channel?: string } | undefined)?.channel === 'msmWeb'
        ? true
        : 'The MSM Units Grid can only be used on MSM pages.',
    ),
  preview: {
    select: { title: 'headline', mode: 'selectionMode', units: 'selectedUnits' },
    prepare({ title, mode, units }) {
      return {
        title: title || 'MSM Units Grid',
        subtitle: mode === 'manual' ? `${units?.length || 0} selected Units` : 'All active Units',
      }
    },
  },
})
