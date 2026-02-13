import { defineType, defineField } from "sanity";
import { Eye } from "@phosphor-icons/react";

export default defineType({
    name: "galleryRevealStep",
    title: "Gallery Reveal Step",
    type: "object",
    icon: Eye,
    groups: [
        { name: "badge", title: "Badge" },
        { name: "content", title: "Content", default: true },
        { name: "media", title: "Media" },
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
            name: "badge",
            title: "Badge",
            type: "badgeModule",
            group: "badge",
        }),
        defineField({
            name: "items",
            title: "Items",
            type: "array",
            group: "content",
            validation: (Rule) => Rule.min(1),
            of: [
                defineField({
                    name: "revealItem",
                    title: "Item",
                    type: "object",
                    fields: [
                        defineField({
                            name: "label",
                            title: "Name",
                            type: "string",
                            validation: (Rule) => Rule.required().min(1),
                        }),
                        defineField({
                            name: "image",
                            title: "Image",
                            type: "cloudinary.asset",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "number",
                            title: "Number (optional)",
                            type: "number",
                            description: "If omitted, numbering is derived from position (01, 02, 03…).",
                        }),
                    ],
                    preview: {
                        select: { title: "label", mediaUrl: "image.secure_url" },
                        prepare({ title }) {
                            return { title: title || "Person" };
                        },
                    },
                }),
            ],
        }),

        defineField({
            name: "media",
            title: "Background Image/Video",
            type: "cloudinary.asset",
            group: "media",
        }),
        defineField({
            name: "grid",
            title: "Grid Element",
            type: "gridElement",
            group: "media",
        }),
    ],
    preview: {
        select: { badgeText: "badge.text", items: "items" },
        prepare({ badgeText, items }) {
            const count = Array.isArray(items) ? items.length : 0;
            return {
                title: "Reveal Step",
                subtitle: `${badgeText || "No badge"} • ${count} item${count === 1 ? "" : "s"}`,
            };
        },
    },
});
