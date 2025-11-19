import { defineType, defineField } from 'sanity'
import { FiZap } from 'react-icons/fi'

export default defineType({
    name: 'galleryScrollHighlightStep',
    title: 'Gallery Scroll Highlight Step',
    type: 'object',
    icon: FiZap,
    groups: [
        { name: 'badge', title: 'Badge' },
        { name: 'content', title: 'Content', default: true },
        { name: 'media', title: 'Media' },
        { name: 'cta', title: 'CTA' },
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
            name: 'scrollHighlightContent',
            title: 'Scroll Highlight Content',
            type: 'slideUpContent',
            description: 'Content that will be highlighted as user scrolls',
            group: 'content'
        }),
        defineField({
            name: 'useCTAMini',
            title: 'Use CTA Mini Component',
            type: 'boolean',
            description: 'Enable to add a CTA mini component below the highlighted content',
            group: 'cta'
        }),
        defineField({
            name: 'ctaMini',
            title: 'CTA Mini Component',
            type: 'ctaMiniComponent',
            description: 'Optional CTA mini component to display below the highlighted content',
            group: 'cta',
            hidden: ({ parent }) => !parent?.useCTAMini
        })
    ],
    preview: {
        select: {
            badgeText: 'badge.text',
            videoSrc: 'backgroundVideo.assetId'
        },
        prepare({ badgeText, videoSrc }) {
            return {
                title: 'Scroll Highlight Step',
                subtitle: `${badgeText || 'No badge'} • Video: ${videoSrc ? '✓' : '✗'}`
            }
        }
    }
})