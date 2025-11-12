import React from "react";
import { defineType, defineField, defineArrayMember } from "sanity";
import { FiType } from "react-icons/fi";

type MediaParent = {
  /* nothing needed; we infer video/image from asset */
};

export default defineType({
  name: "oneSPHeader",
  title: "Header",
  type: "object",
  icon: FiType,
  groups: [
    { name: "media", title: "Media" },
    { name: "content", title: "Content", default: true },
    { name: "decoration", title: "Decoration" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    // NAVIGATION
    defineField({
      name: "navPointName",
      title: "Navigation Point Name",
      type: "string",
      description:
        "Optional custom name to display in the vertical navigation minimap.",
      group: "navigation",
    }),
    // MEDIA
    defineField({
      name: "media",
      title: "Background Media",
      type: "cloudinary.asset",
      group: "media",
      description:
        "Image or Video (auto-detected by resource_type / file extension)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "enableParallax",
      title: "Enable parallax",
      type: "boolean",
      initialValue: true,
      group: "media",
    }),

    // CONTENT
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      group: "content",
      initialValue: "Welcome at 1SP",
    }),
    defineField({
      name: "rotatingText",
      title: "Typewriter Words",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "content",
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "paragraphs",
      title: "Paragraph Lines",
      description: "Each item renders as a <p> under the typewriter",
      type: "array",
      of: [{ type: "paragraphLine" }],
      group: "content",
    }),
    defineField({
      name: "highlight",
      title: "Highlight (inline)",
      description:
        "If present, occurrences in paragraphs are shown with a lime gradient.",
      type: "string",
      group: "content",
      initialValue: "one Superagency.",
    }),

    // LAYOUT / DECORATION

    defineField({
      name: "cornerLeftText",
      title: "Corner Left Label",
      type: "string",
      initialValue: "SUPER*",
      group: "decoration",
    }),
    defineField({
      name: "cornerRightText",
      title: "Corner Right Label",
      type: "string",
      initialValue: "/ 1SP",
      group: "decoration",
    }),
  ],
  preview: {
    select: {
      eyebrow: "eyebrow",
      words: "rotatingText",
    },
    prepare({ eyebrow, words }) {
      const count = Array.isArray(words) ? words.length : 0;
      return {
        title: eyebrow || "Header – Typewriter",
        subtitle: `${count} word${count === 1 ? "" : "s"} • Parallax media`,
      };
    },
  },
});
