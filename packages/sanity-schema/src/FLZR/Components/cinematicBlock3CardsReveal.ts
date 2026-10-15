import { defineArrayMember, defineField, defineType } from "sanity";
import { validateOptionalCta } from "../../shared/ctaValidation";

/**
 * Cinematic 3 Cards Reveal — a pinned scroll scene. The first card opens as
 * a full-bleed image with the title over it, then shrinks into the middle
 * slot while the two side cards slide in beneath the reveal title. An
 * optional outro line closes the scene. Short viewports, touch devices and
 * reduced motion render the same content in normal flow.
 */
export default defineType({
  name: "cinematicBlock3CardsReveal",
  title: "Cinematic 3 Cards Reveal",
  type: "object",
  hidden: ({ document }) => document?.channel !== "flizrWeb",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "cards", title: "Cards" },
    { name: "behavior", title: "Behavior" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({ name: "brand", title: "Brand line", type: "string", group: "content", description: "Optional large word above the title in the opening frame, e.g. \"FLZR\"." }),
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (rule) => rule.required(), description: "Shown over the opening image. Also used as the reveal title unless one is set below." }),
    defineField({ name: "text", title: "Intro text", type: "text", rows: 3, group: "content", description: "Optional copy under the title in the opening frame." }),
    defineField({ name: "cta", title: "Opening frame button", type: "cta", group: "content", validation: (rule) => rule.custom((value) => validateOptionalCta(value)) }),
    defineField({ name: "revealTitle", title: "Reveal title", type: "string", group: "content", description: "Headline above the three cards once they are revealed. Defaults to the title." }),
    defineField({ name: "outro", title: "Outro line", type: "text", rows: 3, group: "content", description: "Optional sentence under the three cards." }),
    defineField({ name: "outroCta", title: "Closing button", type: "cta", group: "content", description: "Optional button under the outro line, e.g. \"See open roles\".", validation: (rule) => rule.custom((value) => validateOptionalCta(value)) }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      group: "cards",
      description: "Exactly three. The first card is the one that opens full-bleed and settles in the middle; the second sits left, the third right.",
      validation: (rule) => rule.required().min(3).max(3),
      of: [defineArrayMember({
        type: "object",
        name: "cinematicRevealCard",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
          defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
          defineField({
            name: "image",
            title: "Image",
            type: "cloudinary.asset",
            validation: (rule) => rule.required().custom((value) => !value || (value as { resource_type?: string }).resource_type !== "video" ? true : "Choose a Cloudinary image."),
          }),
          defineField({ name: "imageAlt", title: "Image alt text", type: "string" }),
          defineField({
            name: "video",
            title: "Video (optional)",
            type: "cloudinary.asset",
            description: "Muted looping video shown instead of the image; the image stays as the poster.",
            validation: (rule) => rule.custom((value) => !value || (value as { resource_type?: string }).resource_type === "video" ? true : "Choose a Cloudinary video."),
          }),
          defineField({ name: "link", title: "Link", type: "link" }),
          defineField({ name: "linkLabel", title: "Link label", type: "string", description: "Defaults to the card title." }),
        ],
        preview: { select: { title: "title", subtitle: "text" } },
      })],
    }),
    defineField({
      name: "autoComplete",
      title: "Play automatically",
      type: "boolean",
      group: "behavior",
      initialValue: true,
      description: "On: a short scroll past the top plays the whole reveal (Revolut style). Off: the reveal is scrubbed by the scroll position over a taller pinned section.",
    }),
    defineField({ name: "navPointName", title: "Navigation point name", type: "string", group: "navigation" }),
    defineField({ name: "hideFromNav", title: "Hide from navigation", type: "boolean", initialValue: false, group: "navigation" }),
  ],
  preview: {
    select: { title: "title", cards: "cards" },
    prepare({ title, cards }) {
      return { title: title || "Cinematic 3 Cards Reveal", subtitle: `${cards?.length || 0} / 3 cards` };
    },
  },
});
