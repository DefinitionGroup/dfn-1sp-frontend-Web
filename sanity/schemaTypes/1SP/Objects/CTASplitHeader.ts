import { defineType, defineField } from "sanity";
import { FiColumns } from "react-icons/fi";

export default defineType({
    name: "ctaSplitHeader",
    title: "CTA + Split Header",
    type: "object",
    icon: FiColumns,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout" },
    ],
    fields: [
        defineField({
            name: "cta",
            title: "Mini CTA",
            type: "ctaMiniComponent",
            group: "content",
        }),

        defineField({
            name: "heading",
            title: "Heading",
            type: "string",
            group: "content",
        }),
        defineField({
            name: "subheading",
            title: "Subheading",
            type: "string",
            group: "content",
        }),

        defineField({
            name: "paragraph",
            title: "Paragraph",
            type: "text",
            group: "content",
        }),
    ],
    preview: {
        select: {
            heading: "heading",
            subheading: "subheading",
            btn: "cta.buttonText",
        },
        prepare({ heading, subheading, btn }) {
            return {
                title: heading || "CTA + Split Header",
                subtitle: [subheading, btn ? `Button: ${btn}` : ""]
                    .filter(Boolean)
                    .join(" • "),
            };
        },
    },
});
