import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'slideUpContent',
    title: 'Slide Up Content',
    type: 'object',
    fields: [
        defineField({
            name: 'contentType',
            title: 'Content Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Custom Text Items', value: 'text' },
                    { title: 'Service References', value: 'services' }
                ],
                layout: 'radio'
            },
            initialValue: 'text',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'textItems',
            title: 'Text Items',
            type: 'array',
            of: [{ type: 'slideUpText' }],
            description: 'Add custom text items to highlight',
            hidden: ({ parent }) => parent?.contentType !== 'text'
        }),
        defineField({
            name: 'serviceItems',
            title: 'Service Items',
            type: 'array',
            of: [{
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
            }],
            description: 'Reference existing services to highlight',
            hidden: ({ parent }) => parent?.contentType !== 'services'
        })
    ]
})