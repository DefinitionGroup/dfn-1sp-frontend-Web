import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'listStepHeader',
    title: 'List Step Header',
    type: 'object',
    fields: [
        defineField({ name: 'superText', title: 'Super Text', type: 'string' }),
        defineField({ name: 'mainHeadline', title: 'Main Headline', type: 'string' }),
        defineField({ name: 'subHeadline', title: 'Sub Headline', type: 'string' })
    ],
    preview: {
        select: {
            mainHeadline: 'mainHeadline',
            superText: 'superText'
        },
        prepare({ mainHeadline, superText }) {
            return {
                title: mainHeadline || 'Header',
                subtitle: superText || ''
            }
        }
    }
})
