import { Columns } from "@phosphor-icons/react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "flzrTwoThirdsContentSection",
  title: "FLZR 2/3 Content Section",
  type: "object",
  icon: Columns,
  description:
    "FLZR-only editorial section with a two-thirds text column and one-third image column on desktop.",
  hidden: ({ document }) => document?.channel !== "flizrWeb",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Image" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "text",
      rows: 3,
      description: "Displayed at 36px on desktop. Line breaks are preserved.",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body Copy",
      type: "array",
      group: "content",
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [],
          },
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "CTA",
      type: "cta",
      description: "Optional action displayed below the body copy.",
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "cloudinary.asset",
      description:
        "Images render directly. A video asset is rendered as a static Cloudinary poster frame.",
      group: "media",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt Text",
      type: "string",
      group: "media",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "navPointName",
      title: "Navigation Point Name",
      type: "string",
      group: "navigation",
    }),
    defineField({
      name: "hideFromNav",
      title: "Hide from Navigation",
      type: "boolean",
      initialValue: false,
      group: "navigation",
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "flizrWeb"
        ? true
        : "The FLZR 2/3 Content Section can only be used on flizrWeb pages.",
    ),
  preview: {
    select: {
      title: "headline",
      subtitle: "subheadline",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "FLZR 2/3 Content Section",
        subtitle: subtitle || "2/3 text · 1/3 image",
        media,
      };
    },
  },
});
