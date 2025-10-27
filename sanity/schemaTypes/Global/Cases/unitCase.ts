import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'unit',
    title: 'Unit',
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
                        _type == "unit" && 
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
            title: 'Tagline/Motto',
            type: 'string',
            description: 'e.g., "Together. One Superagency"'
        },
        {
            name: "logo",
            title: "Unit Logo",
            type: "cloudinary.asset",
            description: "Upload the unit's logo",
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4
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
            name: 'isActive',
            title: 'Is Active',
            type: 'boolean',
            initialValue: true
        },
        defineField({
            name: 'services',
            title: 'Services',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'services' }],
                },
            ],
            description: 'Services related to this unit. Changes here will automatically sync with the Services.',
        })
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'tagline',
            media: 'logo'
        },
        prepare(selection) {
            const { title, subtitle, media } = selection
            return {
                title,
                subtitle: subtitle || 'No tagline',
                media
            }
        }
    },
    orderings: [
        {
            title: 'Name A-Z',
            name: 'nameAsc',
            by: [
                { field: 'name', direction: 'asc' }
            ]
        }
    ]
})