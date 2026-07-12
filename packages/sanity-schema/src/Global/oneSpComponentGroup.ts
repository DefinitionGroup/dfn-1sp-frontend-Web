import { defineArrayMember, defineField, defineType } from "sanity";
import { SquaresFour } from "@phosphor-icons/react";

/**
 * Reusable, route-less groups of canonical 1SP page-builder blocks.
 *
 * Keep this allowlist intentionally smaller than page.content. Every block in
 * this document is rendered by the root 1SP PageBuilder, even when referenced
 * from another site. Add new block types only after verifying that their UI,
 * data dependencies, portals, and styles remain isolated outside the 1SP app.
 * The reference block itself is deliberately excluded to prevent cycles.
 */
export default defineType({
  name: "oneSpComponentGroup",
  title: "1SP Component Group",
  type: "document",
  icon: SquaresFour,
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      description: "Used in Studio when editors select this reusable group.",
      validation: (Rule) => Rule.required().min(3).max(120),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      readOnly: true,
      hidden: true,
      initialValue: (context: any) =>
        context?.document?.__inferMetadata?.params?.language || "en",
      description: "Managed by the document internationalization plugin.",
    }),
    defineField({
      name: "content",
      title: "1SP components",
      type: "array",
      description:
        "A reusable sequence rendered with the canonical 1SP implementation and visual tokens on every host site.",
      validation: (Rule) => Rule.required().min(1).max(12),
      of: [
        defineArrayMember({ type: "heroShowTime" }),
        defineArrayMember({ type: "sublineComponent" }),
        defineArrayMember({ type: "oneSPHeader" }),
        defineArrayMember({ type: "contentSection" }),
        defineArrayMember({ type: "twoColContentSection" }),
        defineArrayMember({ type: "tabbedContentSection" }),
        defineArrayMember({ type: "intertitleCTA" }),
        defineArrayMember({
          type: "headlineChallenge",
          title: "Headline Component",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
      content: "content",
    },
    prepare({ title, language, content }) {
      const count = Array.isArray(content) ? content.length : 0;
      return {
        title: title || "Untitled 1SP Component Group",
        subtitle: `${String(language || "en").toUpperCase()} • ${count} component${count === 1 ? "" : "s"}`,
        media: SquaresFour,
      };
    },
  },
});
