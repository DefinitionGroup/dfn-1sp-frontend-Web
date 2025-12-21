import { defineType, defineField } from "sanity";
import { FiType } from "react-icons/fi";

export default defineType({
    name: "intertitleCTA",
    title: "Intertitle CTA",
    type: "object",
    icon: FiType,
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
            description: "Top padding for the section",
            options: {
                list: [
                    { title: "None", value: "0" },
                    { title: "Medium (pt-12)", value: "12" },
                    { title: "Large (pt-24)", value: "24" },
                    { title: "Extra Large (pt-48)", value: "48" },
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
