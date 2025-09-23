import { defineType, defineField } from "sanity";
import { FiLayout } from "react-icons/fi";

export default defineType({
    name: "galleryOverview",
    title: "Gallery Overview",
    type: "object",
    icon: FiLayout,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout" },
        { name: "decoration", title: "Decoration" },
    ],
    fields: [
        // Content
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            group: "content",
        }),
        defineField({
            name: "headline",
            title: "Headline",
            type: "string",
            validation: (Rule) => Rule.required().min(2),
            group: "content",
        }),
        defineField({
            name: "highlight",
            title: "Highlight",
            type: "string",
            description: "Optional emphasized word(s) inside the headline.",
            group: "content",
        }),
        defineField({
            name: "subhead",
            title: "Subhead",
            type: "text",
            rows: 3,
            group: "content",
        }),
        defineField({
            name: "kicker",
            title: "Kicker",
            type: "string",
            description: "Short metric or supporting line (e.g., 'Latency <40ms').",
            group: "content",
        }),

        // Layout
        defineField({
            name: "align",
            title: "Text Alignment",
            type: "string",
            initialValue: "left",
            options: {
                list: [
                    { title: "Left", value: "left" },
                    { title: "Center", value: "center" },
                    { title: "Right", value: "right" },
                ],
                layout: "radio",
            },
            group: "layout",
        }),
        defineField({
            name: "size",
            title: "Size",
            type: "string",
            initialValue: "xl",
            options: {
                list: [
                    { title: "Small", value: "sm" },
                    { title: "Medium", value: "md" },
                    { title: "Large", value: "lg" },
                    { title: "Extra Large", value: "xl" },
                ],
                layout: "radio",
            },
            group: "layout",
        }),


        defineField({
            name: "grid",
            title: "Grid Element",
            type: "gridElement",
            group: "decoration",
        }),
    ],
    preview: {
        select: {
            eyebrow: "eyebrow",
            headline: "headline",
            highlight: "highlight",
            size: "size",
            align: "align",
        },
        prepare({ eyebrow, headline, highlight, size, align }) {
            const title = headline || "Overview";
            const hl = highlight ? ` • ${highlight}` : "";
            const meta = [size, align].filter(Boolean).join(" • ");
            return {
                title,
                subtitle: [eyebrow, meta].filter(Boolean).join(" • ") + hl,
            };
        },
    },
});
