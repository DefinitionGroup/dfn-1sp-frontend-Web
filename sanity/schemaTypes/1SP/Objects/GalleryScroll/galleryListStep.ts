import { defineType, defineField } from 'sanity'
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
        defineField({
            name: 'header',
            title: 'Header Section',
            type: 'object',
            group: 'content',
            fields: [
                { name: 'superText', title: 'Super Text', type: 'string' },
                { name: 'mainHeadline', title: 'Main Headline', type: 'string' },
                { name: 'subHeadline', title: 'Sub Headline', type: 'string' }
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
        defineField({ name: 'expandableCards', title: 'Expandable Cards', type: 'cards', group: 'content' }),
        defineField({ name: 'media', title: 'Image/Video', type: 'cloudinary.asset', group: 'media' }),
        defineField({ name: 'grid', title: 'Grid Element', type: 'gridElement', group: 'media' }),

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