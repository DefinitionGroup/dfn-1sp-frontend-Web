import { defineType, defineField } from "sanity";
import { Compass } from "@phosphor-icons/react";
import { hideForFlzrOnlyCase } from "../../shared/flzrVisibility";

export default defineType({
    name: "approachSection",
    title: "Approach Section",
    type: "object",
    icon: Compass,
    groups: [
        { name: "content", title: "Content", default: true },
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
            description: "Small badge text (e.g., 'Approach')",
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
            description: "Number element for the badge (e.g., '002')",
            initialValue: "002",
            group: "content",
            hidden: hideForFlzrOnlyCase,
        }),
        defineField({
            name: "mainHeadline",
            title: "Main Headline",
            type: "string",
            description: "Large main headline (e.g., 'Stores')",
            group: "content",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "subHeadline",
            title: "Sub Headline",
            type: "string",
            description: "Secondary headline (e.g., 'that work harder:')",
            group: "content",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            description: "Approach description text",
            rows: 4,
            group: "content",
        }),
        defineField({
            name: "approachDetails",
            title: "Approach Details",
            type: "array",
            of: [{ type: "text", rows: 3 }],
            description: "Detailed approach points shown below as list items",
            group: "content",
        }),
        defineField({
            name: "mediaType",
            title: "Media Type",
            type: "string",
            description: "Choose between video or image",
            options: {
                list: [
                    { title: "Image", value: "image" },
                    { title: "Video", value: "video" },
                ],
                layout: "radio",
            },
            initialValue: "image",
            group: "media",
        }),
        defineField({
            name: "backgroundImage",
            title: "Background Image",
            type: "cloudinary.asset",
            description: "Background image for the section",
            hidden: ({ parent }) => parent?.mediaType !== "image",
            group: "media",
        }),
        defineField({
            name: "backgroundVideo",
            title: "Background Video",
            type: "cloudinary.asset",
            description: "Background video for the section",
            hidden: ({ parent }) => parent?.mediaType !== "video",
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
    ],
    preview: {
        select: {
            mainHeadline: "mainHeadline",
            badgeText: "badgeText",
            mediaType: "mediaType",
        },
        prepare({ mainHeadline, badgeText, mediaType }) {
            return {
                title: mainHeadline || "Approach Section",
                subtitle: `${badgeText || "Badge"} - ${mediaType === "video" ? "Video" : "Image"}`,
                media: Compass,
            };
        },
    },
});
