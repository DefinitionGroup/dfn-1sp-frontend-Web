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
            name: 'scrollHighlightContent',
            title: 'Scroll Highlight Content',
            type: 'slideUpContent',
            description: 'Content that will be highlighted as user scrolls',
            group: 'content'
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