import { defineType, defineField } from 'sanity'
import { websiteChannelOptions } from '../../shared/channelOptions'

export default defineType({
    name: 'client',
    title: 'Client',
    type: 'document',

    // Groups for organizing fields in the editor
    groups: [
        { name: 'general', title: 'General' },
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
            initialValue: 'en',
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
            validation: (Rule) => Rule.required(),
            group: 'general',
        },
        {
            name: 'tagline',
            title: 'Tagline',
            type: 'string',
            description: 'A brief tagline or description for the client',
            group: 'general',
        },
        {
            name: 'logo',
            title: 'Logo',
            type: 'cloudinary.asset',
            description: 'Client logo',
            group: 'general',
        },
        {
            name: 'coordinateLat',
            title: 'Coordinate Latitude',
            type: 'number',
            description: 'Latitude coordinate for the client location',
            validation: (Rule) => Rule.min(-90).max(90),
            group: 'location',
        },
        {
            name: 'coordinateLon',
            title: 'Coordinate Longitude',
            type: 'number',
            description: 'Longitude coordinate for the client location',
            validation: (Rule) => Rule.min(-180).max(180),
            group: 'location',
        },
        {
            name: 'address',
            title: 'Address',
            type: 'string',
            description: 'Full address of the client',
            group: 'location',
        },
        {
            name: 'phone',
            title: 'Phone',
            type: 'string',
            description: 'Contact phone number',
            group: 'contact',
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.email(),
            group: 'contact',
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
            ],
            description: 'Case studies for this client. Use "Save & Sync Relationships" to automatically update the case studies with this client reference.',
            group: 'relations',
        },
        {
            name: 'people',
            title: 'Related People',
            type: 'array',
            of: [{ type: 'personReference' }],
            description: 'People associated with this client. Mark one as primary contact. Use "Save & Sync Relationships" to automatically update the people with this client reference.',
            group: 'relations',
        },
        {
            name: 'channel',
            title: 'Channel',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: websiteChannelOptions,
            },
            group: 'settings',
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
