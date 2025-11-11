import React from 'react'
import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'person',
    title: 'Person',
    type: 'document',
    groups: [
        { name: 'general', title: 'General' },
        { name: 'media', title: 'Media' },
        { name: 'contact', title: 'Contact' },
        { name: 'content', title: 'Content' },
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
            group: 'settings'
        }),
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
            group: 'general'
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
                        _type == "person" && 
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
            group: 'general'
        },
        {
            name: 'image',
            title: 'Image',
            type: 'cloudinary.asset',
            description: 'Person profile image',
            group: 'media'
        },
        {
            name: 'video',
            title: 'Video',
            type: 'cloudinary.asset',
            description: 'Person profile video',
            group: 'media'
        },
        // new fields to match MemberItem (altText, fullname, position, profileUrl, email)
        defineField({
            name: 'altText',
            title: 'Alt Text',
            type: 'string',
            description: 'Alt text / accessibility text for the person image (maps to altText in frontend)',
            group: 'media'
        }),
        defineField({
            name: 'fullname',
            title: 'Full Name',
            type: 'string',
            description: 'Full name of the person (maps to fullname in frontend)',
            group: 'general'
        }),
        defineField({
            name: 'position',
            title: 'Position',
            type: 'string',
            description: 'Role / position of the person (maps to position in frontend)',
            group: 'general'
        }),
        defineField({
            name: 'profileUrl',
            title: 'Profile URL',
            type: 'url',
            description: 'External profile link (e.g. LinkedIn) (maps to profileUrl in frontend)',
            group: 'contact'
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.email(),
            description: 'Contact email (maps to email in frontend)',
            group: 'contact'
        }),
        {
            name: 'tagline',
            title: 'Tagline',
            type: 'string',
            description: 'A brief tagline or title for the person',
            group: 'general'
        },
        {
            name: 'content',
            title: 'Free Text Content',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H1', value: 'h1' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'H4', value: 'h4' },
                        { title: 'Quote', value: 'blockquote' }
                    ],
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Numbered', value: 'number' }
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Code', value: 'code' }
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {
                                        name: 'href',
                                        type: 'url',
                                        title: 'URL'
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            group: 'content'
        },
        {
            name: 'client',
            title: 'Related Clients',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'client' }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || 'de';
                            return {
                                filter: '_type == "client" && language == $language',
                                params: { language: currentLanguage }
                            };
                        }
                    }
                }
            ],
            description: 'Clients this person is associated with. Use "Save & Sync Relationships" to automatically update the client with this person reference.',
            group: 'general'
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
            group: 'settings'
        },
    ],
    preview: {
        // select raw fields (we'll inspect for common url locations)
        select: {
            title: 'name',
            subtitle: 'tagline',
            image: 'image',
            video: 'video'
        },
        prepare(selection: { title?: string; subtitle?: string; image?: any; video?: any }) {
            const { title, subtitle, image, video } = selection

            // Helper to try common URL locations on cloudinary asset objects
            const getUrl = (asset: any) => {
                if (!asset) return undefined
                // common direct url field
                if (typeof asset === 'string') return asset
                if (asset.url) return asset.url
                if (asset.secure_url) return asset.secure_url
                if (asset.secureUrl) return asset.secureUrl
                if (asset.asset && (asset.asset.url || asset.asset.secure_url || asset.asset.secureUrl)) {
                    return asset.asset.url || asset.asset.secure_url || asset.asset.secureUrl
                }
                // fallback: some custom cloudinary types include a public_id — try to construct,
                // but avoid constructing if uncertain. Return undefined here.
                return undefined
            }

            const imageUrl = getUrl(image)
            const videoUrl = getUrl(video)

            let media: any = undefined
            if (imageUrl) {
                media = React.createElement('img', {
                    src: imageUrl,
                    alt: title || 'person image',
                    style: { width: '100%', height: '100%', objectFit: 'cover' }
                })
            } else if (videoUrl) {
                // small muted video preview if no image available
                media = React.createElement('video', {
                    src: videoUrl,
                    muted: true,
                    autoPlay: true,
                    loop: true,
                    playsInline: true,
                    style: { width: '100%', height: '100%', objectFit: 'cover' }
                })
            }

            return {
                title,
                subtitle,
                media
            }
        }
    }
})
