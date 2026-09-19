import { defineType, defineField, defineArrayMember } from "sanity";
import {serviceReferenceField} from "../../shared/serviceReference";
import { List } from "@phosphor-icons/react";

export default defineType({
    name: "contentSection",
    title: "Content Section",
    type: "object",
    icon: List,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout & Style" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        {...serviceReferenceField(), group: "content"},
        defineField({ name: "anchorId", title: "Section anchor", type: "string", group: "navigation", hidden: ({document}) => document?.channel !== "renaissanceWeb", validation: r => r.regex(/^[a-z][a-z0-9-]*$/) }),
        defineField({
            name: "navPointName",
            title: "Navigation Point Name",
            type: "string",
            description: "Optional custom name to display in the vertical navigation minimap. If empty, uses the section title or auto-generated ID.",
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
            title: "Section Title",
            type: "string",
            description: "Optional heading override. A selected global service supplies its name when this is empty.",
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
        defineField({
            name: "content",
            hidden: ({parent}) => !!parent?.service?._ref,
            title: "Content",
            type: "array",
            description: "Rich text content - paste your text and apply formatting as needed",
            group: "content",
            validation: (Rule) => Rule.custom((value, context) => (context.parent as any)?.service?._ref || (value && value.length) ? true : "Content or a global service is required"),
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
                                        validation: (Rule) => Rule.uri({allowRelative: true, scheme: ["http", "https", "mailto"]}),
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
        defineField({
            name: "presentation",
            title: "FLZR Presentation",
            type: "string",
            description: "Use the globe overlay only when this content block immediately precedes a Globe Component inside the same FLZR Section Band.",
            initialValue: "default",
            group: "layout",
            hidden: ({ document }) => document?.channel !== "flizrWeb",
            options: {
                list: [
                    { title: "Default", value: "default" },
                    { title: "Overlay on following globe", value: "globeOverlay" },
                ],
                layout: "radio",
            },
        }),
    ],
    preview: {
        select: {
            serviceName: "service.name",
            title: "title",
            introHeading: "introHeading",
            content: "content",
        },
        prepare({ title, introHeading, content, serviceName }) {
            const displayTitle =
                title || serviceName ||
                (introHeading ? introHeading.substring(0, 50) : null) ||
                "Content Section";

            // Extract preview text from PortableText
            const block = content?.find((block: any) => block._type === 'block');
            const preview = block?.children
                ?.map((child: any) => child.text)
                ?.join('')
                ?.substring(0, 60);

            return {
                title: displayTitle,
                subtitle: preview || "No content",
                media: List,
            };
        },
    },
});
