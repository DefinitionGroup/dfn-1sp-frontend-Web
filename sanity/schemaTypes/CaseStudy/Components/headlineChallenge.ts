import { defineType, defineField } from "sanity";
import { FiTarget } from "react-icons/fi";

export default defineType({
    name: "headlineChallenge",
    title: "Headline Challenge",
    type: "object",
    icon: FiTarget,
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
            name: "headline",
            title: "Headline",
            type: "string",
            description: "Headline text for the challenge section",
            group: "content",

        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Main title text for the challenge section",
            group: "content",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            description: "Optional description text displayed below the title",
            rows: 3,
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
            description: "description",
        },
        prepare({ title, description }) {
            return {
                title: title || "Headline Challenge",
                subtitle: description || "Challenge section",
                media: FiTarget,
            };
        },
    },
});
