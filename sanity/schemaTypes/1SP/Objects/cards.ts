import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'cards',
    title: 'Cards',
    type: 'object',
    fields: [
        defineField({
            name: 'items',
            title: 'Card Items',
            type: 'array',
            of: [{ type: 'cardItem' }]
        })
    ]
})