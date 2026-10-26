import { defineArrayMember, defineField, defineType } from 'sanity';
import { SquaresFour } from '@phosphor-icons/react';
import { studioco2PageOnly } from '../shared';

export default defineType({
  name: 'studioco2Capabilities',
  title: 'Studio CO2 Capabilities',
  type: 'object',
  icon: SquaresFour,
  description: 'Expanding panels (Think, Make, Move): one opens at a time on desktop; an accordion on mobile.',
  fields: [
    defineField({
      name: 'items', title: 'Capabilities', type: 'array',
      of: [defineArrayMember({
        name: 'studioco2Capability', title: 'Capability', type: 'object', icon: SquaresFour,
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string', validation: rule => rule.required().max(24) }),
          defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: rule => rule.required().max(160) }),
          defineField({ name: 'image', title: 'Image', type: 'cloudinary.asset', validation: rule => rule.required() }),
          defineField({ name: 'alt', title: 'Image description', type: 'string', description: 'Describes the image for screen readers.', validation: rule => rule.required().max(140) }),
        ],
        preview: { select: { title: 'title', subtitle: 'text' } },
      })],
      validation: rule => rule.required().min(2).max(4),
    }),
  ],
  validation: studioco2PageOnly,
  preview: {
    select: { items: 'items' },
    prepare: ({ items }) => ({ title: 'Studio CO2 Capabilities', subtitle: (items as { title?: string }[] | undefined)?.map(item => item.title).filter(Boolean).join(' · ') }),
  },
});
