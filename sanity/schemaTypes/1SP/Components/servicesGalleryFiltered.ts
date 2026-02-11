import { defineType, defineField } from "sanity";
import { GridFour } from "@phosphor-icons/react";

export default defineType({
    name: "servicesGalleryFiltered",
    title: "Services Gallery with Filters",
    type: "object",
    icon: GridFour,
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
            name: "hideFromNav",
            title: "Hide from Navigation",
            type: "boolean",
            description: "If enabled, this section will not appear in the vertical navigation minimap.",
            initialValue: false,
            group: "navigation",
        }),
        defineField({
            name: "showGridBackground",
            title: "Show Grid Background",
            type: "boolean",
            initialValue: false,
            group: "layout",
        }),
        defineField({
            name: "showFilters",
            title: "Show Filter Buttons",
            type: "boolean",
            initialValue: true,
            description: "Enable filtering by service groups",
            group: "content",
        }),
        defineField({
            name: "backgroundColor",
            title: "Background Color",
            type: "string",
            initialValue: "neutral-100",
            group: "layout",
            options: {
                list: [
                    { title: "Neutral 100", value: "neutral-100" },
                    { title: "White", value: "white" },
                    { title: "Transparent", value: "transparent" },
                    { title: "Black", value: "black" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "paddingY",
            title: "Vertical Padding",
            type: "string",
            initialValue: "32",
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
        prepare() {
            return {
                title: "Services Gallery with Filters",
                subtitle: "Displays all services with group filtering",
                media: GridFour,
            };
        },
    },
});
