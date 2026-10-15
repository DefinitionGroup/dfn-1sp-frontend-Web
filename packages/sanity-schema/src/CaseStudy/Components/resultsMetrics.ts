import { defineType, defineField } from "sanity";
import { TrendUp, ChartBar, ChartBarHorizontal, Equalizer } from "@phosphor-icons/react";
import { hideForFlzrOnlyCase } from "../../shared/flzrVisibility";
import { isFlzrStyleChannel } from "../../shared/flzrVisibility";

export default defineType({
    name: "resultsMetrics",
    title: "Results & Metrics",
    type: "object",
    icon: TrendUp,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "metrics", title: "Metrics" },
        { name: "media", title: "Media" },
        { name: "layout", title: "Layout & Style" },
        { name: "navigation", title: "Navigation" },
    ],
    fields: [
        defineField({ name: "context", title: "Measurement context", type: "string", group: "content", description: "Campaign phase, period or territory shared by this group. Leave empty when figures have different scopes." }),
        defineField({ name: "quote", title: "Attributed quote", type: "object", group: "content",
            fields: [
                defineField({ name: "text", title: "Quote", type: "text", validation: r => r.required() }),
                defineField({ name: "attribution", title: "Attribution", type: "string", validation: r => r.required() }),
            ],
        }),
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
            name: "badgeText",
            title: "Badge Text",
            type: "string",
            description: "Small badge text (e.g., 'Results')",
            group: "content",
            hidden: hideForFlzrOnlyCase,
        }),
        defineField({
            name: "badgeSubtitle",
            title: "Badge Subtitle",
            type: "string",
            description: "Badge subtitle text",
            group: "content",
            hidden: hideForFlzrOnlyCase,
        }),
        defineField({
            name: "badgeNumber",
            title: "Badge Number",
            type: "string",
            description: "Number element for the badge (e.g., '003')",
            initialValue: "003",
            group: "content",
            hidden: hideForFlzrOnlyCase,
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
                    icon: ChartBar,
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
                        {name: "description", title: "Explanation", type: "text", rows: 2},
                        {name: "context", title: "Measurement context", type: "string", description: "Period, territory or comparison basis for this number."},
                        {name: "displayScale", title: "Display scale", type: "string", options: {list: ["none", "thousand", "million", "billion"]}, description: "Store the full numeric amount. Million displays 4900000 as 4.9m. Leave unset for existing suffix-based metrics.", hidden: ({parent}: any) => parent?.type !== "animatedNumber"},
                        {name: "decimalPlaces", title: "Decimal places", type: "number", validation: (r: any) => r.integer().min(0).max(6), hidden: ({parent}: any) => parent?.type !== "animatedNumber"},
                        {name: "qualifier", title: "Qualifier", type: "string", options: {list: [{title: "Exact", value: "exact"}, {title: "Plus (+)", value: "plus"}, {title: "More than", value: "moreThan"}, {title: "Approximately", value: "approximately"}, {title: "Nearly", value: "nearly"}, {title: "Less than", value: "lessThan"}]}, hidden: ({parent}: any) => parent?.type !== "animatedNumber"},
                        {name: "prefix", title: "Prefix", type: "string", hidden: ({parent}: any) => parent?.type !== "animatedNumber"},
                        {name: "animationMode", title: "Number animation", type: "string", options: {list: [{title: "Count up once", value: "countUp"}, {title: "Static (rankings, positions)", value: "static"}]}, hidden: ({parent}: any) => parent?.type !== "animatedNumber"},
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
                            suffix: "suffix",
                            prefix: "prefix",
                            displayScale: "displayScale",
                            decimalPlaces: "decimalPlaces",
                            qualifier: "qualifier",
                        },
                        prepare({ type, label, value, suffix, prefix, displayScale, decimalPlaces, qualifier }) {
                            let icon;
                            let typeLabel;

                            switch (type) {
                                case "vertical":
                                    icon = ChartBar;
                                    typeLabel = "Vertical";
                                    break;
                                case "horizontal":
                                    icon = ChartBarHorizontal;
                                    typeLabel = "Horizontal";
                                    break;
                                case "posNeg":
                                    icon = Equalizer;
                                    typeLabel = "Pos/Neg";
                                    break;
                                case "animatedNumber":
                                    icon = TrendUp;
                                    typeLabel = "Animated";
                                    break;
                                default:
                                    icon = ChartBar;
                                    typeLabel = "Unknown";
                            }

                            return {
                                title: `${label}: ${type === "animatedNumber" ? (() => {
                                    const scale = ({thousand: 1e3, million: 1e6, billion: 1e9} as Record<string, number>)[displayScale] || 1;
                                    const unit = ({thousand: "k", million: "m", billion: "bn"} as Record<string, string>)[displayScale] || "";
                                    const qualifierText = ({moreThan: "Over ", approximately: "~", nearly: "Nearly ", lessThan: "Under "} as Record<string, string>)[qualifier] || "";
                                    return `${qualifierText}${prefix || ""}${new Intl.NumberFormat("en", {minimumFractionDigits: decimalPlaces ?? 0, maximumFractionDigits: decimalPlaces ?? 3}).format(value / scale)}${unit}${suffix || ""}${qualifier === "plus" ? "+" : ""}`;
                                })() : `${value}%`}`,
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
            title: "Background Media",
            type: "cloudinary.asset",
            description:
                "Select an image or video. The frontend detects the asset format automatically and generates a poster frame for videos.",
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
            description: "Enable parallax scrolling effect for background media",
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
        defineField({
            name: "fullWidth",
            title: "Full-width section",
            type: "boolean",
            description:
                "Expand the Results & Metrics media to the full available width. Content remains aligned to the site container.",
            initialValue: false,
            group: "layout",
            hidden: ({ document }: any) => {
                const channel = document?.channel;
                return Array.isArray(channel)
                    ? !channel.some(isFlzrStyleChannel)
                    : !isFlzrStyleChannel(channel);
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
                media: TrendUp,
            };
        },
    },
});
