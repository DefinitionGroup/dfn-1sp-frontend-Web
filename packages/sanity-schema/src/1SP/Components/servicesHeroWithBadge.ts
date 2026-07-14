import { defineType, defineField } from "sanity";
import { Layout } from "@phosphor-icons/react";
import { hideForFlzrPage } from "../../shared/flzrVisibility";

export default defineType({
    name: "servicesHeroWithBadge",
    title: "Services Hero with Badge",
    type: "object",
    icon: Layout,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "badge", title: "Badge" },
        { name: "media", title: "Background Media" },
        { name: "cta", title: "CTA Section" },
        { name: "list", title: "List Items" },
        { name: "layout", title: "Layout" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        defineField({
            name: "navPointName",
            title: "Navigation Point Name",
            type: "string",
            description: "Optional custom name to display in the vertical navigation minimap.",
            group: "navigation",
        }),
        defineField({
            name: "hideFromNav",
            title: "Hide from Navigation",
            type: "boolean",
            description: "If enabled, this section will not appear in the vertical navigation minimap.",
            initialValue: false,
            group: "navigation",
        }),

        // Badge fields
        defineField({
            name: "badgeText",
            title: "Badge Text",
            type: "string",
            group: "badge",
            hidden: hideForFlzrPage,
        }),
        defineField({
            name: "badgeSubtitle",
            title: "Badge Subtitle",
            type: "string",
            group: "badge",
            hidden: hideForFlzrPage,
        }),
        defineField({
            name: "badgeNumber",
            title: "Badge Number",
            type: "string",
            initialValue: "001",
            group: "badge",
            hidden: hideForFlzrPage,
        }),

        // Background media
        defineField({
            name: "useVideo",
            title: "Use Video Background",
            type: "boolean",
            initialValue: false,
            group: "media",
        }),
        defineField({
            name: "backgroundImage",
            title: "Background Image",
            type: "cloudinaryImage",
            description: "Background image from Cloudinary",
            group: "media",
            hidden: ({ parent }) => parent?.useVideo === true,
        }),
        defineField({
            name: "backgroundVideo",
            title: "Background Video",
            type: "cloudinaryImage",
            description: "Background video from Cloudinary",
            group: "media",
            hidden: ({ parent }) => parent?.useVideo === false,
        }),
        defineField({
            name: "enableParallax",
            title: "Enable Parallax Effect",
            type: "boolean",
            initialValue: false,
            group: "media",
        }),

        // Main content
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Main title text",
            group: "content",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "titleTag",
            title: "Title Tag",
            type: "string",
            description: "Choose whether the main title renders as an h1 or h2.",
            initialValue: "h2",
            group: "content",
            options: {
                list: [
                    { title: "H1", value: "h1" },
                    { title: "H2", value: "h2" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "subtitle",
            title: "Subtitle",
            type: "string",
            description: "Subtitle text below title",
            group: "content",
        }),

        // CTA section
        defineField({
            name: "showCta",
            title: "Show CTA",
            type: "boolean",
            description: "Toggle the CTA content on or off.",
            initialValue: true,
            group: "cta",
        }),
        defineField({
            name: "cta",
            title: "CTA Component",
            type: "ctaMiniComponent",
            description: "Call-to-action section",
            group: "cta",
            hidden: ({ parent }) => parent?.showCta === false,
        }),

        // List items
        defineField({
            name: "listItems",
            title: "List Items",
            type: "array",
            of: [{ type: "listItem" }],
            description: "Add list items to display",
            group: "list",
        }),

        // Layout
        defineField({
            name: "minHeight",
            title: "Minimum Height",
            type: "string",
            initialValue: "66vh",
            group: "layout",
            options: {
                list: [
                    { title: "50vh", value: "50vh" },
                    { title: "66vh", value: "66vh" },
                    { title: "75vh", value: "75vh" },
                    { title: "100vh", value: "100vh" },
                ],
            },
        }),
        defineField({
            name: "paddingY",
            title: "Vertical Padding",
            type: "string",
            initialValue: "32",
            group: "layout",
            options: {
                list: [
                    { title: "Small (py-16)", value: "16" },
                    { title: "Medium (py-24)", value: "24" },
                    { title: "Large (py-32)", value: "32" },
                    { title: "Extra Large (py-40)", value: "40" },
                ],
                layout: "radio",
            },
        }),
    ],
    preview: {
        select: {
            title: "title",
            badgeText: "badgeText",
        },
        prepare({ title, badgeText }) {
            return {
                title: title || "Services Hero with Badge",
                subtitle: badgeText || "No badge text",
                media: Layout,
            };
        },
    },
});
