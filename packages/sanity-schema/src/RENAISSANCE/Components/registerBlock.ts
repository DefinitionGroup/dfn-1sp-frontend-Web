import { defineArrayMember, defineField, defineType } from "sanity";
import { validateOptionalCta } from "../../shared/ctaValidation";

export default defineType({
  name: "registerBlock",
  title: "Register Block",
  type: "object",
  description:
    "Renaissance registration callout with editorial copy and two card actions.",
  hidden: ({ document }) => document?.channel !== "renaissanceWeb",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      group: "content",
      validation: (Rule) => Rule.required().min(10).max(400),
    }),
    defineField({
      name: "cards",
      title: "Registration cards",
      description:
        "The two registration actions shown as interactive cards on the right.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "cta",
          validation: (Rule) => Rule.custom((value) => validateOptionalCta(value)),
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(2)
          .error("Add exactly two registration cards."),
    }),
    defineField({
      name: "navPointName",
      title: "Navigation Point Name",
      type: "string",
      group: "navigation",
    }),
    defineField({
      name: "hideFromNav",
      title: "Hide from Navigation",
      type: "boolean",
      initialValue: true,
      group: "navigation",
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "renaissanceWeb"
        ? true
        : "Register blocks can only be used on renaissanceWeb pages.",
    ),
  preview: {
    select: {
      headline: "headline",
      description: "description",
      firstCard: "cards.0.text",
      secondCard: "cards.1.text",
    },
    prepare({ headline, description, firstCard, secondCard }) {
      const cardLabels = [firstCard, secondCard].filter(Boolean).join(" + ");
      return {
        title: headline || "Register Block",
        subtitle: cardLabels || description?.slice(0, 80) || "No registration cards",
      };
    },
  },
});
