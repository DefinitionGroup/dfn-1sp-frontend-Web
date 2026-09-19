import {defineField, defineType} from 'sanity';
import {SlidersHorizontal} from '@phosphor-icons/react';

export default defineType({
  name: 'renaissanceCaseCarousel',
  title: 'Renaissance Case Carousel',
  type: 'object',
  icon: SlidersHorizontal,
  description: 'The Renaissance interactive carousel, populated from ordered global cases and their Renaissance website content.',
  fields: [
    defineField({
      name: 'selectedCases', title: 'Cases', type: 'array',
      description: 'Select and drag to reorder. Copy, media and links come from each case’s Renaissance website edition. Publish the cases before publishing this page.',
      of: [{type: 'reference', to: [{type: 'caseStudy'}], options: {
        filter: ({document}) => ({
          filter: '"renaissanceWeb" in channel && language == $language && isPublished == true && defined(slug.current)',
          params: {language: document?.language || 'en'},
        }),
      }}],
      validation: rule => rule.required().min(1).max(12).unique(),
    }),
    defineField({
      name: 'autoAdvance', title: 'Automatically advance slides', type: 'boolean', initialValue: false,
      description: 'Advance every seven seconds while visible. Visitors can pause; hover, keyboard focus and reduced motion stop automatic advancement.',
    }),
    defineField({name: 'navPointName', title: 'Navigation point name', type: 'string', description: 'Optional unique section anchor. Leave empty when a Renaissance Section already owns the anchor.'}),
    defineField({name: 'hideFromNav', title: 'Hide from navigation', type: 'boolean', initialValue: false}),
  ],
  validation: rule => rule.custom((_value, context) => context.document?.channel === 'renaissanceWeb' || 'Use this block on Renaissance pages only.'),
  preview: {
    select: {cases: 'selectedCases'},
    prepare: ({cases}) => ({title: 'Renaissance Case Carousel', subtitle: `${cases?.length || 0} selected cases · global references`}),
  },
});
