import { defineType, defineField } from "sanity";
import { FiColumns } from "react-icons/fi";

export default defineType({
    name: "tabbedContentSection",
    title: "Tabbed Content Section",
    type: "object",
    icon: FiColumns,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "tabs", title: "Tab Settings" },
        { name: "layout", title: "Layout & Style" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        // NAVIGATION
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

        // CONTENT
        defineField({
            name: "title",
            title: "Section Title",
            type: "string",
            description: "Optional title for the entire section",
            group: "content",
        }),
        defineField({
            name: "introHeading",
            title: "Introduction Heading",
            type: "text",
            rows: 3,
            description: "Optional introductory heading text (can be multi-line)",
            group: "content",
        }),
        defineField({
            name: "introSubheading",
            title: "Introduction Subheading",
            type: "text",
            rows: 3,
            description: "Optional secondary intro text with different styling",
            group: "content",
        }),

        // TAB SETTINGS
        defineField({
            name: "tab1Label",
            title: "Tab 1 Label",
            type: "string",
            description: "Label for the first tab",
            group: "tabs",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "tab2Label",
            title: "Tab 2 Label",
            type: "string",
            description: "Label for the second tab",
            group: "tabs",
            validation: (Rule) => Rule.required(),
        }),

        // CONTENT TAB 1
        defineField({
            name: "content1",
            title: "Content (Tab 1)",
            type: "array",
            description: "Rich text content for the first tab",
            group: "content",
            validation: (Rule) => Rule.required(),
            of: [
                {
                    type: "block",
                    styles: [
                        { title: "Normal", value: "normal" },
                        { title: "H3", value: "h3" },
                        { title: "H4", value: "h4" },
                        { title: "H5", value: "h5" },
                        { title: "Quote", value: "blockquote" },
                    ],
                    lists: [
                        { title: "Bullet", value: "bullet" },
                        { title: "Numbered", value: "number" },
                    ],
                    marks: {
                        decorators: [
                            { title: "Strong", value: "strong" },
                            { title: "Emphasis", value: "em" },
                            { title: "Code", value: "code" },
                        ],
                        annotations: [
                            {
                                name: "link",
                                type: "object",
                                title: "Link",
                                fields: [
                                    {
                                        name: "href",
                                        type: "url",
                                        title: "URL",
                                    },
                                    {
                                        name: "blank",
                                        type: "boolean",
                                        title: "Open in new tab",
                                        initialValue: true,
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        }),

        // CONTENT TAB 2
        defineField({
            name: "content2",
            title: "Content (Tab 2)",
            type: "array",
            description: "Rich text content for the second tab",
            group: "content",
            validation: (Rule) => Rule.required(),
            of: [
                {
                    type: "block",
                    styles: [
                        { title: "Normal", value: "normal" },
                        { title: "H3", value: "h3" },
                        { title: "H4", value: "h4" },
                        { title: "H5", value: "h5" },
                        { title: "Quote", value: "blockquote" },
                    ],
                    lists: [
                        { title: "Bullet", value: "bullet" },
                        { title: "Numbered", value: "number" },
                    ],
                    marks: {
                        decorators: [
                            { title: "Strong", value: "strong" },
                            { title: "Emphasis", value: "em" },
                            { title: "Code", value: "code" },
                        ],
                        annotations: [
                            {
                                name: "link",
                                type: "object",
                                title: "Link",
                                fields: [
                                    {
                                        name: "href",
                                        type: "url",
                                        title: "URL",
                                    },
                                    {
                                        name: "blank",
                                        type: "boolean",
                                        title: "Open in new tab",
                                        initialValue: true,
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        }),

        // LAYOUT & STYLE
        defineField({
            name: "contentSize",
            title: "Content Size",
            type: "string",
            description: "Base size for the content text",
            initialValue: "lg",
            group: "layout",
            options: {
                list: [
                    { title: "Small", value: "sm" },
                    { title: "Base", value: "base" },
                    { title: "Large", value: "lg" },
                    { title: "XL", value: "xl" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "columnSpan",
            title: "Content Width",
            type: "string",
            description: "How wide should the content be?",
            initialValue: "8",
            group: "layout",
            options: {
                list: [
                    { title: "8 Columns (Default)", value: "8" },
                    { title: "10 Columns (Wide)", value: "10" },
                    { title: "12 Columns (Full Width)", value: "12" },
                    { title: "6 Columns (Narrow)", value: "6" },
                ],
                layout: "radio",
            },
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
            introHeading: "introHeading",
            tab1Label: "tab1Label",
            tab2Label: "tab2Label",
        },
        prepare({ title, introHeading, tab1Label, tab2Label }) {
            const displayTitle =
                title ||
                (introHeading ? introHeading.substring(0, 50) : null) ||
                "Tabbed Content Section";

            return {
                title: displayTitle,
                subtitle: `Tabs: ${tab1Label || "Tab 1"} | ${tab2Label || "Tab 2"}`,
                media: FiColumns,
            };
        },
    },
});
