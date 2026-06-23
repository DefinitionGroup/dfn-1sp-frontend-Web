import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'paragraphLine',
    title: 'Paragraph Line',
    type: 'object',
    fields: [
        defineField({ name: 'text', title: 'Text', type: 'string', validation: r => r.required() }),
        defineField({
            name: 'fontSize',
            title: 'Font size',
            type: 'string',
            initialValue: 'base',
            options: {
                list: [
                    { title: 'XS', value: 'xs' },
                    { title: 'SM', value: 'sm' },
                    { title: 'Base', value: 'base' },
                    { title: 'LG', value: 'lg' },
                    { title: 'XL', value: 'xl' },
                    { title: '2XL', value: '2xl' },
                    { title: '3XL', value: '3xl' },
                ],
                layout: 'radio',
            },
        }),
    ],
    preview: {
        select: { text: 'text', fontSize: 'fontSize' },
        prepare({ text, fontSize }) {
            return {
                title: text || 'Paragraph line',
                subtitle: `size: ${fontSize || 'base'}`,
            }
        },
    },
})
