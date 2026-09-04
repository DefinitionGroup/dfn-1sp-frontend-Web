import { defineField, defineType } from "sanity";
import { TextAlignLeft } from "@phosphor-icons/react";

export default defineType({
  name: "introBlockTypoSophisticated",
  title: "Intro Block - Typo Sophisticated",
  type: "object",
  icon: TextAlignLeft,
  description:
    "Shared introduction block with an optional Renaissance-specific presentation layout.",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({
      name: "header",
      title: "Typography",
      type: "peopleStepHeader",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 5,
      group: "content",
    }),
    defineField({
      name: "renaissanceLayout",
      title: "Renaissance Layout",
      type: "string",
      description:
        "Optional Renaissance-only presentation override. Leave empty to use the section default.",
      group: "content",
      hidden: ({ document }) => document?.channel !== "renaissanceWeb",
      options: {
        list: [
          { title: "Editorial — large split layout", value: "editorial" },
          { title: "Compact — smaller stacked layout", value: "compact" },
        ],
        layout: "radio",
      },
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
  preview: {
    select: {
      superText: "header.superText",
      mainHeadline: "header.mainHeadline",
      description: "description",
    },
    prepare({ superText, mainHeadline, description }) {
      return {
        title: mainHeadline || "Intro Block - Typo Sophisticated",
        subtitle: superText || description?.slice(0, 80) || "No content",
        media: TextAlignLeft,
      };
    },
  },
});
