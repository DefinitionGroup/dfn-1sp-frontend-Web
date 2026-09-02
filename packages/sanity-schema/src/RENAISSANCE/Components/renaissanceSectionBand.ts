import { defineField, defineType } from "sanity";

const SECTION_ROLES = [
  { title: "Stories", value: "stories" },
  { title: "Services", value: "services" },
  { title: "People", value: "people" },
  { title: "Origins", value: "origins" },
  { title: "Reach", value: "reach" },
  { title: "Join us", value: "joinUs" },
  { title: "Contact", value: "contact" },
] as const;

const startsSection = (parent: unknown) =>
  (parent as { mode?: string } | undefined)?.mode !== "reset";

export default defineType({
  name: "renaissanceSectionBand",
  title: "Renaissance Section",
  type: "object",
  description:
    "Starts a Renaissance layout section containing every following PageBuilder block until the next marker. Badge copy remains editable here without changing the existing blocks.",
  hidden: ({ document }) => document?.channel !== "renaissanceWeb",
  fields: [
    defineField({
      name: "mode",
      title: "Marker mode",
      type: "string",
      initialValue: "section",
      options: {
        list: [
          { title: "Start section", value: "section" },
          { title: "End section", value: "reset" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sectionRole",
      title: "Section role",
      type: "string",
      options: { list: [...SECTION_ROLES] },
      hidden: ({ parent }) => !startsSection(parent),
      validation: (Rule) =>
        Rule.custom((value, context) =>
          startsSection(context.parent) && !value
            ? "Choose the approved Renaissance section role."
            : true,
        ),
    }),
    defineField({
      name: "badgeLabel",
      title: "Badge label",
      type: "string",
      description:
        "Text only. The frontend adds the square brackets and applies the in-view decryption effect.",
      hidden: ({ parent }) => !startsSection(parent),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!startsSection(context.parent)) return true;
          if (!value?.trim()) return "Enter the badge label.";
          return value.trim().length <= 24
            ? true
            : "Keep the badge label to 24 characters or fewer.";
        }),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "renaissanceWeb"
        ? true
        : "Renaissance sections can only be used on renaissanceWeb pages.",
    ),
  preview: {
    select: {
      mode: "mode",
      sectionRole: "sectionRole",
      badgeLabel: "badgeLabel",
    },
    prepare({ mode, sectionRole, badgeLabel }) {
      if (mode === "reset") {
        return {
          title: "End Renaissance section",
          subtitle: "Following blocks render without the Renaissance frame",
        };
      }

      return {
        title: `[ ${badgeLabel || "UNTITLED"} ]`,
        subtitle: `Renaissance section · ${sectionRole || "role not set"}`,
      };
    },
  },
});
