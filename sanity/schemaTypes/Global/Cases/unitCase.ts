import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'unit',
    title: 'Unit',
    type: 'document',
    groups: [
        { name: 'general', title: 'General' },
        { name: 'media', title: 'Media' },
        { name: 'contact', title: 'Contact' },
        { name: 'location', title: 'Location' },
        { name: 'relations', title: 'Relations' },
        { name: 'settings', title: 'Settings' },
    ],
    fields: [
        defineField({
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            initialValue: 'de',
            description: 'Managed by i18n tooling; do not edit manually.',
            group: 'settings',
        }),
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
            group: 'general',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            group: 'general',
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
            description: 'e.g., "Together. One Superagency"',
            group: 'general',
        },
        {
            name: "logo",
            title: "Unit Logo",
            type: "cloudinary.asset",
            description: "Upload the unit's logo",
            group: 'media',
        },
        {
            name: "backgroundImage",
            title: "Unit Background Image",
            type: "cloudinary.asset",
            description: "Upload the unit's background image",
            group: 'media',
        },
        {
            name: 'cta',
            title: 'Call to Action (CTA)',
            type: 'cta',
            group: 'general',
        },


        {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
            group: 'general',
        },

        // Location fields
        {
            name: 'coordinateLat',
            title: 'Coordinate LAT',
            type: 'number',
            description: 'Latitude (decimal). Range: -90 to 90.',
            validation: (Rule) => Rule.min(-90).max(90),
            group: 'location',
        },
        {
            name: 'coordinateLon',
            title: 'Coordinate LON',
            type: 'number',
            description: 'Longitude (decimal). Range: -180 to 180.',
            validation: (Rule) => Rule.min(-180).max(180),
            group: 'location',
        },

        // Contact group
        {
            name: 'address',
            title: 'Address',
            type: 'object',
            group: 'contact',
            fields: [
                { name: 'street', title: 'Street', type: 'string' },
                { name: 'postalCode', title: 'Postal Code', type: 'string' },
                { name: 'city', title: 'City', type: 'string' },
                { name: 'country', title: 'Country', type: 'string' },
            ],
            options: { collapsible: true, collapsed: false }
        },
        {
            name: 'phone',
            title: 'Phone',
            type: 'string',
            description: 'Contact phone number',
            validation: (Rule) =>
                Rule.min(4).max(30), // keep simple; adjust to your preferred pattern
            group: 'contact',
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
            description: 'Contact email address',
            validation: (Rule) => Rule.email(),
            group: 'contact',
        },

        {
            name: 'caseStudies',
            title: 'Related Case Studies',
            type: 'array',
            group: 'relations',
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
            ],
            description: 'Case studies that involve this unit. This field is automatically synced when case studies reference this unit.',

        },
        {
            name: 'isActive',
            title: 'Is Active',
            type: 'boolean',
            initialValue: true,
            group: 'settings',
        },
        defineField({
            name: 'services',
            title: 'Services',
            type: 'array',
            of: [
                {
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
                },
            ],
            description: 'Services related to this unit. Use "Save & Sync Relationships" to automatically update the services with this unit reference.',
            group: 'relations',
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