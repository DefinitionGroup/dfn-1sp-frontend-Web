import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'peopleStepHeader',
    title: 'People Step Header',
    type: 'object',
    fields: [
        defineField({ name: 'superText', title: 'Super Text', type: 'string' }),
        defineField({ name: 'mainHeadline', title: 'Main Headline', type: 'string' }),
        defineField({ name: 'creativityTitle', title: 'Creativity Title', type: 'string' }),
        defineField({ name: 'uniquePeopleText', title: 'Unique People Text', type: 'string' })
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
