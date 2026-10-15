import { defineField, defineType } from 'sanity';
import { SquaresFour } from '@phosphor-icons/react';
export default defineType({
  name: 'renaissanceSharedContentReference', title: 'Renaissance Shared Content',
  type: 'object', icon: SquaresFour,
  fields: [defineField({
    name: 'sharedContent', title: 'Shared content', type: 'reference',
    to: [{ type: 'renaissanceSharedPortraits' }, { type: 'renaissanceSharedAwards' }],
    options: { filter: ({ document }) => ({
      filter: 'channel == "renaissanceWeb" && language == $language',
      params: { language: document?.language || 'en' },
    }) },
    description: 'Edit the referenced document to update all instances. Publish it before publishing this page.',
    validation: r => r.required(),
  })],
  validation: r => r.custom((_value, context) => context.document?.channel === 'renaissanceWeb' || 'Shared Renaissance content can only be placed on renaissanceWeb pages.'),
  preview: { select: { title: 'sharedContent.title', subtitle: 'sharedContent.language' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Select shared content', subtitle: `Shared · ${subtitle || 'en'}` }) },
});
