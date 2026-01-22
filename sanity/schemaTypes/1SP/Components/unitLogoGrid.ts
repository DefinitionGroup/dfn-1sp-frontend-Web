import { defineType, defineField } from 'sanity'
import { BsGrid } from 'react-icons/bs'

export default defineType({
    name: 'unitLogoGrid',
    title: 'Unit Logo Grid',
    type: 'object',
    icon: BsGrid,
    description: 'Displays a grid of unit logos with links to their websites',
    fields: [
        defineField({
            name: 'headline',
            title: 'Headline',
            type: 'string',
            description: 'Main headline for this section',
            validation: (Rule) => Rule.required().min(1).max(100)
        }),
        defineField({
            name: 'subheadline',
            title: 'Subheadline',
            type: 'string',
            description: 'Optional supporting subheadline text'
        }),
        defineField({
            name: 'logoVariant',
            title: 'Logo Variant',
            type: 'string',
            description: 'Which logo version to display',
            options: {
                list: [
                    { title: 'Logo Color', value: 'logoColor' },
                    { title: 'Logo (Default)', value: 'logo' },
                    { title: 'Logo Signet', value: 'logoSignet' }
                ],
                layout: 'radio'
            },
            initialValue: 'logoColor'
        }),
        defineField({
            name: 'columns',
            title: 'Grid Columns',
            type: 'number',
            description: 'Number of columns in the grid',
            options: {
                list: [
                    { title: '3 Columns', value: 3 },
                    { title: '4 Columns', value: 4 },
                    { title: '5 Columns', value: 5 },
                    { title: '6 Columns', value: 6 }
                ]
            },
            initialValue: 4
        }),
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of units to display',
            initialValue: 20,
            validation: (Rule) => Rule.min(1).max(50)
        }),
        defineField({
            name: 'navPointName',
            title: 'Navigation Point Name',
            type: 'string',
            description: 'Optional name for navigation anchor links'
        })
    ],
    preview: {
        select: {
            headline: 'headline',
            subheadline: 'subheadline',
            columns: 'columns'
        },
        prepare({ headline, subheadline, columns }) {
            return {
                title: headline || 'Unit Logo Grid',
                subtitle: subheadline || `${columns || 4} columns`,
                media: BsGrid
            }
        }
    }
})
