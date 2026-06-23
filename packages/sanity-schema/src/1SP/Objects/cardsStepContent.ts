import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'cardsStepContent',
    title: 'Cards Step Content',
    type: 'object',
    fields: [
        defineField({ name: 'headline', title: 'Headline', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' })
    ],
    preview: {
        select: {
            headline: 'headline',
            description: 'description'
        },
        prepare({ headline, description }) {
            return {
                title: headline || 'Content',
                subtitle: description || ''
            }
        }
    }
})
