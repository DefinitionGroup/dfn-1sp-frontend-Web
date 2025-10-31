import { defineType, defineField } from 'sanity'

const SIZE_LABELS: Record<string, string> = {
    xs: 'XS',
    sm: 'SM',
    base: 'Base',
    lg: 'LG',
    xl: 'XL',
    '2xl': '2XL',
    '3xl': '3XL',
}

export default defineType({
    name: 'size',
    title: 'Size',
    type: 'object',
    fields: [
        defineField({
            name: 'size',
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
        select: {
            value: 'size',
        },
        prepare({ value }) {
            const label = value ? SIZE_LABELS[value] ?? value : SIZE_LABELS.base
            return {
                title: `Font size — ${label}`,
                subtitle: `value: ${value ?? 'base'}`,
            }
        },
    },
})
