import { defineType, defineField } from "sanity";
import { TextT } from "@phosphor-icons/react";
import { validateOptionalCta } from "../../shared/ctaValidation";

export default defineType({
    name: "intertitleCTA",
    title: "Intertitle CTA",
    type: "object",
    icon: TextT,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "button", title: "Button" },
        { name: "layout", title: "Layout" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        // NAVIGATION
        defineField({
            name: "navPointName",
            title: "Navigation Point Name",
            type: "string",
            description:
                "Optional custom name to display in the vertical navigation minimap.",
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
            title: "Title",
            type: "string",
            group: "content",
            validation: (Rule) => Rule.required(),
            description: "Main title text",
        }),
        defineField({
            name: "subline",
            title: "Subline (optional)",
            type: "text",
            rows: 2,
            group: "content",
            description: "Optional secondary line between the large title and the supporting copy. Rendered smaller than the title.",
        }),
        defineField({
            name: "subtitle",
            title: "Subtitle",
            type: "text",
            group: "content",
            validation: (Rule) => Rule.required(),
            description: "Subtitle or description text",
        }),
        // BUTTON
        defineField({
            name: "cta",
            title: "Call to Action Button",
            type: "cta",
            group: "button",
            description: "Configure the button text, link, and variant",
            validation: (Rule) =>
                Rule.custom((value) => validateOptionalCta(value)),
        }),
        // LAYOUT
        defineField({
            name: "alignment",
            title: "Alignment",
            type: "string",
            group: "layout",
            options: {
                list: [
                    { title: "Center", value: "center" },
                    { title: "Left", value: "left" },
                ],
            },
            initialValue: "center",
        }),
        defineField({
            name: "paddingTop",
            title: "Padding Top",
            type: "string",
            group: "layout",
            description: "Extra space above the block, on top of the page's own section spacing.",
            options: {
                list: [
                    { title: "None", value: "0" },
                    { title: "Medium (3rem)", value: "12" },
                    { title: "Large (6rem)", value: "24" },
                    { title: "Extra Large (12rem)", value: "48" },
                ],
                layout: "radio",
            },
            initialValue: "0",
        }),
        defineField({
            name: "paddingBottom",
            title: "Padding Bottom",
            type: "string",
            group: "layout",
            description: "Extra space below the block, on top of the page's own section spacing.",
            options: {
                list: [
                    { title: "None", value: "0" },
                    { title: "Medium (3rem)", value: "12" },
                    { title: "Large (6rem)", value: "24" },
                    { title: "Extra Large (12rem)", value: "48" },
                ],
                layout: "radio",
            },
            initialValue: "0",
        }),

    ],
    preview: {
        select: {
            title: "title",
            subtitle: "subtitle",
        },
        prepare({ title, subtitle }) {
            return {
                title: title || "Intertitle CTA",
                subtitle: subtitle || "No subtitle",
            };
        },
    },
});
