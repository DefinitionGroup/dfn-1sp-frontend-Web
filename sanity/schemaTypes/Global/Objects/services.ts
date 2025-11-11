import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'services',
    title: 'Services',
    type: 'document',
    fields: [
        defineField({
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            initialValue: 'de',
            description: 'Managed by i18n tooling; do not edit manually.',
        }),
        defineField({
            name: 'name',
            title: 'Service Name',
            type: 'string',
            validation: (Rule) => Rule.required().min(1).max(100),
        }),
        defineField({
            name: 'taglabel',
            title: 'Tag Label',
            type: 'string',
            description: 'Short tag or label for the service',
            validation: (Rule) => Rule.max(50),
        }),
        defineField({
            name: 'serviceicon',
            title: 'Service Icon',
            type: 'cloudinaryImage',
        }),
        defineField({
            name: 'unitsrel',
            title: 'Related Units',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'unit' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "unit" && language == $language',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                },
            ],
            description: 'Units related to this service',
        }),
        defineField({
            name: 'servicegrouprel',
            title: 'Service Groups',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'serviceGroup' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "serviceGroup" && language == $language',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                },
            ],
            description: 'Service groups this service belongs to. Use the "Save & Sync Relationships" action to automatically update bidirectional references.',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'taglabel',
            media: 'serviceicon.asset',
        },
    },
})