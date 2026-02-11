import { defineType, defineField } from "sanity";
import { FileText } from "@phosphor-icons/react";

export default defineType({
    name: "contentItem",
    title: "Content Item",
    type: "object",
    icon: FileText,
    fields: [
        defineField({
            name: "heading",
            title: "Heading",
            type: "string",
            description: "The heading for this content block",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "content",
            title: "Content",
            type: "array",
            description: "Rich text content - supports bold, italic, links, lists, etc.",
            validation: (Rule) => Rule.required(),
            of: [
                {
                    type: "block",
                    styles: [
                        { title: "Normal", value: "normal" },
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
        defineField({
            name: "headingSize",
            title: "Heading Size",
            type: "string",
            description: "Size of the heading text",
            initialValue: "5xl",
            options: {
                list: [
                    { title: "2XL", value: "2xl" },
                    { title: "3XL", value: "3xl" },
                    { title: "4XL", value: "4xl" },
                    { title: "5XL", value: "5xl" },
                    { title: "6XL", value: "6xl" },
                    { title: "7XL", value: "7xl" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "contentSize",
            title: "Content Size",
            type: "string",
            description: "Base size for the content text",
            initialValue: "lg",
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
    ],
    preview: {
        select: {
            heading: "heading",
            content: "content",
            headingSize: "headingSize",
        },
        prepare({ heading, content, headingSize }) {
            // Extract text from PortableText blocks
            const block = content?.find((block: any) => block._type === 'block');
            const preview = block?.children
                ?.map((child: any) => child.text)
                ?.join('')
                ?.substring(0, 80);

            return {
                title: heading || "Untitled Content Item",
                subtitle: preview || "No content",
                media: FileText,
            };
        },
    },
});
