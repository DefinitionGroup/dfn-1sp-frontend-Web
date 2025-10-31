import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'smartCarousel',
    title: 'Smart Carousel',
    type: 'object',
    description: 'Automatically displays case studies marked with "ConnectedDataCarousel Promo 1SP" channel',
    fields: [
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of case studies to display in the carousel',
            initialValue: 5,
            validation: (Rule) => Rule.required().min(1).max(20)
        })
    ],
    preview: {
        select: {
            maxItems: 'maxItems'
        },
        prepare({ maxItems }) {
            return {
                title: 'Smart Carousel',
                subtitle: `Max ${maxItems || 5} items (Auto-populated from Case Studies)`
            }
        }
    }
})
