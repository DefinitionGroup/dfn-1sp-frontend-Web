import { defineType, defineField } from "sanity";
import { FileText } from "@phosphor-icons/react";

export default defineType({
    name: "casesIntro",
    title: "Cases Intro Section",
    type: "object",
    icon: FileText,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout & Style" },
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
            title: "Main Title Tag",
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
            description: "Secondary subtitle text",
            group: "content",
        }),
        defineField({
            name: "showGridBackground",
            title: "Show Grid Background",
            type: "boolean",
            initialValue: true,
            group: "layout",
        }),
        defineField({
            name: "showHamburgerMenu",
            title: "Show Hamburger Gradient Menu",
            type: "boolean",
            initialValue: true,
            group: "layout",
        }),
        defineField({
            name: "paddingY",
            title: "Vertical Padding",
            type: "string",
            initialValue: "16",
            group: "layout",
            options: {
                list: [
                    { title: "Small (py-8)", value: "8" },
                    { title: "Medium (py-16)", value: "16" },
                    { title: "Large (py-24)", value: "24" },
                    { title: "Extra Large (py-32)", value: "32" },
                ],
                layout: "radio",
            },
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "subtitle",
        },
        prepare({ title, subtitle }) {
            return {
                title: title || "Cases Intro Section",
                subtitle: subtitle || "No subtitle",
                media: FileText,
            };
        },
    },
});
