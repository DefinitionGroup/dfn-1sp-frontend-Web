import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'page',
    title: 'Page',
    type: 'document',

    fields: [
        defineField({
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.language || 'de',
            description: 'Managed by i18n tooling; do not edit manually.',
        }),



        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),

        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
                slugify: (input: string) => {
                    const baseSlug = input
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]+/g, "")
                        .replace(/--+/g, "-")
                        .replace(/^-+/, "")
                        .replace(/-+$/, "");
                    return baseSlug;
                },
                isUnique: async (
                    slug: string,
                    context: {
                        document?: { channel?: string; _id: string; language?: string };
                        getClient: (options: { apiVersion: string }) => any;
                    }
                ) => {
                    const { document, getClient } = context;
                    const channel = document?.channel || "1spWeb";
                    const language = document?.language || "de";
                    const client = getClient({ apiVersion: "2021-03-25" });

                    const baseId = document?._id.replace(/^drafts\./, "");

                    const query = `*[
                        _type == "page" && 
                        slug.current == $slug && 
                        channel == $channel && 
                        language == $language && 
                        !(_id in [$draftId, $publishedId])
                    ][0]`;
                    const params = {
                        slug: slug,
                        channel: channel,
                        language: language,
                        draftId: `drafts.${baseId}`,
                        publishedId: baseId,
                    };

                    const existingDoc = await client.fetch(query, params);
                    return !existingDoc;
                },
            },
            validation: (Rule: any) => Rule.required(),
        }),
        defineField({
            name: 'metadata',
            title: 'Metadata',
            type: 'object',
            options: { collapsible: true, collapsed: true },
            fields: [
                defineField({ name: 'title', title: 'Meta Title', type: 'string' }),
                defineField({ name: 'description', title: 'Meta Description', type: 'text' }),
                defineField({ name: 'image', title: 'Meta Image', type: 'image' }),
                defineField({ name: 'keywords', title: 'Meta Keywords', type: 'array', of: [{ type: 'string' }] })
            ]
        }),

        // channel-specific content arrays (hidden when not matching channel)
        defineField({
            name: 'content1sp',
            title: 'Content 1SP',
            type: 'array',
            of: [
                { type: 'showtimeGallery' },
                { type: 'heroShowTime' },
                { type: 'sublineComponent' },
                { type: 'oneSPHeader' }
            ],
            hidden: ({ parent }: any) => parent?.channel !== '1spWeb',
        }),

        defineField({
            name: 'contentMSM',
            title: 'Content MSM',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }: any) => parent?.channel !== 'msmWeb',
        }),

        defineField({
            name: 'contentStudioCO2',
            title: 'Content StudioCO2',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }: any) => parent?.channel !== 'studioco2Web',
        }),
        defineField({
            name: 'contentStudioFlizr',
            title: 'Content StudioFlizr',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }: any) => parent?.channel !== 'flizrWeb',
        }),
        defineField({
            name: 'channel',
            title: 'Channel',
            type: 'string',
            options: {
                list: [
                    { title: '1sp Website', value: '1spWeb' },
                    { title: 'MSM Website', value: 'msmWeb' },
                    { title: 'Studio CO2 Website', value: 'studioco2Web' },
                    { title: 'Flizr Website', value: 'flizrWeb' },
                ],
            },
            readOnly: true,
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.channel || '1spWeb',
            description: 'Automatically set from creation location',
        }),
    ],

    preview: {
        select: { title: 'title', channel: 'channel' },
        prepare({ title, channel }: any) {
            return {
                title: title || 'Untitled Page',
                subtitle: channel || '',
            }
        },
    },
})
