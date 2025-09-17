import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'galleryCardsStep',
    title: 'Gallery Cards Step',
    type: 'object',
    fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule' }),
        defineField({
            name: 'backgroundVideo',
            title: 'Background Video',
            type: 'cloudinary.asset',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'object',
            fields: [
                { name: 'headline', title: 'Headline', type: 'string' },
                { name: 'description', title: 'Description', type: 'text' }
            ]
        }),
        defineField({
            name: 'expandableCards',
            title: 'Expandable Cards',
            type: 'cards'
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