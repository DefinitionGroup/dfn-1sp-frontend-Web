import { defineType, defineField } from "sanity";
import { FiGrid } from "react-icons/fi";

export default defineType({
    name: "casesGalleryFiltered",
    title: "Cases Gallery with Filters",
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
            name: "showGridBackground",
            title: "Show Grid Background",
            type: "boolean",
            initialValue: true,
            group: "layout",
        }),
        defineField({
            name: "selectionMode",
            title: "Case Selection Mode",
            type: "string",
            description: "Choose how cases are selected for this gallery",
            initialValue: "auto",
            group: "content",
            options: {
                list: [
                    { title: "Auto (All published cases)", value: "auto" },
                    { title: "Manual Selection (Drag & Drop order)", value: "manual" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "selectedCases",
            title: "Selected Cases",
            type: "array",
            description: "Drag and drop to reorder cases. Only used when 'Manual Selection' mode is active.",
            group: "content",
            hidden: ({ parent }) => parent?.selectionMode !== "manual",
            of: [
                {
                    type: "reference",
                    to: [{ type: "caseStudy" }],
                    options: {
                        filter: "isPublished == true",
                    },
                },
            ],
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as { selectionMode?: string };
                    if (parent?.selectionMode === "manual" && (!value || value.length === 0)) {
                        return "Please select at least one case study when using manual selection mode";
                    }
                    return true;
                }),
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
        select: {
            selectionMode: "selectionMode",
            selectedCases: "selectedCases",
        },
        prepare({ selectionMode, selectedCases }) {
            const mode = selectionMode === "manual" ? "Manual" : "Auto";
            const count = selectedCases?.length || 0;
            const subtitle = selectionMode === "manual"
                ? `${mode} - ${count} case${count !== 1 ? "s" : ""} selected`
                : `${mode} - All published cases`;
            return {
                title: "Cases Gallery with Filters",
                subtitle,
                media: FiGrid,
            };
        },
    },
});
