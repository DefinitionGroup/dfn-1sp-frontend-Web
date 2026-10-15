import { defineField, defineType } from 'sanity'
import { validateOptionalCta } from '../shared/ctaValidation'

/**
 * MSM Media Feature — one reusable block: a framed passage with a darkened
 * background video, eyebrow, headline, copy and a single CTA. Replaces the
 * "content section + intertitle CTA" pair for feature moments such as
 * hashtaglove on the homepage.
 */
export default defineType({
  name: 'msmMediaFeature',
  title: 'MSM Media Feature',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'cta', title: 'Call to action' },
    { name: 'navigation', title: 'Navigation' },
  ],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'content', description: 'Short label above the headline, e.g. "hashtaglove".' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 4, group: 'content' }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'cloudinary.asset',
      group: 'media',
      description: 'Muted looping video from Cloudinary. Plays inside the framed panel.',
      validation: (rule) => rule.custom((value) => !value || (value as { resource_type?: string }).resource_type === 'video' ? true : 'Choose a Cloudinary video.'),
    }),
    defineField({ name: 'poster', title: 'Poster', type: 'cloudinary.asset', group: 'media', description: 'Shown while loading and when motion is reduced. Otherwise derived from the video.' }),
    defineField({
      name: 'brightness',
      title: 'Video brightness',
      type: 'number',
      group: 'media',
      description: '100 shows the video untouched; lower values darken it behind the text. 55 is a good default.',
      initialValue: 55,
      validation: (rule) => rule.min(10).max(100),
    }),
    defineField({ name: 'ctaLabel', title: 'CTA label', type: 'string', group: 'cta', description: 'Small line above the button text, e.g. "Let’s talk".' }),
    defineField({ name: 'cta', title: 'Call to action', type: 'cta', group: 'cta', validation: (rule) => rule.custom((value) => validateOptionalCta(value)) }),
    defineField({ name: 'navPointName', title: 'Navigation point name', type: 'string', group: 'navigation' }),
    defineField({ name: 'hideFromNav', title: 'Hide from navigation', type: 'boolean', initialValue: false, group: 'navigation' }),
  ],
  validation: (rule) =>
    rule.custom((_value, context) =>
      (context.document as { channel?: string } | undefined)?.channel === 'msmWeb'
        ? true
        : 'The MSM Media Feature can only be used on MSM pages.',
    ),
  preview: {
    select: { title: 'headline', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'MSM Media Feature', subtitle: subtitle || 'Video + CTA' }
    },
  },
})
