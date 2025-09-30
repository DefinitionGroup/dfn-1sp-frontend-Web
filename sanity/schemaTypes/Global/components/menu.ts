import { IoShareSocialOutline } from 'react-icons/io5'
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaGithub,
    FaYoutube,
    FaElementor,
} from "react-icons/fa";
import React from "react";

export default {
    name: 'menu',
    title: 'Menu',
    type: 'document',

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
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.language || 'de',
        },
        {
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
        },

        {
            name: "menuType",
            title: "Menu Type",
            type: "string",
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
            of: [
                {
                    type: "object",
                    icon: FaElementor,
                    fields: [
                        {
                            name: "page",
                            title: "Page",
                            type: "reference",
                            to: [{ type: "page" }],
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
                            title: "Display Name",
                            type: "string",
                        },
                    ],
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
        },

        /* Footer Fields */
        {
            name: "footerColumns",
            title: "Footer Columns",
            type: "array",
            of: [
                {
                    type: "object",
                    icon: FaElementor,
                    fields: [
                        {
                            name: "title",
                            title: "Column Title",
                            type: "string",
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
                                            name: "title",
                                            title: "Title",
                                            type: "string",
                                            description: "Automatically matches link name",
                                            hidden: ({ document }: { document?: any }) =>
                                                !!document?.menuType,
                                            initialValue: "Menu",
                                        },
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
                                        },
                                        {
                                            name: "page",
                                            title: "Page",
                                            type: "reference",
                                            to: [{ type: "page" }],
                                            hidden: ({ parent }: { parent?: any }) =>
                                                parent?.linkType !== "internal",
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
                                        },
                                        {
                                            name: "displayName",
                                            title: "Link Name",
                                            type: "string",
                                        },
                                    ],
                                    preview: {
                                        select: {
                                            title: "displayName",
                                            subtitle: "linkType",
                                        },
                                        prepare({
                                            title,
                                            subtitle,
                                        }: {
                                            title?: string;
                                            subtitle?: string;
                                        }) {
                                            return {
                                                title: title || "Untitled link",
                                                subtitle: subtitle ? `${subtitle} link` : "",
                                            };
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
        },

        {
            name: "socialLinks",
            title: "Social Media Links",
            icon: IoShareSocialOutline,
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        {
                            name: "platform",
                            type: "string",
                            options: {
                                list: [
                                    { title: "Facebook", value: "Facebook" },
                                    { title: "Instagram", value: "Instagram" },
                                    { title: "X (Twitter)", value: "X" },
                                    { title: "GitHub", value: "GitHub" },
                                    { title: "YouTube", value: "YouTube" },
                                ],
                            },
                        },
                        {
                            name: "url",
                            title: "Profile URL",
                            type: "url",
                        },
                    ],
                    preview: {
                        select: {
                            platform: "platform",
                            url: "url",
                        },
                        prepare({ platform, url }: { platform?: string; url?: string }) {
                            const icons: Record<string, React.ElementType> = {
                                Facebook: FaFacebook,
                                Instagram: FaInstagram,
                                X: FaTwitter,
                                GitHub: FaGithub,
                                YouTube: FaYoutube,
                            };

                            return {
                                title: platform,
                                subtitle: url,
                                media: icons[platform || ""] ? React.createElement(icons[platform || ""]) : null,
                            };
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
            hidden: ({ parent }: { parent?: any }) => parent?.menuType !== "Footer",
        },

        {
            name: "validationRule",
            title: "Unique Menu Type Validation",
            type: "string",
            readOnly: true,
            hidden: true,
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