import React from "react";
import { defineType, defineField, defineArrayMember } from "sanity";
import { TextT } from "@phosphor-icons/react";
import { isFlzrStyleChannel } from "../../shared/flzrVisibility";
import { validateOptionalCta } from "../../shared/ctaValidation";

type HeaderParent = {
  headlineMode?: "typewriter" | "headlineReveal";
};

const isFlzrPage = (document?: unknown) =>
  isFlzrStyleChannel(
    (document as { channel?: string } | undefined)?.channel,
  );

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
      name: "headlineMode",
      title: "Headline Style",
      type: "string",
      description:
        "Choose a rotating typewriter for short words or an animated editorial headline for longer copy.",
      initialValue: "typewriter",
      options: {
        list: [
          { title: "Rotating Typewriter", value: "typewriter" },
          { title: "Animated Editorial Headline", value: "headlineReveal" },
        ],
        layout: "radio",
      },
      hidden: ({ document }) => !isFlzrPage(document),
      group: "content",
    }),
    defineField({
      name: "headline",
      title: "Editorial Headline",
      type: "text",
      rows: 3,
      description:
        "One visible H1. Line breaks are preserved and revealed as separate lines. Maximum 140 characters.",
      hidden: ({ document, parent }) =>
        !isFlzrPage(document) ||
        (parent as HeaderParent | undefined)?.headlineMode !== "headlineReveal",
      validation: (Rule) =>
        Rule.max(140).custom((value, context) => {
          const parent = context.parent as HeaderParent | undefined;
          if (
            isFlzrPage(context.document) &&
            parent?.headlineMode === "headlineReveal" &&
            !value?.trim()
          ) {
            return "An editorial headline is required in headline reveal mode.";
          }
          return true;
        }),
      group: "content",
    }),
    defineField({
      name: "rotatingText",
      title: "Typewriter Words",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "content",
      hidden: ({ document, parent }) =>
        isFlzrPage(document) &&
        (parent as HeaderParent | undefined)?.headlineMode === "headlineReveal",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as HeaderParent | undefined;
          const mode = parent?.headlineMode ?? "typewriter";
          if (!isFlzrPage(context.document) || mode !== "typewriter") return true;

          const hasText = Array.isArray(value)
            ? value.some((item) => typeof item === "string" && item.trim())
            : false;
          return hasText || "Add at least one typewriter word.";
        }),
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
      validation: (Rule) =>
        Rule.custom((value) => validateOptionalCta(value)),
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
      headlineMode: "headlineMode",
      headline: "headline",
    },
    prepare({ eyebrow, words, headlineMode, headline }) {
      const count = Array.isArray(words) ? words.length : 0;
      const isHeadline = headlineMode === "headlineReveal";
      return {
        title: `Header : ${eyebrow || "Header"}`,
        subtitle: isHeadline
          ? `Editorial headline • ${headline?.slice(0, 60) || "Missing headline"}`
          : `${count} word${count === 1 ? "" : "s"} • Typewriter • Parallax media`,
      };
    },
  },
});
