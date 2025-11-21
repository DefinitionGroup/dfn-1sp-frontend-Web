import { defineType, defineField } from 'sanity'
import { FiVideo } from 'react-icons/fi'

export default defineType({
    name: 'galleryHeroStep',
    title: 'Gallery Hero Step',
    type: 'object',
    icon: FiVideo,
    groups: [
        { name: 'badge', title: 'Badge' },
        { name: 'content', title: 'Content', default: true },
        { name: 'media', title: 'Media' },
        { name: 'navigation', title: 'Navigation' }
    ],
    fields: [
        defineField({
            name: 'navPointName',
            title: 'Navigation Point Name',
            type: 'string',
            description: 'Optional custom name to display in the vertical navigation minimap.',
            group: 'navigation'
        }),
        defineField({
            name: 'badge',
            title: 'Badge',
            type: 'badgeModule',
            group: 'badge'
        }),
        defineField({
            name: 'typewriterText',
            title: 'Typewriter Text',
            type: 'string',
            description: 'Main animated headline text',
            group: 'content'
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Description lines that appear below the typewriter',
            group: 'content'
        }),

        // defineField({
        //     name: 'additionalContent',
        //     title: 'Additional Content',
        //     type: 'array',
        //     of: [{ type: 'heroAdditionalContent' }],
        //     group: 'media',
        //     description: 'Add carousels and other content blocks'
        // }),
        defineField({
            name: 'grid',
            title: 'Grid Element',
            type: 'gridElement',
            group: 'media'
        })
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