import { defineType, defineField } from "sanity";
import { FiList } from "react-icons/fi";

export default defineType({
    name: "challengeAndSolution",
    title: "Challenge & Solution",
    type: "object",
    icon: FiList,
    groups: [
        { name: "content", title: "Content", default: true },
        { name: "layout", title: "Layout & Style" },
        { name: "navigation", title: "Navigation" },
        { name: "cta", title: "CTA" },
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
            name: "badgeText",
            title: "Badge Text",
            type: "string",
            description: "Small badge text (e.g., 'intro', 'overview')",
            group: "content",
        }),
        defineField({
            name: "badgeSubtitle",
            title: "Badge Subtitle",
            type: "string",
            description: "Badge subtitle text (e.g., 'The Goal')",
            group: "content",
        }),
        defineField({
            name: "badgeNumber",
            title: "Badge Number",
            type: "string",
            description: "Number element for the badge (e.g., '001')",
            initialValue: "001",
            group: "content",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Main title text",
            group: "content",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            description: "Description text below title",
            rows: 3,
            group: "content",
        }),
        defineField({
            name: "contentType",
            title: "Content Type",
            type: "string",
            description: "Choose whether to display challenges or services",
            options: {
                list: [
                    { title: "Challenges", value: "challenges" },
                    { title: "Services", value: "services" },
                ],
                layout: "radio",
            },
            initialValue: "challenges",
            group: "content",
        }),
        defineField({
            name: "showContent",
            title: "Show Content (Challenges/Services)",
            type: "boolean",
            description: "Enable to show the challenges or services list",
            initialValue: true,
            group: "content",
        }),
        defineField({
            name: "challengeDescription",
            title: "Challenge Description",
            type: "text",
            description: "Description text for the challenge section. If empty, falls back to the default translation.",
            rows: 3,
            hidden: ({ parent }) => parent?.contentType !== "challenges" || !parent?.showContent,
            group: "content",
        }),
        defineField({
            name: "challenges",
            title: "Challenges",
            type: "array",
            of: [{ type: "string" }],
            description: "List of challenges",
            hidden: ({ parent }) => parent?.contentType !== "challenges" || !parent?.showContent,
            group: "content",
        }),
        defineField({
            name: "challengeTitle",
            title: "Challenge Title",
            type: "string",
            description: "Custom title for the Challenge section. If empty, defaults to 'Challenge'.",
            hidden: ({ parent }) => parent?.contentType !== "challenges" || !parent?.showContent,
            group: "content",
        }),
        defineField({
            name: "services",
            title: "Services",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "services" }],
                    options: {
                        filter: ({ document }: { document: any }) => {
                            const currentLanguage = document?.language || "de";
                            return {
                                filter: '_type == "services" && language == $language',
                                params: { language: currentLanguage },
                            };
                        },
                    },
                },
            ],
            description: "List of service references",
            hidden: ({ parent }) => parent?.contentType !== "services" || !parent?.showContent,
            group: "content",
        }),
        defineField({
            name: "showSolution",
            title: "Show Solution Section",
            type: "boolean",
            description: "Enable to show the solution section",
            initialValue: true,
            group: "content",
        }),
        defineField({
            name: "solutionHeadline",
            title: "Solution Headline",
            type: "string",
            description: "Headline for the solution section. If empty, falls back to 'Solution'.",
            hidden: ({ parent }) => !parent?.showSolution,
            group: "content",
        }),
        defineField({
            name: "solution",
            title: "Solution Text",
            type: "array",
            of: [
                {
                    type: "block",
                    styles: [
                        { title: "Normal", value: "normal" },
                    ],
                    lists: [
                        { title: "Bullet", value: "bullet" },
                    ],
                    marks: {
                        decorators: [
                            { title: "Bold", value: "strong" },
                            { title: "Italic", value: "em" },
                        ],
                    },
                },
            ],
            description: "Solution description text (rich text)",
            hidden: ({ parent }) => !parent?.showSolution,
            group: "content",
        }),
        defineField({
            name: "showCta",
            title: "Show CTA Section",
            type: "boolean",
            description: "Enable to show the CTA mini component section",
            initialValue: true,
            group: "cta",
        }),
        defineField({
            name: "ctaHeading",
            title: "CTA Heading",
            type: "string",
            description: "Heading for the CTA mini component (e.g., 'Challenge', 'Services')",
            hidden: ({ parent }) => !parent?.showCta,
            group: "cta",
        }),
        defineField({
            name: "ctaParagraph",
            title: "CTA Paragraph",
            type: "text",
            description: "Paragraph text for the CTA mini component",
            rows: 3,
            hidden: ({ parent }) => !parent?.showCta,
            group: "cta",
        }),
        defineField({
            name: "showButton",
            title: "Show Button",
            type: "boolean",
            initialValue: false,
            hidden: ({ parent }) => !parent?.showCta,
            group: "cta",
        }),
        defineField({
            name: "ctaButton",
            title: "CTA Button",
            type: "cta",
            description: "CTA button",
            hidden: ({ parent }) => !parent?.showCta || !parent?.showButton,
            group: "cta",
        }),

        defineField({
            name: "showGridBackground",
            title: "Show Grid Background",
            type: "boolean",
            initialValue: true,
            group: "layout",
        }),
        defineField({
            name: "backgroundColor",
            title: "Background Color",
            type: "string",
            initialValue: "bg-neutral-50",
            group: "layout",
            options: {
                list: [
                    { title: "Neutral 50", value: "bg-neutral-50" },
                    { title: "White", value: "bg-white" },
                    { title: "Gray 50", value: "bg-gray-50" },
                    { title: "Gray 100", value: "bg-gray-100" },
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
            contentType: "contentType",
        },
        prepare({ title, badgeText, contentType }) {
            return {
                title: title || "Challenge & Solution",
                subtitle: `${badgeText || "Badge"} - ${contentType === "challenges" ? "Challenges" : "Services"}`,
                media: FiList,
            };
        },
    },
});
