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
      title: "Dynamic content scope",
      type: "string",
      initialValue: "hostChannel",
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
        "Controls channel-aware data inside the group. The 1SP visual treatment is always preserved.",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "group.title",
      language: "group.language",
      dataScope: "dataScope",
    },
    prepare({ title, language, dataScope }) {
      return {
        title: title || "Select a 1SP Component Group",
        subtitle: `${String(language || "").toUpperCase()} • ${dataScope === "1spWeb" ? "1SP data" : "Host-site data"}`,
        media: SquaresFour,
      };
    },
  },
});
