import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'caseStudy',
    title: 'Case Study',
    type: 'document',
    groups: [
        { name: 'content', title: 'Content' },
        { name: 'media', title: 'Media' },
        { name: 'relations', title: 'Relations' },
        { name: 'composable', title: 'Composable Items' },
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
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
            group: 'content'
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            group: 'content',
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
            rows: 4,
            group: 'content'
        },
        {
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string',
            description: 'A short subtitle or tagline for the case study',
            group: 'content'
        },
        {
            name: 'mainImage',
            title: 'Main Image',
            type: 'cloudinary.asset',
            group: 'media'
        },
        {
            name: 'mainVideo',
            title: 'Main Video',
            type: 'cloudinary.asset',
            description: 'Optional video to display instead of main image',
            group: 'media'
        },
        {
            name: 'websiteUrl',
            title: 'Website URL',
            type: 'url',
            description: 'External website URL',
            group: 'content'
        },
        {
            name: 'websiteUrlText',
            title: 'Website URL Text',
            type: 'string',
            description: 'Text for the website link button (e.g., "Visit Website")',
            group: 'content'
        },
        {
            name: 'mediaGallery',
            title: 'Media Gallery',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'mediaType',
                            title: 'Media Type',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Image', value: 'image' },
                                    { title: 'Video', value: 'video' }
                                ]
                            },
                            validation: (Rule) => Rule.required()
                        },
                        {
                            name: 'image',
                            title: 'Image',
                            type: 'cloudinary.asset',
                            hidden: ({ parent }: { parent: any }) => parent?.mediaType !== 'image',
                            validation: (Rule) => Rule.custom((image, context: any) => {
                                const parent = context.parent;
                                if (parent?.mediaType === 'image' && !image) {
                                    return 'Image is required when media type is Image';
                                }
                                return true;
                            })
                        },
                        {
                            name: 'video',
                            title: 'Video',
                            type: 'cloudinary.asset',
                            hidden: ({ parent }: { parent: any }) => parent?.mediaType !== 'video',
                            validation: (Rule) => Rule.custom((video, context: any) => {
                                const parent = context.parent;
                                if (parent?.mediaType === 'video' && !video) {
                                    return 'Video is required when media type is Video';
                                }
                                return true;
                            })
                        },
                        {
                            name: 'alt',
                            title: 'Alt Text / Description',
                            type: 'string',
                            description: 'Alternative text for images or description for videos'
                        },
                        {
                            name: 'caption',
                            title: 'Caption',
                            type: 'string'
                        }
                    ],
                    preview: {
                        select: {
                            mediaType: 'mediaType',
                            image: 'image',
                            video: 'video',
                            alt: 'alt'
                        },
                        prepare({ mediaType, image, video, alt }) {
                            return {
                                title: alt || 'Untitled',
                                subtitle: mediaType === 'image' ? 'Image' : 'Video',
                                media: image || video
                            }
                        }
                    }
                }
            ],
            validation: (Rule) => Rule.max(4).warning('Maximum 4 media items recommended'),
            description: 'Upload up to 4 media items (images or videos) for use in the case study page',
            group: 'media'
        },
        {
            name: 'imageGallery',
            title: 'Image Gallery (Legacy)',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'image',
                            title: 'Image',
                            type: 'cloudinary.asset',
                            group: 'media'
                        },
                        {
                            name: 'alt',
                            title: 'Alt Text',
                            type: 'string',
                            group: 'media'
                        },
                        {
                            name: 'caption',
                            title: 'Caption',
                            type: 'string',
                            group: 'media'
                        }
                    ]
                }
            ],
            hidden: true,
            group: 'media'
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
            ],
            group: 'relations'
        },
        {
            name: 'client',
            title: 'Related Client',
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
            },
            group: 'relations'
        },
        {
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            group: 'settings'
        },
        {
            name: 'isPublished',
            title: 'Published',
            type: 'boolean',
            initialValue: true,
            group: 'settings'
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
        {
            name: 'connectedDataCarouselPromo1SP',
            title: 'ConnectedDataCarousel Promo 1SP',
            type: 'boolean',
            description: 'Include this case study in the Smart Carousel for 1SP Website',
            initialValue: false,
            hidden: ({ document }: { document: any }) => {
                const channels = document?.channel || [];
                return !channels.includes('1spWeb');
            },
            group: 'settings'
        },
        {
            name: 'connectedDataCarouselPromoMSM',
            title: 'ConnectedDataCarousel Promo MSM',
            type: 'boolean',
            description: 'Include this case study in the Smart Carousel for MSM Website',
            initialValue: false,
            hidden: ({ document }: { document: any }) => {
                const channels = document?.channel || [];
                return !channels.includes('msmWeb');
            },
            group: 'settings'
        },
        {
            name: 'connectedDataCarouselPromoStudioCO2',
            title: 'ConnectedDataCarousel Promo Studio CO2',
            type: 'boolean',
            description: 'Include this case study in the Smart Carousel for Studio CO2 Website',
            initialValue: false,
            hidden: ({ document }: { document: any }) => {
                const channels = document?.channel || [];
                return !channels.includes('studioco2Web');
            },
            group: 'settings'
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
            description: 'Services related to this case study. Changes here will automatically sync with the Services.',
            group: 'relations'
        }),
        defineField({
            name: 'challenges',
            title: 'Challenges',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'List of challenges faced in this case study',
            group: 'composable'
        }),
        defineField({
            name: 'solution',
            title: 'Solution',
            type: 'text',
            description: 'Description of the solution provided',
            rows: 6,
            group: 'composable'
        }),
        defineField({
            name: 'approachToSolution',
            title: 'Approach to Solution',
            type: 'text',
            description: 'Detailed approach taken to solve the problem',
            rows: 6,
            group: 'composable'
        }),
        defineField({
            name: 'metrics',
            title: 'Metrics',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'label',
                            title: 'Label',
                            type: 'string',
                            description: 'Metric label (e.g., "Dwell Time")',
                            validation: (Rule) => Rule.required()
                        },
                        {
                            name: 'value',
                            title: 'Value',
                            type: 'number',
                            description: 'Metric value (e.g., 20 for 20%)',
                            validation: (Rule) => Rule.required()
                        }
                    ],
                    preview: {
                        select: {
                            label: 'label',
                            value: 'value'
                        },
                        prepare({ label, value }) {
                            return {
                                title: `${label}: ${value}%`
                            }
                        }
                    }
                }
            ],
            description: 'Key metrics and performance indicators',
            group: 'composable'
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'subtitle',
            media: 'mainImage',
            clientLogo: 'client.logo',
            isPublished: 'isPublished'
        },
        prepare(selection) {
            const { title, subtitle, media, clientLogo, isPublished } = selection
            return {
                title,
                subtitle: subtitle || (isPublished ? 'Published' : 'Draft'),
                media: clientLogo || media
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