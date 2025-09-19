import { defineType, defineField } from 'sanity'
import { FiGrid } from 'react-icons/fi'

export default defineType({
    name: 'galleryCardsStep',
    title: 'Gallery Cards Step',
    type: 'object',
    icon: FiGrid,
    groups: [
        { name: 'badge', title: 'Badge' },
        { name: 'content', title: 'Content', default: true },
        { name: 'media', title: 'Media' }
    ],
    fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule', group: 'badge' }),
        defineField({
            name: 'backgroundVideo',
            title: 'Background Video',
            type: 'cloudinary.asset',
            group: 'media'
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'object',
            group: 'content',
            fields: [
                { name: 'headline', title: 'Headline', type: 'string' },
                { name: 'description', title: 'Description', type: 'text' }
            ]
        }),
        defineField({
            name: 'expandableCards',
            title: 'Expandable Cards',
            type: 'cards',
            group: 'content'
        })
    ],
    preview: {
        select: {
            headline: 'content.headline',
            badgeText: 'badge.text',
        },
        prepare({ headline, badgeText }) {
            return {
                title: headline || 'Cards Step',
                subtitle: `${badgeText || 'No badge'}`
            }
        }
    }
})