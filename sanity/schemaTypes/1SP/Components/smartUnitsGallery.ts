import { defineType, defineField } from 'sanity'
import { BsGrid3X3 } from 'react-icons/bs'

export default defineType({
    name: 'smartUnitsGallery',
    title: 'Smart Units Gallery',
    type: 'object',
    icon: BsGrid3X3,
    description: 'Automatically displays active units with smart sorting',
    fields: [
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of units to display',
            initialValue: 6,
            validation: (Rule) => Rule.required().min(1).max(50)
        }),
        defineField({
            name: 'sortBy',
            title: 'Sort By',
            type: 'string',
            options: {
                list: [
                    { title: 'Recently Added', value: 'recent' },
                    { title: 'Name (A-Z)', value: 'name-asc' },
                    { title: 'Name (Z-A)', value: 'name-desc' }
                ],
                layout: 'radio'
            },
            initialValue: 'recent',
            description: 'Choose how to sort the unit cards'
        })
    ],
    preview: {
        select: {
            maxItems: 'maxItems',
            sortBy: 'sortBy'
        },
        prepare({ maxItems, sortBy }) {
            const sortLabel = sortBy === 'name-asc' ? 'Name (A-Z)' :
                sortBy === 'name-desc' ? 'Name (Z-A)' :
                    'Recently Added';

            return {
                title: 'Smart Units Gallery',
                subtitle: `Max ${maxItems || 6} units • Sort: ${sortLabel}`,
                media: BsGrid3X3
            }
        }
    }
})
