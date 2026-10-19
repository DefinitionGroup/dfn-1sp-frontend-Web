import {defineArrayMember, defineField, defineType} from 'sanity';
import {GameController} from '@phosphor-icons/react';

export default defineType({
  name: 'renaissanceGamesCarousel',
  title: 'Renaissance Games Carousel',
  type: 'object',
  icon: GameController,
  description: 'Paged grid of game covers, each linking to its Steam page or official website.',
  fields: [
    defineField({name: 'headline', title: 'Headline', type: 'string', initialValue: 'Latest Games', validation: rule => rule.max(70)}),
    defineField({name: 'subheadline', title: 'Subheadline', type: 'string', initialValue: 'Our Latest projects', validation: rule => rule.max(120)}),
    defineField({
      name: 'games', title: 'Games', type: 'array',
      description: 'Drag to reorder. Pages hold twelve covers on desktop, nine on tablets and eight on phones.',
      of: [defineArrayMember({
        name: 'renaissanceGame', title: 'Game', type: 'object', icon: GameController,
        fields: [
          defineField({name: 'title', title: 'Title', type: 'string', validation: rule => rule.required()}),
          defineField({
            name: 'image', title: 'Cover image', type: 'cloudinary.asset',
            description: 'Landscape store capsule, ideally 460 × 215 px or larger. Upload to the renaissance/games folder.',
            validation: rule => rule.required(),
          }),
          defineField({
            name: 'url', title: 'Link', type: 'url',
            description: 'The Steam store page, or the official website when the game is not on Steam.',
            validation: rule => rule.required().uri({scheme: ['https']}),
          }),
        ],
        preview: {select: {title: 'title', subtitle: 'url'}},
      })],
      validation: rule => rule.required().min(1),
    }),
    defineField({name: 'navPointName', title: 'Navigation point name', type: 'string', description: 'Optional unique section anchor. Leave empty when a Renaissance Section already owns the anchor.'}),
    defineField({name: 'hideFromNav', title: 'Hide from navigation', type: 'boolean', initialValue: false}),
  ],
  validation: rule => rule.custom((_value, context) => context.document?.channel === 'renaissanceWeb' || 'Use this block on Renaissance pages only.'),
  preview: {
    select: {headline: 'headline', games: 'games'},
    prepare: ({headline, games}) => ({title: headline || 'Renaissance Games Carousel', subtitle: `${games?.length || 0} games`}),
  },
});
