import { defineType, defineField } from "sanity";
import { validateClientScope } from "../../shared/validateClientScope";
import { Slideshow } from "@phosphor-icons/react";

export default defineType({
    name: "clientLogoCarousel",
    title: "Client Logo Carousel",
    type: "object",
    icon: Slideshow,
    description:
        "Animated client-logo display. Auto mode shows all channel clients with a logo; manual mode uses a drag-and-drop selection.",
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "selection", title: "Selection" },
        { name: "layout", title: "Layout" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description: "Small label above the headline (optional)",
            group: "content",
        }),
        defineField({
            name: "headline",
            title: "Headline",
            type: "string",
            description: "Section headline (optional)",
            group: "content",
        }),
        defineField({
            name: "selectionMode",
            title: "Client Selection Mode",
            type: "string",
            group: "selection",
            initialValue: "auto",
            options: {
                list: [
                    { title: "Auto (all channel clients with a logo)", value: "auto" },
                    { title: "Manual selection (Drag & Drop order)", value: "manual" },
                    { title: "Renaissance collection", value: "collection" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "selectedClients",
            title: "Selected Clients",
            type: "array",
            description:
                'Drag and drop to reorder. Only used when "Manual Selection" mode is active.',
            group: "selection",
            hidden: ({ parent }) => parent?.selectionMode !== "manual",
            of: [
                {
                    type: "reference",
                    to: [{ type: "client" }],
                    options: {
                        filter: ({ document }) => ({
                            filter: 'defined(logo) && language == $language && $channel in channel',
                            params: { language: document?.language || 'en', channel: typeof document?.channel === 'string' ? document.channel : '1spWeb' },
                        }),
                    },
                },
            ],
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as { selectionMode?: string };
                    if (
                        parent?.selectionMode === "manual" &&
                        (!value || (value as unknown[]).length === 0)
                    ) {
                        return "Please select at least one client when using manual selection mode";
                    }
                    if (parent?.selectionMode !== 'manual') return true;
                    return validateClientScope(value as Array<{ _ref?: string }> | undefined, context);
                }),
        }),
        defineField({ name: 'collection', title: 'Renaissance client collection', type: 'reference', to: [{ type: 'renaissanceClientCollection' }], group: 'selection',
            hidden: ({ parent }) => parent?.selectionMode !== 'collection',
            options: { filter: 'channel == "renaissanceWeb" && language == "en"' },
            validation: r => r.custom((value, context) => {
                if ((context.parent as { selectionMode?: string })?.selectionMode !== 'collection') return true;
                if (context.document?.channel !== 'renaissanceWeb') return 'Collections are available on Renaissance pages only.';
                return Boolean(value?._ref) || 'Select a client collection.';
            }) }),
        defineField({ name: 'displayMode', title: 'Renaissance display', type: 'string', group: 'layout', initialValue: 'swap',
            hidden: ({ document }) => document?.channel !== 'renaissanceWeb',
            options: { list: [{ title: 'Animated selection', value: 'swap' }, { title: 'Full logo grid', value: 'grid' }] } }),
        defineField({
            name: "speed",
            title: "Motion Speed",
            type: "string",
            group: "layout",
            initialValue: "normal",
            options: {
                list: [
                    { title: "Slow", value: "slow" },
                    { title: "Normal", value: "normal" },
                    { title: "Fast", value: "fast" },
                ],
                layout: "radio",
            },
        }),
        defineField({
            name: "grayscale",
            title: "Grayscale logos (color on hover)",
            type: "boolean",
            group: "layout",
            initialValue: true,
        }),
        defineField({
            name: "navPointName",
            title: "Navigation Point Name",
            type: "string",
            description: "Optional name for navigation anchor links",
            group: "navigation",
        }),
        defineField({
            name: "hideFromNav",
            title: "Hide from Navigation",
            type: "boolean",
            description:
                "If enabled, this section will not appear in the vertical navigation minimap.",
            group: "navigation",
            initialValue: true,
        }),
    ],
    preview: {
        select: { headline: "headline", mode: "selectionMode" },
        prepare({ headline, mode }) {
            return {
                title: headline || "Client Logo Carousel",
                subtitle: `Clients: ${mode === "collection" ? "Renaissance collection" : mode === "manual" ? "manual selection" : "auto"}`,
            };
        },
    },
});
