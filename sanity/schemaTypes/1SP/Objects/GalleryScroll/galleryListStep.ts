import { defineType, defineField, defineArrayMember } from 'sanity'
import { FiList } from 'react-icons/fi'

export default defineType({
    name: 'galleryListStep',
    title: 'Gallery List Step',
    type: 'object',
    icon: FiList,
    groups: [
        { name: 'badge', title: 'Badge' },
        { name: 'content', title: 'Content', default: true },
        { name: 'media', title: 'Media' }
    ],
    fields: [
        defineField({ name: 'badge', title: 'Badge', type: 'badgeModule', group: 'badge' }),

        // Staggered slide up toggle
        defineField({
            name: 'staggeredSlideUp',
            title: 'Staggered Slide Up',
            type: 'boolean',
            description: 'When enabled, uses the Staggered header and hides the regular header',
            group: 'content',
            initialValue: false
        }),

        // Regular header (hidden when staggeredSlideUp is true)
        defineField({
            name: 'header',
            title: 'Header Section',
            type: 'object',
            group: 'content',
            hidden: ({ parent }) => Boolean(parent?.staggeredSlideUp),
            fields: [
                { name: 'superText', title: 'Super Text', type: 'string' },
                { name: 'mainHeadline', title: 'Main Headline', type: 'string' },
                { name: 'subHeadline', title: 'Sub Headline', type: 'string' }
            ]
        }),

        // Staggered header shown only when staggeredSlideUp is true
        defineField({
            name: 'staggeredHeader',
            title: 'Staggered Header',
            type: 'object',
            group: 'content',
            hidden: ({ parent }) => !Boolean(parent?.staggeredSlideUp),
            fields: [
                { name: 'title', title: 'Title', type: 'string' },
                { name: 'paragraph', title: 'Paragraph', type: 'text' }
            ]
        }),

        defineField({
            name: 'listItems',
            title: 'List Items',
            type: 'array',
            group: 'content',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'text', title: 'Text', type: 'string' },
                        {
                            name: 'size',
                            title: 'Size',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Small', value: 'small' },
                                    { title: 'Medium', value: 'medium' },
                                    { title: 'Large', value: 'large' }
                                ]
                            }
                        },
                        {
                            name: 'fontWeight',
                            title: 'Font Weight',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Normal', value: 'normal' },
                                    { title: 'Bold', value: 'bold' }
                                ]
                            }
                        },
                        {
                            name: 'color',
                            title: 'Color',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Black', value: 'black' },
                                    { title: 'White', value: 'white' },
                                    { title: 'Gray', value: 'gray' }
                                ]
                            }
                        }
                    ],
                    preview: {
                        select: {
                            text: 'text',
                            size: 'size',
                            fontWeight: 'fontWeight'
                        },
                        prepare({ text, size, fontWeight }) {
                            return {
                                title: text || 'List item',
                                subtitle: `${size || 'medium'} • ${fontWeight || 'normal'}`
                            }
                        }
                    }
                }
            ]
        }),
        defineField({ name: 'media', title: 'Image/Video', type: 'cloudinary.asset', group: 'media' }),
        defineField({ name: 'grid', title: 'Grid Element', type: 'gridElement', group: 'media' }),
        defineField({
            name: "additionalContent",
            title: "Additional Content",
            description: "Composable items that render after the paragraphs.",
            type: "array",
            group: "content",
            of: [defineArrayMember({ type: "cta" }), defineArrayMember({ type: "cards" }), defineArrayMember({ type: "ctaMiniComponent" })],
        }),

    ],
    preview: {
        select: {
            headline: 'header.mainHeadline',
            badgeText: 'badge.text',
            itemCount: 'listItems'
        },
        prepare({ headline, badgeText, itemCount }) {
            const count = Array.isArray(itemCount) ? itemCount.length : 0;
            return {
                title: headline || 'List Step',
                subtitle: `${badgeText || 'No badge'} • ${count} items`
            }
        }
    }
})