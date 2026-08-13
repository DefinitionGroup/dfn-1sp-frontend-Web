import { defineField, defineType } from "sanity";
import { SquaresFour } from "@phosphor-icons/react";

export default defineType({
  name: "oneSpComponentGroupReference",
  title: "1SP Component Group",
  type: "object",
  icon: SquaresFour,
  fields: [
    defineField({
      name: "group",
      title: "Component group",
      type: "reference",
      to: [{ type: "oneSpComponentGroup" }],
      options: {
        filter: ({ document }) => ({
          filter: "language == $language",
          params: { language: document?.language || "en" },
        }),
      },
      description:
        "Only groups matching the page language are available. Publish the group before publishing the page.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dataScope",
      title: "Legacy data scope",
      type: "string",
      initialValue: "1spWeb",
      hidden: true,
      options: {
        layout: "radio",
        list: [
          {
            title: "Use the host website channel",
            value: "hostChannel",
          },
          {
            title: "Always use 1SP content",
            value: "1spWeb",
          },
        ],
      },
      description:
        "Deprecated compatibility field. Reusable 1SP groups always use canonical 1SP data and ignore the host website channel.",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "group.title",
      language: "group.language",
    },
    prepare({ title, language }) {
      return {
        title: title || "Select a 1SP Component Group",
        subtitle: `${String(language || "").toUpperCase()} • Canonical 1SP data`,
        media: SquaresFour,
      };
    },
  },
});
