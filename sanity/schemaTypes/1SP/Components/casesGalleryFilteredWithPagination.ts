import { defineType, defineField } from "sanity";
import { FiGrid } from "react-icons/fi";

export default defineType({
    name: "casesGalleryFilteredWithPagination",
    title: "Cases Gallery with Filters & Pagination",
    type: "object",
    icon: FiGrid,
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
            initialValue: true,
            group: "layout",
        }),
        defineField({
            name: "showFilters",
            title: "Show Filter Buttons",
            type: "boolean",
            initialValue: true,
            description: "Enable filtering by services",
            group: "content",
        }),
        defineField({
            name: "rowsPerPage",
            title: "Rows Per Page",
            type: "number",
            initialValue: 12,
            description: "Number of items to show per page",
            group: "content",
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
            name: "marginBottom",
            title: "Bottom Margin",
            type: "string",
            initialValue: "16",
            group: "layout",
            options: {
                list: [
                    { title: "None (mb-0)", value: "0" },
                    { title: "Small (mb-8)", value: "8" },
                    { title: "Medium (mb-16)", value: "16" },
                    { title: "Large (mb-24)", value: "24" },
                    { title: "Extra Large (mb-32)", value: "32" },
                ],
                layout: "radio",
            },
        }),
    ],
    preview: {
        prepare() {
            return {
                title: "Cases Gallery with Filters & Pagination",
                subtitle: "Displays all case studies with service filtering and pagination",
                media: FiGrid,
            };
        },
    },
});
