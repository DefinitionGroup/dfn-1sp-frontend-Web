import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'slideUpText',
    title: 'Slide Up Text',
    type: 'object',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text' })
    ]
})