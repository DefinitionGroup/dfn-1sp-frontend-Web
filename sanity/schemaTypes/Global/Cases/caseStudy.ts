import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'caseStudy',
    title: 'Case Study',
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
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required()
        },
        {
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
                        document?: { _id: string; language?: string };
                        getClient: (options: { apiVersion: string }) => any;
                    }
                ) => {
                    const { document, getClient } = context;
                    const language = document?.language || "de";
                    const client = getClient({ apiVersion: "2021-03-25" });

                    const baseId = document?._id.replace(/^drafts\./, "");

                    const query = `*[
                        _type == "caseStudy" && 
                        slug.current == $slug && 
                        language == $language && 
                        !(_id in [$draftId, $publishedId])
                    ][0]`;
                    const params = {
                        slug: slug,
                        language: language,
                        draftId: `drafts.${baseId}`,
                        publishedId: baseId,
                    };

                    const existingDoc = await client.fetch(query, params);
                    return !existingDoc;
                },
            },
            validation: (Rule) => Rule.required()
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4
        },
        {
            name: 'mainImage',
            title: 'Main Image',
            type: 'cloudinary.asset'
        },
        {
            name: 'imageGallery',
            title: 'Image Gallery',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'image',
                            title: 'Image',
                            type: 'cloudinary.asset'
                        },
                        {
                            name: 'alt',
                            title: 'Alt Text',
                            type: 'string'
                        },
                        {
                            name: 'caption',
                            title: 'Caption',
                            type: 'string'
                        }
                    ]
                }
            ]
        },
        {
            name: 'units',
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
                }
            ]
        },
        {
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        },
        {
            name: 'isPublished',
            title: 'Published',
            type: 'boolean',
            initialValue: true
        },
        {
            name: 'channel',
            title: 'Channel',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: '1sp Website', value: '1spWeb' },
                    { title: 'MSM Website', value: 'msmWeb' },
                    { title: 'Studio CO2 Website', value: 'studioco2Web' },
                ],
            },
        },
    ],
    preview: {
        select: {
            title: 'title',
            media: 'mainImage',
            isPublished: 'isPublished'
        },
        prepare(selection) {
            const { title, media, isPublished } = selection
            return {
                title,
                subtitle: isPublished ? 'Published' : 'Draft',
                media
            }
        }
    },
    orderings: [
        {
            title: 'Published Date, New',
            name: 'publishedAtDesc',
            by: [
                { field: 'publishedAt', direction: 'desc' }
            ]
        }
    ]
})