import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'client',
    title: 'Client',
    type: 'document',
    fields: [
        defineField({
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            initialValue: 'en',
            description: 'Managed by i18n tooling; do not edit manually.',
        }),
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required()
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
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
                        _type == "client" && 
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
            name: 'tagline',
            title: 'Tagline',
            type: 'string',
            description: 'A brief tagline or description for the client'
        },
        {
            name: 'logo',
            title: 'Logo',
            type: 'cloudinary.asset',
            description: 'Client logo'
        },
        {
            name: 'coordinateLat',
            title: 'Coordinate Latitude',
            type: 'number',
            description: 'Latitude coordinate for the client location',
            validation: (Rule) => Rule.min(-90).max(90)
        },
        {
            name: 'coordinateLon',
            title: 'Coordinate Longitude',
            type: 'number',
            description: 'Longitude coordinate for the client location',
            validation: (Rule) => Rule.min(-180).max(180)
        },
        {
            name: 'address',
            title: 'Address',
            type: 'string',
            description: 'Full address of the client'
        },
        {
            name: 'phone',
            title: 'Phone',
            type: 'string',
            description: 'Contact phone number'
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.email()
        },
        {
            name: 'caseStudies',
            title: 'Related Case Studies',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'caseStudy' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "caseStudy" && language == $language',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                }
            ]
        },
        {
            name: 'people',
            title: 'Related People',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'person' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "person" && language == $language',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                }
            ]
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
            title: 'name',
            subtitle: 'tagline',
            media: 'logo'
        }
    }
})
