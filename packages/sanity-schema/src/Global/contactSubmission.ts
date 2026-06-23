import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contactSubmission',
  title: 'Contact Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'channel',
      title: 'Channel',
      type: 'string',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'In review', value: 'inReview' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const badge = status === 'completed' ? '✅' : status === 'inReview' ? '🕓' : '🆕'
      return {
        title: title || 'Contact submission',
        subtitle: `${badge} ${subtitle || ''}`,
      }
    },
  },
})
