import { defineType, defineField } from "sanity";
import { FiFileText } from "react-icons/fi";

export default defineType({
    name: "casesIntro",
    title: "Cases Intro Section",
    type: "object",
    icon: FiFileText,
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
            name: "title",
            title: "Title",
            type: "string",
            description: "Main title text",
            group: "content",
            validation: (Rule) => Rule.required(),
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
                media: FiFileText,
            };
        },
    },
});
