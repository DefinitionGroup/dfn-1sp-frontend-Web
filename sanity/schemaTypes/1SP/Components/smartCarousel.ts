import { defineType, defineField } from 'sanity'
import { FiSliders } from 'react-icons/fi'

export default defineType({
    name: 'smartCarousel',
    title: 'Smart Carousel',
    type: 'object',
    icon: FiSliders,
    description: 'Interactive carousel displaying case studies - auto-populate or manually select',
    groups: [
        { name: 'content', title: 'Content', default: true },
        { name: 'navigation', title: 'Navigation' },
    ],
    fields: [
        defineField({
            name: 'navPointName',
            title: 'Navigation Point Name',
            type: 'string',
            description: 'Optional custom name to display in the vertical navigation minimap.',
            group: 'navigation',
        }),
        defineField({
            name: 'hideFromNav',
            title: 'Hide from Navigation',
            type: 'boolean',
            description: 'If enabled, this section will not appear in the vertical navigation minimap.',
            initialValue: false,
            group: 'navigation',
        }),
        defineField({
            name: 'selectionMode',
            title: 'Case Selection Mode',
            type: 'string',
            description: 'Choose how cases are selected for this carousel',
            initialValue: 'auto',
            group: 'content',
            options: {
                list: [
                    { title: 'Auto (From "ConnectedDataCarousel Promo" flag)', value: 'auto' },
                    { title: 'Manual Selection (Drag & Drop order)', value: 'manual' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of case studies to display in the carousel',
            initialValue: 5,
            validation: (Rule) => Rule.required().min(1).max(20),
            hidden: ({ parent }) => parent?.selectionMode === 'manual',
            group: 'content',
        }),
        defineField({
            name: 'selectedCases',
            title: 'Selected Cases',
            type: 'array',
            description: 'Drag and drop to reorder cases. Only used when "Manual Selection" mode is active.',
            group: 'content',
            hidden: ({ parent }) => parent?.selectionMode !== 'manual',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'caseStudy' }],
                    options: {
                        filter: 'isPublished == true',
                    },
                },
            ],
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as { selectionMode?: string };
                    if (parent?.selectionMode === 'manual' && (!value || value.length === 0)) {
                        return 'Please select at least one case study when using manual selection mode';
                    }
                    return true;
                }),
        }),
    ],
    preview: {
        select: {
            maxItems: 'maxItems',
            selectionMode: 'selectionMode',
            selectedCases: 'selectedCases',
        },
        prepare({ maxItems, selectionMode, selectedCases }) {
            const mode = selectionMode === 'manual' ? 'Manual' : 'Auto';
            const count = selectedCases?.length || 0;
            const subtitle = selectionMode === 'manual'
                ? `${mode} - ${count} case${count !== 1 ? 's' : ''} selected`
                : `${mode} - Max ${maxItems || 5} items`;
            return {
                title: 'Smart Carousel',
                subtitle,
            }
        }
    }
})
