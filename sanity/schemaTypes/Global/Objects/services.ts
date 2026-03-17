import { defineType, defineField } from 'sanity'
import { ServiceBackgroundFocusInput } from '../../../lib/serviceBackgroundFocusInput'

const languageFilter = (docField: string) => ({ document }: { document: any }) => {
    const currentLanguage = document?.language || 'de'
    return {
        filter: `_type == "${docField}" && language == $language`,
        params: { language: currentLanguage },
    }
}

export default defineType({
    name: 'services',
    title: 'Services',
    type: 'document',
    // Define groups and assign fields to them below
    groups: [
        { name: 'meta', title: 'Metadata' },
        { name: 'content', title: 'Content' },
        { name: 'media', title: 'Media' },
        { name: 'relations', title: 'Relations' },
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
            group: 'meta',
        }),
        defineField({
            name: 'name',
            title: 'Service Name',
            type: 'string',
            validation: (Rule) => Rule.required().min(1).max(100),
            group: 'content',
        }),
        defineField({
            name: 'taglabel',
            title: 'Tag Label',
            type: 'string',
            description: 'Short tag or label for the service',
            validation: (Rule) => Rule.max(50),
            group: 'content',
        }),
        defineField({
            name: 'introText',
            title: 'Introduction Text',
            type: 'string',
            description: 'Short introduction text for the service',
            validation: (Rule) => Rule.max(150),
            group: 'content',
        }),
        defineField({
            name: 'serviceDescription',
            title: 'Service Description',
            type: 'text',
            description: 'Description for the service',
            group: 'content',
        }),
        defineField({
            name: 'serviceicon',
            title: 'Service Icon',
            type: 'cloudinaryImage',
            group: 'media',
        }),
        defineField({
            name: 'serviceBackground',
            title: 'Service Background Image',
            type: 'cloudinaryImage',
            description: 'Use the drag point below the image to control the gallery crop focus.',
            components: {
                input: ServiceBackgroundFocusInput,
            },
            group: 'media',
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
                        filter: languageFilter('unit'),
                    },
                },
            ],
            description:
                'Units related to this service. Use "Save & Sync Relationships" to automatically update bidirectional references.',
            group: 'relations',
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
                        filter: languageFilter('serviceGroup'),
                    },
                },
            ],
            description:
                'Service groups this service belongs to. Use the "Save & Sync Relationships" action to automatically update bidirectional references.',
            group: 'relations',
        }),
        defineField({
            name: 'caseStudies',
            title: 'Related Case Studies',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'caseStudy' }],
                    options: {
                        filter: languageFilter('caseStudy'),
                    },
                },
            ],
            description:
                'Case studies that use this service. This field is automatically synced when case studies reference this service.',
            group: 'relations',
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
