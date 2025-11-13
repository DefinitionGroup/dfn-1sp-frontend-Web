import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'listItem',
    title: 'List Item',
    type: 'object',
    fields: [
        defineField({
            name: 'text',
            title: 'Text',
            type: 'string'
        }),
        defineField({
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
        }),
        defineField({
            name: 'fontWeight',
            title: 'Font Weight',
            type: 'string',
            options: {
                list: [
                    { title: 'Normal', value: 'normal' },
                    { title: 'Bold', value: 'bold' }
                ]
            }
        }),
        defineField({
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
        })
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
})
