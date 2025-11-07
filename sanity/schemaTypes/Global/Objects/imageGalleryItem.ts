import { defineType, defineField } from 'sanity'

/**
 * Reusable legacy image gallery item type.
 * Simple image with alt text and caption.
 */
export default defineType({
    name: 'imageGalleryItem',
    title: 'Image Gallery Item',
    type: 'object',
    fields: [
        defineField({
            name: 'image',
            title: 'Image',
            type: 'cloudinary.asset',
        }),
        defineField({
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
        }),
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
        })
    ],
    preview: {
        select: {
            image: 'image',
            alt: 'alt',
            caption: 'caption'
        },
        prepare({ image, alt, caption }) {
            return {
                title: alt || caption || 'Untitled',
                subtitle: caption || 'No caption',
                media: image
            }
        }
    }
})
