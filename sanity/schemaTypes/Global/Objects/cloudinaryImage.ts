import { defineType, defineField } from 'sanity'

/**
 * Reusable Cloudinary image type with alt text.
 * This ensures all cloudinary assets with alt text have the same schema type,
 * allowing copy/paste to work correctly in Sanity Studio.
 */
export default defineType({
    name: 'cloudinaryImage',
    title: 'Cloudinary Image',
    type: 'object',
    fields: [
        defineField({
            name: 'asset',
            title: 'Asset',
            type: 'cloudinary.asset',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'alt',
            type: 'string',
            title: 'Alternative Text',
            description: 'Important for SEO and accessibility.',
            validation: (Rule) => Rule.max(100),
        }),
    ],
    preview: {
        select: {
            imageUrl: 'asset.secure_url',
            alt: 'alt',
        },
        prepare({ imageUrl, alt }) {
            return {
                title: alt || 'Cloudinary Image',
                subtitle: imageUrl || 'No image selected',
                media: imageUrl ? undefined : undefined,
            }
        },
    },
})
