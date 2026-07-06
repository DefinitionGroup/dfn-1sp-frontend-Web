import { defineType, defineField } from 'sanity'
import { SlidersHorizontal } from '@phosphor-icons/react'

export default defineType({
    name: 'smartServicesCarousel',
    title: 'Smart Services Carousel',
    type: 'object',
    icon: SlidersHorizontal,
    description: 'Interactive carousel displaying services - auto-populate or manually select',
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
            title: 'Service Selection Mode',
            type: 'string',
            description: 'Choose how services are selected for this carousel',
            initialValue: 'auto',
            group: 'content',
            options: {
                list: [
                    { title: 'Auto (All services for this channel)', value: 'auto' },
                    { title: 'Manual Selection (Drag & Drop order)', value: 'manual' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'maxItems',
            title: 'Maximum Items',
            type: 'number',
            description: 'Maximum number of services to display in the carousel',
            initialValue: 5,
            validation: (Rule) => Rule.required().min(1).max(20),
            hidden: ({ parent }) => parent?.selectionMode === 'manual',
            group: 'content',
        }),
        defineField({
            name: 'selectedServices',
            title: 'Selected Services',
            type: 'array',
            description: 'Drag and drop to reorder services. Only used when "Manual Selection" mode is active.',
            group: 'content',
            hidden: ({ parent }) => parent?.selectionMode !== 'manual',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'services' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const language = document?.language || 'en'
                            const channel = document?.channel
                            return channel
                                ? {
                                    filter: 'language == $language && $channel in channel',
                                    params: { language, channel },
                                }
                                : { filter: 'language == $language', params: { language } }
                        },
                    },
                },
            ],
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as { selectionMode?: string };
                    if (parent?.selectionMode === 'manual' && (!value || value.length === 0)) {
                        return 'Please select at least one service when using manual selection mode';
                    }
                    return true;
                }),
        }),
    ],
    preview: {
        select: {
            maxItems: 'maxItems',
            selectionMode: 'selectionMode',
            selectedServices: 'selectedServices',
        },
        prepare({ maxItems, selectionMode, selectedServices }) {
            const mode = selectionMode === 'manual' ? 'Manual' : 'Auto';
            const count = selectedServices?.length || 0;
            const subtitle = selectionMode === 'manual'
                ? `${mode} - ${count} service${count !== 1 ? 's' : ''} selected`
                : `${mode} - Max ${maxItems || 5} items`;
            return {
                title: 'Smart Services Carousel',
                subtitle,
            }
        }
    }
})
