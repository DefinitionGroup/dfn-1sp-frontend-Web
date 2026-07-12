import { defineArrayMember, defineField, defineType } from "sanity";
import { SquaresFour } from "@phosphor-icons/react";

/**
 * Reusable, route-less groups of canonical 1SP page-builder blocks.
 *
 * This allowlist mirrors every canonical 1SP component exposed by the 1SP page
 * builder. Every block in this document is rendered by the root 1SP
 * PageBuilder, even when referenced from another site. The group-reference
 * block itself is deliberately excluded to prevent cycles. FLZR-only blocks
 * that have no canonical 1SP renderer are not part of this list.
 */
export default defineType({
  name: "oneSpComponentGroup",
  title: "Reusable 1SP Component Groups",
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
      validation: (Rule) => Rule.required().min(1).max(30),
      of: [
        defineArrayMember({
          type: "headlineChallenge",
          title: "Headline Component",
        }),
        defineArrayMember({ type: "heroShowTime" }),
        defineArrayMember({ type: "sublineComponent" }),
        defineArrayMember({ type: "oneSPHeader" }),
        defineArrayMember({ type: "contentSection" }),
        defineArrayMember({ type: "twoColContentSection" }),
        defineArrayMember({ type: "tabbedContentSection" }),
        defineArrayMember({ type: "casesIntro" }),
        defineArrayMember({ type: "casesGalleryFiltered" }),
        defineArrayMember({ type: "casesGalleryFilteredWithPagination" }),
        defineArrayMember({ type: "servicesGalleryFiltered" }),
        defineArrayMember({ type: "servicesHeroWithBadge" }),
        defineArrayMember({ type: "intertitleCTA" }),
        defineArrayMember({ type: "galleryHeroStep" }),
        defineArrayMember({ type: "galleryCardsStep" }),
        defineArrayMember({ type: "galleryListStep" }),
        defineArrayMember({ type: "galleryPeopleStep" }),
        defineArrayMember({ type: "galleryScrollHighlightStep" }),
        defineArrayMember({ type: "galleryRevealStep" }),
        defineArrayMember({ type: "galleryOverview" }),
        defineArrayMember({ type: "carousel" }),
        defineArrayMember({ type: "smartCarousel" }),
        defineArrayMember({ type: "smartPeople" }),
        defineArrayMember({ type: "smartUnitsGallery" }),
        defineArrayMember({ type: "smartUnitsGlobe" }),
        defineArrayMember({ type: "globeComponent" }),
        defineArrayMember({ type: "unitLogoGrid" }),
        defineArrayMember({ type: "pageBuilderLogoFloat" }),
        defineArrayMember({ type: "pageBuilderPersonioJobs" }),
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
