import { defineType } from 'sanity'

export default defineType({
    name: 'clientReference',
    title: 'Client Reference',
    type: 'object',
    fields: [
        {
            name: 'client',
            title: 'Client',
            type: 'reference',
            to: [{ type: 'client' }],
            validation: (Rule) => Rule.required(),
            options: {
                filter: ({ parent, document }: { parent: any; document: any }) => {
                    const currentLanguage = document?.language || 'de';
                    return {
                        filter: '_type == "client" && language == $language',
                        params: { language: currentLanguage }
                    };
                }
            }
        },
        {
            name: 'isPrimary',
            title: 'Primary Client',
            type: 'boolean',
            description: 'Mark this client as the primary client for this relationship',
            initialValue: false
        }
    ],
    preview: {
        select: {
            title: 'client.name',
            isPrimary: 'isPrimary',
            media: 'client.logo'
        },
        prepare({ title, isPrimary, media }) {
            return {
                title: title || 'Untitled',
                subtitle: isPrimary ? '⭐ Primary Client' : '',
                media
            }
        }
    }
})
