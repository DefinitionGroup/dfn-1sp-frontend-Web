import { ShareNetwork, SquaresFour } from "@phosphor-icons/react";
import React from "react";

export default {
    name: 'menu',
    title: 'Menu',
    type: 'document',

    // Editor groups (tabs)
    groups: [
        { name: 'general', title: 'General' },
        { name: 'navbar', title: 'Navbar' },
        { name: 'footer', title: 'Footer' },
        { name: 'social', title: 'Social' },
    ],

    i18n: {
        base: "de",
        languages: [
            { id: "en", title: "English" },
            { id: "de", title: "German" },
        ],
        referenceBehavior: "weak",
    },

    fields: [
        {
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            group: 'general',
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.language || 'de',
        },
        {
            name: 'channel',
            title: 'Channel',
            type: 'string',
            group: 'general',
            options: {
                list: [
                    { title: '1sp Website', value: '1spWeb' },
                    { title: 'MSM Website', value: 'msmWeb' },
                    { title: 'Studio CO2 Website', value: 'studioco2Web' },
                    { title: 'Flizr Website', value: 'flizrWeb' },
                    { title: 'Renaissance Website', value: 'renaissanceWeb' },
                ],
                layout: "radio",
            },
            readOnly: true,
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.channel || '1spWeb',
        },
        {
            name: "title",
            title: "Title",
            type: "string",
            description: "Automatically matches menu type",
            hidden: ({ document }: { document?: any }) => !!document?.menuType,
            initialValue: "Menu",
            group: 'general',
        },

        {
            name: "menuType",
            title: "Menu Type",
            type: "string",
            group: 'general',
            options: {
                list: [
                    { title: "Navbar", value: "Navbar" },
                    { title: "Footer", value: "Footer" },
                ],
                layout: "radio",
            },
            validation: (Rule: any) => Rule.required(),
        },

        /* Navbar Fields */
        {
            name: "menuItems",
            title: "Navigation Items",
            type: "array",
            group: 'navbar',
            of: [
                {
                    type: "object",
                    icon: SquaresFour,
                    fields: [
                        {
                            name: "page",
                            title: "Page",
                            type: "reference",
                            to: [{ type: "page" }],
                            validation: (Rule: any) => Rule.required(),
                            options: {
                                // dynamically filter referenced pages by menu's language
                                filter: ({ document }: { document?: { language?: string } }) => {
                                    if (!document?.language) {
                                        return { filter: '_id == "___"' }; // match nothing until language is set
                                    }
                                    return {
                                        filter: "language == $language",
                                        params: { language: document.language },
                                    };
                                },
                            },
                        },
                        {
                            name: "displayName",
                            title: "Display Name (Optional)",
                            type: "string",
                            description: "Leave empty to use the page title",
                        },
                    ],
                    preview: {
                        select: {
                            pageTitle: "page.title",
                            displayName: "displayName",
                            slug: "page.slug.current",
                        },
                        prepare({ pageTitle, displayName, slug }: { pageTitle?: string; displayName?: string; slug?: string }) {
                            return {
                                title: displayName || pageTitle || "Untitled",
                                subtitle: slug ? `/${slug}` : "No page selected",
                            };
                        },
                    },
                },
            ],
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Navbar",
        },

        /* Shared Fields */
        {
            name: "imageCloud",
            title: "Logo",
            type: "cloudinary.asset",
            description: "Main logo (used in both header and footer)",
            group: 'general',
        },

        /* Footer Fields */
        {
            name: "footerColumns",
            title: "Footer Columns",
            type: "array",
            group: 'footer',
            of: [
                {
                    type: "object",
                    icon: SquaresFour,
                    fields: [
                        {
                            name: "title",
                            title: "Column Title",
                            type: "string",
                            validation: (Rule: any) => Rule.required(),
                        },
                        {
                            name: "links",
                            title: "Links",
                            type: "array",
                            of: [
                                {
                                    type: "object",
                                    fields: [
                                        {
                                            name: "linkType",
                                            title: "Link Type",
                                            type: "string",
                                            options: {
                                                list: [
                                                    { title: "Internal Page", value: "internal" },
                                                    { title: "External URL", value: "external" },
                                                ],
                                                layout: "radio",
                                            },
                                            initialValue: "internal",
                                            validation: (Rule: any) => Rule.required(),
                                        },
                                        {
                                            name: "page",
                                            title: "Page",
                                            type: "reference",
                                            to: [{ type: "page" }],
                                            hidden: ({ parent }: { parent?: any }) =>
                                                parent?.linkType !== "internal" || parent?.isCaseLink,
                                            validation: (Rule: any) =>
                                                Rule.custom((page: any, context: any) => {
                                                    const { parent } = context as any;
                                                    if (parent?.linkType === "internal" && !parent?.isCaseLink && !page) {
                                                        return "Page is required for internal links";
                                                    }
                                                    return true;
                                                }),
                                            options: {
                                                filter: ({ document }: { document?: { language?: string } }) => {
                                                    if (!document?.language) {
                                                        return { filter: '_id == "___"' };
                                                    }
                                                    return {
                                                        filter: "language == $language",
                                                        params: { language: document.language },
                                                    };
                                                },
                                            },
                                        },
                                        {
                                            name: "isCaseLink",
                                            title: "The link is a case",
                                            type: "boolean",
                                            initialValue: false,
                                            hidden: ({ parent }: { parent?: any }) =>
                                                parent?.linkType !== "internal",
                                        },
                                        {
                                            name: "case",
                                            title: "Case",
                                            type: "reference",
                                            to: [{ type: "caseStudy" }],
                                            hidden: ({ parent }: { parent?: any }) =>
                                                parent?.linkType !== "internal" || !parent?.isCaseLink,
                                            validation: (Rule: any) =>
                                                Rule.custom((val: any, context: any) => {
                                                    const { parent } = context as any;
                                                    if (parent?.linkType === "internal" && parent?.isCaseLink && !val) {
                                                        return "Case is required when 'The link is a case' is selected";
                                                    }
                                                    return true;
                                                }),
                                            options: {
                                                filter: ({ document }: { document?: { language?: string } }) => {
                                                    if (!document?.language) {
                                                        return { filter: '_id == "___"' };
                                                    }
                                                    return {
                                                        filter: "language == $language",
                                                        params: { language: document.language },
                                                    };
                                                },
                                            },
                                        },
                                        {
                                            name: "externalUrl",
                                            title: "External URL",
                                            type: "url",
                                            hidden: ({ parent }: { parent?: any }) =>
                                                parent?.linkType !== "external",
                                            validation: (Rule: any) =>
                                                Rule.custom((url: any, context: any) => {
                                                    const { parent } = context as any;
                                                    if (parent?.linkType === "external" && !url) {
                                                        return "URL is required for external links";
                                                    }
                                                    return true;
                                                }),
                                        },
                                        {
                                            name: "displayName",
                                            title: "Link Text",
                                            type: "string",
                                            validation: (Rule: any) => Rule.required(),
                                        },
                                    ],
                                    preview: {
                                        select: {
                                            displayName: "displayName",
                                            linkType: "linkType",
                                            slug: "page.slug.current",
                                            externalUrl: "externalUrl",
                                        },
                                        prepare({
                                            displayName,
                                            linkType,
                                            slug,
                                            externalUrl,
                                        }: {
                                            displayName?: string;
                                            linkType?: string;
                                            slug?: string;
                                            externalUrl?: string;
                                        }) {
                                            const destination = linkType === "external"
                                                ? externalUrl
                                                : slug ? `/${slug}` : "No page selected";
                                            return {
                                                title: displayName || "Untitled link",
                                                subtitle: `${linkType || "internal"} → ${destination}`,
                                            };
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    preview: {
                        select: {
                            title: "title",
                            links: "links",
                        },
                        prepare({ title, links }: { title?: string; links?: any[] }) {
                            const linkCount = links?.length || 0;
                            return {
                                title: title || "Untitled Column",
                                subtitle: `${linkCount} link${linkCount !== 1 ? 's' : ''}`,
                            };
                        },
                    },
                },
            ],
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
        },

        {
            name: "socialLinks",
            title: "Social Media Links",
            icon: ShareNetwork,
            type: "array",
            group: 'social',
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "icon",
                            title: "Social Icon",
                            type: "cloudinary.asset",
                            validation: (Rule: any) => Rule.required(),
                        },
                        {
                            name: "name",
                            title: "Name",
                            type: "string",
                            validation: (Rule: any) => Rule.required(),
                        },
                        {
                            name: "url",
                            title: "URL",
                            type: "url",
                            validation: (Rule: any) => Rule.required().uri({
                                scheme: ['http', 'https']
                            }),
                        },
                    ],
                    preview: {
                        select: {
                            title: "name",
                            subtitle: "url",
                            media: "icon",
                        },
                    },
                },
            ],
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
        },

        {
            name: "copyright",
            title: "Copyright Text",
            type: "string",
            group: 'footer',
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
        },
        /* Footer Fields */
        {
            name: "addressTitle",
            title: "Address Section Title",
            type: "string",
            group: 'footer',
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
        },
        {
            name: "locations",
            title: "Locations",
            type: "array",
            group: 'footer',
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "name",
                            title: "Location Name",
                            type: "string",
                            description: "e.g. Mallorca",
                        },
                        {
                            name: "address",
                            title: "Address",
                            type: "string",
                        }
                    ]
                }
            ]
        },

        {
            name: "validationRule",
            title: "Unique Menu Type Validation",
            type: "string",
            readOnly: true,
            hidden: true,
            group: 'general',
            validation: (Rule: any) =>
                Rule.custom(async (value: any, context: any) => {
                    const { document, getClient } = context;
                    if (
                        !document?.menuType ||
                        !document?.language ||
                        !document?.channel
                    ) {
                        return true;
                    }

                    const client = getClient({ apiVersion: "2023-10-09" });
                    const draftId = `drafts.${String(document._id).replace(/^drafts\./, "")}`;
                    const query = `count(*[_type == "menu" && menuType == $menuType && language == $language && channel == $channel && _id != $documentId && !(_id in [$draftId])])`;
                    const params = {
                        menuType: document.menuType,
                        language: document.language,
                        channel: document.channel,
                        documentId: String(document._id).replace(/^drafts\./, ""),
                        draftId,
                    };

                    try {
                        const count = await client.fetch(query, params);
                        if (count > 0) {
                            return `Only one ${document.menuType} menu is allowed per language and channel.`;
                        }
                    } catch (err) {
                        console.error("Validation query failed:", err);
                        return "Validation check failed, please try again.";
                    }

                    return true;
                }),
        },
    ],

    preview: {
        select: { menuType: 'menuType' },
        prepare({ menuType }: any) {
            return { title: menuType ? `${menuType} Menu` : 'Menu' }
        },
    },
}
