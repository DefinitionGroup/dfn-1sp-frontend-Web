import { defineField, defineType } from "sanity";
import { validateOptionalCta } from "../../shared/ctaValidation";

export default defineType({
  name: "newsCTABlock",
  title: "Renaissance News CTA",
  type: "object",
  description:
    "A news banner with bolt-masked image or video and one large arrow link.",
  // Portable Text's insert menu treats hidden functions as truthy instead of
  // evaluating them. Keep this type visible; validation below enforces channel.
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(450),
    }),
    defineField({
      name: "media",
      title: "Image or Video",
      type: "cloudinary.asset",
      description:
        "Choose an image or a short silent video. Videos loop with a pause control.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mediaAlt",
      title: "Media Description",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Video Poster (optional)",
      type: "cloudinary.asset",
      description:
        "Still image shown before playback and for reduced motion. Otherwise the first Cloudinary video frame is used.",
      options: { resourceType: "image" },
    }),
    defineField({
      name: "link",
      title: "News Destination",
      type: "link",
      description:
        "The whole banner links here; the headline provides the accessible link label.",
      validation: (Rule) =>
        Rule.required().custom((link) =>
          validateOptionalCta({ text: "Read news", link }),
        ),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "renaissanceWeb"
        ? true
        : "News CTA blocks can only be used on renaissanceWeb pages.",
    ),
  preview: {
    select: { title: "headline", subtitle: "text" },
    prepare({ title, subtitle }) {
      return { title: title || "Renaissance News CTA", subtitle };
    },
  },
});
