import { UsersThree } from "@phosphor-icons/react";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "renaissancePortraitGrid",
  title: "Renaissance Portrait Grid",
  type: "object",
  icon: UsersThree,
  description:
    "Renaissance-only editorial people grid. Add it inside a People Powered section band.",
  hidden: ({ document }) => document?.channel !== "renaissanceWeb",
  fields: [
    defineField({ name: "displayMode", title: "Display", type: "string", options: { list: [
      { title: "Selected portraits", value: "selection" }, { title: "Named team directory", value: "directory" },
    ] } }),
    defineField({
      name: "portraits",
      title: "Portraits",
      type: "array",
      description:
        "Drag to reorder. Use up to 40 portraits for the approved desktop composition.",
      validation: (Rule) => Rule.required().min(2).max(40),
      of: [
        defineArrayMember({
          name: "renaissancePortrait",
          title: "Portrait",
          type: "object",
          fields: [
            defineField({ name: "person", title: "Global person", type: "reference", to: [{ type: "person" }],
              options: { filter: '"renaissanceWeb" in channel && language == "en"' } }),
            defineField({ name: "position", title: "Display role", type: "string" }),
            defineField({
              name: "name",
              title: "Person Name / Alt Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "image",
              title: "Portrait Image",
              type: "cloudinary.asset",
              description: "A selected image takes precedence over the image URL.",
            }),
            defineField({
              name: "imageUrl",
              title: "Image URL",
              type: "url",
              description:
                "Used when no image is selected. Accepts HTTPS URLs or a site-relative asset path.",
              hidden: ({ parent }) => !!parent?.image,
              validation: (Rule) =>
                Rule.uri({ allowRelative: true, scheme: ["https"] }),
            }),
          ],
          validation: (Rule) =>
            Rule.custom((value) => {
              const portrait = value as
                | { image?: unknown; imageUrl?: string; person?: unknown }
                | undefined;
              return (
                !!(portrait?.image || portrait?.imageUrl || portrait?.person) ||
                "Choose a portrait image or enter an image URL"
              );
            }),
          preview: {
            select: {
              title: "name",
              media: "image",
              subtitle: "imageUrl",
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { portraits: "portraits" },
    prepare({ portraits }) {
      const count = Array.isArray(portraits) ? portraits.length : 0;
      return {
        title: "Renaissance Portrait Grid",
        subtitle: `${count} portrait${count === 1 ? "" : "s"}`,
        media: UsersThree,
      };
    },
  },
});
