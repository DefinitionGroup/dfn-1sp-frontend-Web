import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'galleryScrollHighlightStep',
    title: 'Gallery Scroll Highlight Step',
    type: 'object',
    fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule' }),
        defineField({
            name: 'backgroundVideo',
            title: 'Background Video',
            type: 'cloudinary.asset',
        }),
        defineField({
            name: 'scrollHighlightContent',
            title: 'Scroll Highlight Content',
            type: 'slideUpContent',
            description: 'Content that will be highlighted as user scrolls'
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