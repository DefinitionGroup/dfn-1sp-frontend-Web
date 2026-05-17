import { defineType, defineField, defineArrayMember } from "sanity";
import { Sidebar } from "@phosphor-icons/react";

export default defineType({
    name: "sublineComponent",
    title: "Subline Component",
    type: "object",
    icon: Sidebar,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout" },
        { name: "decoration", title: "Decoration" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        defineField({
            name: "navPointName",
            title: "Navigation Point Name",
            type: "string",
            description: "Optional custom name to display in the vertical navigation minimap. If empty, uses auto-generated ID.",
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
            name: "sectionTitle",
            title: "Section Title (for ID generation)",
            type: "string",
            description: "Used to generate the section ID. If you want a custom nav name, use Navigation Point Name above.",
            group: "navigation",
        }),
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
