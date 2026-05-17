import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'staggeredHeader',
    title: 'Staggered Header',
    type: 'object',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
            name: 'paragraphs',
            title: 'Paragraph Lines',
            description: 'Each string renders as its own <p> under the title',
            type: 'array',
            of: [{ type: 'paragraphLine' }],
        })
    ],
    preview: {
        select: {
            title: 'title',
            paragraphs: 'paragraphs'
        },
        prepare({ title, paragraphs }) {
            const count = Array.isArray(paragraphs) ? paragraphs.length : 0;
            return {
                title: title || 'Staggered Header',
                subtitle: `${count} paragraph${count === 1 ? '' : 's'}`
            }
        }
    }
})
