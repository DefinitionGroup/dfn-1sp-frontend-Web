import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'badgeModule',
    title: 'Badge Module',
    type: 'object',
    fields: [
        defineField({ name: 'text', title: 'Text', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
        defineField({ name: 'numberEl', title: 'Number', type: 'string' }),
        defineField({
            name: 'colSpan',
            title: 'Column span',
            type: 'string',
            description: 'Empty = default (no classname). "Col span 2" applies "col-span-2".',
            options: {
                list: [
                    { title: 'Default', value: '' },
                    { title: 'Col span 2', value: 'col-span-2' }
                ]
            }
        })
    ]
})