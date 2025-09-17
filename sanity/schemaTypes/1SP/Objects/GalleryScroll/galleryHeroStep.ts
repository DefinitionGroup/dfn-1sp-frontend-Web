import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'galleryHeroStep',
    title: 'Gallery Hero Step',
    type: 'object',
    fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule' }),
        defineField({
            name: 'typewriterText',
            title: 'Typewriter Text',
            type: 'string',
            description: 'Main animated headline text'
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Description lines that appear below the typewriter'
        }),
        defineField({
            name: 'carousel',
            title: 'Interactive Carousel',
            type: 'carousel'
        }),
        defineField({ name: 'grid', title: 'Grid Element', type: 'gridElement' }),

    ],
    preview: {
        select: {
            typewriterText: 'typewriterText',
            badgeText: 'badge.text'
        },
        prepare({ typewriterText, badgeText }) {
            return {
                title: typewriterText || 'Hero Step',
                subtitle: `Badge: ${badgeText || 'No badge'}`
            }
        }
    }
})