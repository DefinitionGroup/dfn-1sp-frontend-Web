import { defineType, defineField } from 'sanity'
import { LuChartBarDecreasing } from 'react-icons/lu'
import { GiNetworkBars } from 'react-icons/gi'
import { CgLoadbarAlt } from 'react-icons/cg'

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
            of: [{ type: 'mediaGalleryItem' }],
            validation: (Rule) => Rule.max(4).warning('Maximum 4 media items recommended'),
            description: 'Upload up to 4 media items (images or videos) for use in the case study page',
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
                    name: 'metric',
                    title: 'Metric',
                    icon: GiNetworkBars,
                    fields: [
                        {
                            name: 'type',
                            title: 'Metric Type',
                            type: 'string',
                            options: {
                                list: [
                                    {
                                        title: 'Vertical Bar',
                                        value: 'vertical',
                                        icon: GiNetworkBars
                                    },
                                    {
                                        title: 'Horizontal Bar',
                                        value: 'horizontal',
                                        icon: LuChartBarDecreasing
                                    },
                                    {
                                        title: 'Positive/Negative',
                                        value: 'posNeg',
                                        icon: CgLoadbarAlt
                                    }
                                ],
                                layout: 'radio'
                            },
                            initialValue: 'vertical',
                            validation: (Rule) => Rule.required(),
                            description: 'Choose the visualization type for this metric'
                        },
                        {
                            name: 'label',
                            title: 'Label',
                            type: 'string',
                            description: 'Metric label (e.g., "Dwell Time", "Conversion Rate")',
                            validation: (Rule) => Rule.required()
                        },
                        {
                            name: 'value',
                            title: 'Value',
                            type: 'number',
                            description: 'Metric value (e.g., 20 for 20%, -15 for -15%)',
                            validation: (Rule) => Rule.required().custom((value, context: any) => {
                                const parent = context.parent;
                                const type = parent?.type;

                                // Only posNeg type can have negative values
                                if (type !== 'posNeg' && typeof value === 'number' && value < 0) {
                                    return 'Only Positive/Negative type can have negative values. Choose "Positive/Negative" type or use a positive value.';
                                }

                                return true;
                            })
                        }
                    ],
                    preview: {
                        select: {
                            type: 'type',
                            label: 'label',
                            value: 'value'
                        },
                        prepare({ type, label, value }) {
                            // Choose icon based on type using react-icons
                            let icon;
                            let typeLabel;

                            switch (type) {
                                case 'vertical':
                                    icon = GiNetworkBars;
                                    typeLabel = 'Vertical';
                                    break;
                                case 'horizontal':
                                    icon = LuChartBarDecreasing;
                                    typeLabel = 'Horizontal';
                                    break;
                                case 'posNeg':
                                    icon = CgLoadbarAlt;
                                    typeLabel = 'Pos/Neg';
                                    break;
                                default:
                                    icon = GiNetworkBars;
                                    typeLabel = 'Unknown';
                            }

                            return {
                                title: `${label}: ${value}%`,
                                subtitle: typeLabel,
                                media: icon
                            }
                        }
                    }
                }
            ],
            description: 'Key metrics and performance indicators. You can add multiple metrics of any type.',
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