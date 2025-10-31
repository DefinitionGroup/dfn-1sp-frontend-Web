import { defineType, defineField, defineArrayMember } from "sanity";
import { FiSidebar } from "react-icons/fi";

export default defineType({
    name: "sublineComponent",
    title: "Subline Component",
    type: "object",
    icon: FiSidebar,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout" },
        { name: "decoration", title: "Decoration" },
    ],
    fields: [
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
            group: "content",
            validation: (Rule) => Rule.min(10).max(400),
        }),

        defineField({
            name: "showGridBackground",
            title: "Show Grid Background",
            type: "boolean",
            initialValue: true,
            group: "decoration",
        }),
        defineField({
            name: "additionalContent",
            title: "Additional Content",
            description: "Composable items that render after the paragraphs.",
            type: "array",
            group: "content",
            of: [defineArrayMember({ type: "cta" })],
        }),
    ],
    preview: {
        select: {
            description: "description",
            firstCtaText: "additionalContent.0.text",
            ctaCount: "additionalContent.length",
            grid: "showGridBackground",
        },
        prepare({ description, firstCtaText, ctaCount, grid }) {
            const title = description
                ? description.split("\n")[0].slice(0, 60)
                : "Subline Component";
            const subtitleParts: string[] = [];

            if (firstCtaText) subtitleParts.push(`CTA: ${firstCtaText}`);
            if (typeof ctaCount === "number") {
                subtitleParts.push(`${ctaCount} item${ctaCount !== 1 ? "s" : ""}`);
            }
            if (grid !== undefined) subtitleParts.push(grid ? "Grid on" : "Grid off");

            const subtitle = subtitleParts.length
                ? subtitleParts.join(" • ")
                : (description || "").slice(0, 80);

            return { title, subtitle };
        },
    },
});
