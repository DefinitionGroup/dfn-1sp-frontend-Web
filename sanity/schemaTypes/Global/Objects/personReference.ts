import { defineType } from 'sanity'

export default defineType({
    name: 'personReference',
    title: 'Person Reference',
    type: 'object',
    fields: [
        {
            name: 'person',
            title: 'Person',
            type: 'reference',
            to: [{ type: 'person' }],
            validation: (Rule) => Rule.required(),
            options: {
                filter: ({ parent, document }: { parent: any; document: any }) => {
                    const currentLanguage = document?.language || 'de';
                    return {
                        filter: '_type == "person" && language == $language',
                        params: { language: currentLanguage }
                    };
                }
            }
        },
        {
            name: 'isPrimary',
            title: 'Primary Contact',
            type: 'boolean',
            description: 'Mark this person as the primary contact for this relationship',
            initialValue: false
        }
    ],
    preview: {
        select: {
            title: 'person.name',
            isPrimary: 'isPrimary',
            media: 'person.image'
        },
        prepare({ title, isPrimary, media }) {
            return {
                title: title || 'Untitled',
                subtitle: isPrimary ? '⭐ Primary Contact' : '',
                media
            }
        }
    }
})
