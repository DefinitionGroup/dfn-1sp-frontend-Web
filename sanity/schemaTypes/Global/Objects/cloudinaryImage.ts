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
        defineField({
            name: 'focusMode',
            type: 'string',
            title: 'Crop Focus',
            description: 'Choose whether the frontend should keep the default center crop or use a manual focal point.',
            initialValue: 'auto',
            options: {
                list: [
                    { title: 'Auto / Center', value: 'auto' },
                    { title: 'Manual focal point', value: 'manual' },
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
        }),
        defineField({
            name: 'focusX',
            type: 'number',
            title: 'Focus X (%)',
            description: 'Horizontal focal point. 0 = left, 50 = center, 100 = right.',
            initialValue: 50,
            hidden: ({ parent }) => parent?.focusMode !== 'manual',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'focusY',
            type: 'number',
            title: 'Focus Y (%)',
            description: 'Vertical focal point. 0 = top, 50 = center, 100 = bottom.',
            initialValue: 50,
            hidden: ({ parent }) => parent?.focusMode !== 'manual',
            validation: (Rule) => Rule.min(0).max(100),
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
