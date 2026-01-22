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
            name: 'selectionMode',
            title: 'Unit Selection Mode',
            type: 'string',
            description: 'Choose how units are selected for this grid',
            initialValue: 'auto',
            options: {
                list: [
                    { title: 'Auto (All active units with CTA links)', value: 'auto' },
                    { title: 'Manual Selection (Drag & Drop order)', value: 'manual' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of units to display',
            initialValue: 20,
            hidden: ({ parent }) => parent?.selectionMode === 'manual',
            validation: (Rule) => Rule.min(1).max(50)
        }),
        defineField({
            name: 'selectedUnits',
            title: 'Selected Units',
            type: 'array',
            description: 'Drag and drop to reorder units. Only used when "Manual Selection" mode is active.',
            hidden: ({ parent }) => parent?.selectionMode !== 'manual',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'unit' }],
                    options: {
                        filter: 'isActive == true && defined(cta.link)',
                    },
                },
            ],
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as { selectionMode?: string };
                    if (parent?.selectionMode === 'manual' && (!value || value.length === 0)) {
                        return 'Please select at least one unit when using manual selection mode';
                    }
                    return true;
                }),
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
            columns: 'columns',
            selectionMode: 'selectionMode',
            selectedUnits: 'selectedUnits',
            maxItems: 'maxItems',
        },
        prepare({ headline, subheadline, columns, selectionMode, selectedUnits, maxItems }) {
            const mode = selectionMode === 'manual' ? 'Manual' : 'Auto';
            const count = selectedUnits?.length || 0;
            const modeInfo = selectionMode === 'manual'
                ? `${mode} - ${count} unit${count !== 1 ? 's' : ''} selected`
                : `${mode} - Max ${maxItems || 20} items`;
            return {
                title: headline || 'Unit Logo Grid',
                subtitle: `${columns || 4} cols | ${modeInfo}`,
                media: BsGrid
            }
        }
    }
})
