import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'serviceGroup',
    title: 'Service Group',
    type: 'document',
    groups: [
        { name: 'content', title: 'Content', default: true },
        { name: 'media', title: 'Media' },
        { name: 'relations', title: 'Relations' },
        { name: 'i18n', title: 'Localization' },
    ],
    fields: [
        defineField({
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            initialValue: 'de',
            description: 'Managed by i18n tooling; do not edit manually.',
            group: 'i18n',
        }),
        defineField({
            name: 'name',
            title: 'Service Group Name',
            type: 'string',
            validation: (Rule) => Rule.required().min(1).max(100),
            group: 'content',
        }),
        defineField({
            name: 'taglabel',
            title: 'Tag Label',
            type: 'string',
            description: 'Short tag or label for the service group',
            validation: (Rule) => Rule.max(50),
            group: 'content',
        }),
        defineField({
            name: 'servicegroupicon',
            title: 'Service Icon',
            type: 'cloudinaryImage',
            group: 'media',
        }),
        defineField({
            name: 'services',
            title: 'Services',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'services' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "services" && language == $language',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                },
            ],
            description: 'Services that belong to this group. Use "Save & Sync Relationships" to automatically update bidirectional references.',
            group: 'relations',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'taglabel',
            media: 'servicegroupicon',
        },
    },
})