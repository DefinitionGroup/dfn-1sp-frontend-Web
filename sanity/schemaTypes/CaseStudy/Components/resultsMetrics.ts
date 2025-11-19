import { defineType, defineField } from "sanity";
import { FiTrendingUp } from "react-icons/fi";
import { LuChartBarDecreasing } from "react-icons/lu";
import { GiNetworkBars } from "react-icons/gi";
import { CgLoadbarAlt } from "react-icons/cg";

export default defineType({
    name: "resultsMetrics",
    title: "Results & Metrics",
    type: "object",
    icon: FiTrendingUp,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "metrics", title: "Metrics" },
        { name: "media", title: "Media" },
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
            name: "badgeText",
            title: "Badge Text",
            type: "string",
            description: "Small badge text (e.g., 'Results')",
            group: "content",
        }),
        defineField({
            name: "badgeSubtitle",
            title: "Badge Subtitle",
            type: "string",
            description: "Badge subtitle text",
            group: "content",
        }),
        defineField({
            name: "badgeNumber",
            title: "Badge Number",
            type: "string",
            description: "Number element for the badge (e.g., '003')",
            initialValue: "003",
            group: "content",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Main title text (e.g., 'Results')",
            group: "content",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            description: "Results description text",
            rows: 4,
            group: "content",
        }),
        defineField({
            name: "metrics",
            title: "Metrics",
            type: "array",
            of: [
                {
                    type: "object",
                    name: "metric",
                    title: "Metric",
                    icon: GiNetworkBars,
                    fields: [
                        {
                            name: "type",
                            title: "Metric Type",
                            type: "string",
                            options: {
                                list: [
                                    {
                                        title: "Vertical Bar",
                                        value: "vertical",
                                    },
                                    {
                                        title: "Horizontal Bar",
                                        value: "horizontal",
                                    },
                                    {
                                        title: "Positive/Negative",
                                        value: "posNeg",
                                    },
                                    {
                                        title: "Animated Number",
                                        value: "animatedNumber",
                                    },
                                ],
                                layout: "radio",
                            },
                            initialValue: "vertical",
                            validation: (Rule) => Rule.required(),
                            description: "Choose the visualization type for this metric",
                        },
                        {
                            name: "suffix",
                            title: "Suffix",
                            type: "string",
                            description: "Suffix for the number (e.g., '%', '+', 'k')",
                            hidden: ({ parent }: any) => parent?.type !== "animatedNumber",
                        },
                        {
                            name: "label",
                            title: "Label",
                            type: "string",
                            description: 'Metric label (e.g., "Dwell Time", "Conversion Rate")',
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: "value",
                            title: "Value",
                            type: "number",
                            description: "Metric value (e.g., 20 for 20%, -15 for -15%)",
                            validation: (Rule) =>
                                Rule.required().custom((value, context: any) => {
                                    const parent = context.parent;
                                    const type = parent?.type;

                                    if (
                                        type !== "posNeg" &&
                                        type !== "animatedNumber" &&
                                        typeof value === "number" &&
                                        value < 0
                                    ) {
                                        return 'Only Positive/Negative and Animated Number types can have negative values.';
                                    }

                                    return true;
                                }),
                        },
                    ],
                    preview: {
                        select: {
                            type: "type",
                            label: "label",
                            value: "value",
                        },
                        prepare({ type, label, value }) {
                            let icon;
                            let typeLabel;

                            switch (type) {
                                case "vertical":
                                    icon = GiNetworkBars;
                                    typeLabel = "Vertical";
                                    break;
                                case "horizontal":
                                    icon = LuChartBarDecreasing;
                                    typeLabel = "Horizontal";
                                    break;
                                case "posNeg":
                                    icon = CgLoadbarAlt;
                                    typeLabel = "Pos/Neg";
                                    break;
                                case "animatedNumber":
                                    icon = FiTrendingUp;
                                    typeLabel = "Animated";
                                    break;
                                default:
                                    icon = GiNetworkBars;
                                    typeLabel = "Unknown";
                            }

                            return {
                                title: `${label}: ${value}%`,
                                subtitle: typeLabel,
                                media: icon,
                            };
                        },
                    },
                },
            ],
            description: "Key metrics and performance indicators",
            group: "metrics",
        }),
        defineField({
            name: "backgroundImage",
            title: "Background Image",
            type: "cloudinary.asset",
            description: "Background image for the results section",
            group: "media",
        }),
        defineField({
            name: "backgroundOpacity",
            title: "Background Opacity",
            type: "number",
            description: "Opacity value for the background (0-1)",
            initialValue: 0.7,
            validation: (Rule) => Rule.min(0).max(1),
            group: "media",
        }),
        defineField({
            name: "enableParallax",
            title: "Enable Parallax Effect",
            type: "boolean",
            initialValue: false,
            description: "Enable parallax scrolling effect for background image",
            group: "media",
        }),
        defineField({
            name: "paddingY",
            title: "Vertical Padding",
            type: "string",
            initialValue: "32",
            group: "layout",
            options: {
                list: [
                    { title: "Medium (py-16)", value: "16" },
                    { title: "Large (py-24)", value: "24" },
                    { title: "Extra Large (py-32)", value: "32" },
                ],
                layout: "radio",
            },
        }),
    ],
    preview: {
        select: {
            title: "title",
            badgeText: "badgeText",
            metricsCount: "metrics.length",
        },
        prepare({ title, badgeText, metricsCount }) {
            return {
                title: title || "Results & Metrics",
                subtitle: `${badgeText || "Badge"} - ${metricsCount || 0} metrics`,
                media: FiTrendingUp,
            };
        },
    },
});
