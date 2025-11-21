import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'carousel',
    title: 'Interactive Carousel',
    type: 'object',
    fields: [
        defineField({
            name: 'items',
            title: 'Carousel Items',
            type: 'array',
            of: [{ type: 'carouselItem' }]
        })
    ],
    preview: {
        select: {
            items: 'items'
        },
        prepare({ items }) {
            const count = Array.isArray(items) ? items.length : 0;
            return {
                title: 'Interactive Carousel',
                subtitle: `${count} item${count === 1 ? '' : 's'}`
            }
        }
    }
})