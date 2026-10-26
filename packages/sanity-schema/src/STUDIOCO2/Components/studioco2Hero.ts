import { defineField, defineType } from 'sanity';
import { FilmStrip } from '@phosphor-icons/react';
import { LINE_PER_ROW, studioco2PageOnly } from '../shared';

export default defineType({
  name: 'studioco2Hero',
  title: 'Studio CO2 Hero',
  type: 'object',
  icon: FilmStrip,
  description: 'Full-bleed studio reel behind the logo, a short headline, supporting copy and two actions.',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
  ],
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'text', rows: 2, group: 'content', description: LINE_PER_ROW, validation: rule => rule.required().max(80) }),
    defineField({ name: 'text', title: 'Supporting copy', type: 'text', rows: 2, group: 'content', description: LINE_PER_ROW, validation: rule => rule.max(140) }),
    defineField({ name: 'primaryLabel', title: 'Primary action label', type: 'string', group: 'content', initialValue: 'View work', validation: rule => rule.required().max(24) }),
    defineField({
      name: 'primaryHref', title: 'Primary action target', type: 'string', group: 'content', initialValue: '#work',
      description: 'A section anchor such as #work, a site path such as /contact, or an https:// address.',
      validation: rule => rule.required().custom(value => !value || /^(#[a-z][a-z0-9-]*|\/[^\s]*|https:\/\/\S+)$/.test(value) || 'Use #anchor, /path or https://…'),
    }),
    defineField({ name: 'reelLabel', title: 'Reel action label', type: 'string', group: 'content', initialValue: 'Watch reel', description: 'Opens the hero video in a player. Leave empty to hide the action.', validation: rule => rule.max(24) }),
    defineField({ name: 'fullFilmUrl', title: 'Full film URL', type: 'url', group: 'content', description: 'Optional “Watch the full film” link shown under the reel player.', validation: rule => rule.uri({ scheme: ['https'] }) }),
    defineField({ name: 'video', title: 'Hero video', type: 'cloudinary.asset', group: 'media', description: 'Muted looping reel; also played by the reel action.', validation: rule => rule.required() }),
    defineField({ name: 'mobileVideo', title: 'Mobile video', type: 'cloudinary.asset', group: 'media', description: 'Optional lighter cut for screens up to 600px wide.' }),
    defineField({ name: 'poster', title: 'Poster image', type: 'cloudinary.asset', group: 'media', description: 'Shown before the video plays and when motion is paused. Leave empty to use the video’s first frame.' }),
    defineField({ name: 'darkness', title: 'Video darkness', type: 'number', group: 'media', initialValue: 0, description: '0 shows the original video, 100 is black. Text stays bright.', validation: rule => rule.min(0).max(100).integer() }),
  ],
  validation: studioco2PageOnly,
  preview: {
    select: { headline: 'headline' },
    prepare: ({ headline }) => ({ title: 'Studio CO2 Hero', subtitle: headline?.split('\n').join(' ') }),
  },
});
