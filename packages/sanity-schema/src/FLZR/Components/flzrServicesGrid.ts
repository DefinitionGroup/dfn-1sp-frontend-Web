import { GridFour } from "@phosphor-icons/react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "flzrServicesGrid",
  title: "FLZR Services Grid",
  type: "object",
  icon: GridFour,
  description:
    "FLZR-only service gallery with a four-column desktop grid and channel-filtered service data.",
  hidden: ({ document }) => document?.channel !== "flizrWeb",
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
      description:
        "Optional custom name to display in the vertical navigation minimap.",
      group: "navigation",
    }),
    defineField({
      name: "hideFromNav",
      title: "Hide from Navigation",
      type: "boolean",
      description:
        "If enabled, this section will not appear in the vertical navigation minimap.",
      initialValue: false,
      group: "navigation",
    }),
    defineField({
      name: "showFilters",
      title: "Show Filter Buttons",
      type: "boolean",
      initialValue: true,
      description: "Enable filtering by service groups.",
      group: "content",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      initialValue: "neutral-100",
      group: "layout",
      options: {
        list: [
          { title: "Neutral 100", value: "neutral-100" },
          { title: "White", value: "white" },
          { title: "Transparent", value: "transparent" },
          { title: "Black", value: "black" },
        ],
        layout: "radio",
      },
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
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "flizrWeb"
        ? true
        : "The FLZR Services Grid can only be used on flizrWeb pages.",
    ),
  preview: {
    prepare() {
      return {
        title: "FLZR Services Grid",
        subtitle: "4 columns desktop · 2 tablet · 1 mobile",
        media: GridFour,
      };
    },
  },
});
