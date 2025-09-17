import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'slideUpContent',
    title: 'Slide Up Content',
    type: 'object',
    fields: [
        defineField({
            name: 'items',
            title: 'Items',
            type: 'array',
            of: [{ type: 'slideUpText' }]
        })
    ]
})