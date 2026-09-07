import { Medal } from "@phosphor-icons/react";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "renaissanceAwardLogoWall",
  title: "Renaissance Award Logo Wall",
  type: "object",
  icon: Medal,
  description:
    "Renaissance-only award statement, signal line and ordered award-logo wall.",
  hidden: ({ document }) => document?.channel !== "renaissanceWeb",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      initialValue: "Award-winning people. Leading by example.",
      validation: (Rule) => Rule.required().max(90),
    }),
    defineField({
      name: "logos",
      title: "Award Logos",
      type: "array",
      description: "Drag to reorder. The signal line is part of this block.",
      validation: (Rule) => Rule.required().min(1).max(12),
      of: [
        defineArrayMember({
          name: "renaissanceAwardLogo",
          title: "Award Logo",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Award Name / Alt Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "image",
              title: "Logo Image",
              type: "cloudinary.asset",
              description: "A selected image takes precedence over the logo URL.",
            }),
            defineField({
              name: "imageUrl",
              title: "Logo URL",
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
              const logo = value as
                | { image?: unknown; imageUrl?: string }
                | undefined;
              return (
                !!(logo?.image || logo?.imageUrl) ||
                "Choose a logo image or enter a logo URL"
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
    select: { title: "headline", logos: "logos" },
    prepare({ title, logos }) {
      const count = Array.isArray(logos) ? logos.length : 0;
      return {
        title: title || "Renaissance Award Logo Wall",
        subtitle: `${count} logo${count === 1 ? "" : "s"}`,
        media: Medal,
      };
    },
  },
});
