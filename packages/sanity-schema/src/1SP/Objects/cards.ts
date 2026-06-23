import { defineType, defineField } from 'sanity'
import { Cards } from "@phosphor-icons/react";

export default defineType({
    name: 'cards',
    title: 'Cards',
    type: 'object',
    icon: Cards,
    fields: [
        defineField({
            name: 'items',
            title: 'Card Items',
            type: 'array',
            of: [{ type: 'cardItem' }]
        })
    ],
    preview: {
        select: {
            items: 'items'
        },
        prepare({ items }: { items?: any[] }) {
            const count = items?.length ?? 0
            const firstTitle = items && items[0] && items[0].title
            return {
                title: count ? `${count} card${count > 1 ? 's' : ''}` : 'No cards',
                subtitle: firstTitle ? `First: ${firstTitle}` : undefined
            }
        }
    }
})