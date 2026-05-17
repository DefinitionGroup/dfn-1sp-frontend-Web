import { defineType, defineField } from 'sanity'
import { UsersThree } from '@phosphor-icons/react'

export default defineType({
    name: 'smartPeople',
    title: 'Smart People',
    type: 'object',
    icon: UsersThree,
    description: 'Automatically displays people marked with "Smart People Promo 1SP" channel',
    fields: [
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of people to display',
            initialValue: 6,
            validation: (Rule) => Rule.required().min(1).max(50)
        })
    ],
    preview: {
        select: {
            maxItems: 'maxItems'
        },
        prepare({ maxItems }) {
            return {
                title: 'Smart People',
                subtitle: `Max ${maxItems || 6} items (Auto-populated from People)`,
                media: UsersThree
            }
        }
    }
})
