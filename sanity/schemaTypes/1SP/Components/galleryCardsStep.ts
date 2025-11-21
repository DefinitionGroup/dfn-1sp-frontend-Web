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
            type: 'cardsStepContent',
            group: 'content'
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