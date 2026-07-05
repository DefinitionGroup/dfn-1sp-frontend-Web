import React from "react";
import { defineType, defineField, defineArrayMember } from "sanity";
import { TextT } from "@phosphor-icons/react";

export default defineType({
  name: "oneSPHeader",
  title: "Header",
  type: "object",
  icon: TextT,
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
    defineField({
      name: "hideFromNav",
      title: "Hide from Navigation",
      type: "boolean",
      description: "If enabled, this section will not appear in the vertical navigation minimap.",
      initialValue: false,
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
      name: "seoTitle",
      title: "SEO H1 Title",
      type: "string",
      description:
        "Optional hidden H1 for screen readers and SEO. It is not shown visually in the header.",
      group: "content",
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
      title: "Paragraphs",
      description: "Rich text content below the typewriter. Use paragraphs for spacing.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [],
          },
        }),
      ],
      group: "content",
    }),
    defineField({
      name: "mobileParagraphs",
      title: "Mobile Paragraphs",
      description:
        "Rich text content for mobile and iPhone landscape. If empty, desktop paragraphs are used.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [],
          },
        }),
      ],
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
    defineField({
      name: "cta",
      title: "CTA Button",
      description:
        "Optional call-to-action button shown below the hero paragraphs.",
      type: "cta",
      group: "content",
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
        title: `Header : ${eyebrow  || "Header – Typewriter"}`,
        subtitle: `${count} word${count === 1 ? "" : "s"} • Parallax media`,
      };
    },
  },
});
