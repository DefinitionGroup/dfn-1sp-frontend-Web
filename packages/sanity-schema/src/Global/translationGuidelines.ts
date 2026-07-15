import { Translate } from "@phosphor-icons/react";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "translationGuidelines",
  title: "Translation Guidelines",
  type: "document",
  icon: Translate,
  fields: [
    defineField({
      name: "scope",
      title: "Scope",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required(),
      description:
        "Managed by Studio structure. Use 'global' for reusable content or a website channel ID.",
    }),
    defineField({
      name: "sourceLanguage",
      title: "Source language",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "targetLanguages",
      title: "Target languages",
      type: "array",
      readOnly: true,
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: "styleGuide",
      title: "Translation style guide",
      type: "text",
      rows: 10,
      description:
        "Voice, formality, audience, regional language, and wording rules for Content Agent and future Agent Actions.",
      validation: (Rule) => Rule.required().min(20).max(2000),
    }),
    defineField({
      name: "doNotTranslate",
      title: "Do not translate",
      type: "array",
      description:
        "Brand names, product names, campaign names, and other protected terms.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: "glossary",
      title: "Glossary",
      type: "array",
      of: [
        defineArrayMember({
          name: "translationGlossaryTerm",
          title: "Glossary term",
          type: "object",
          fields: [
            defineField({
              name: "sourceTerm",
              title: "Source term",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "translations",
              title: "Approved translations",
              type: "array",
              of: [
                defineArrayMember({
                  name: "approvedTranslation",
                  title: "Approved translation",
                  type: "object",
                  fields: [
                    defineField({
                      name: "language",
                      title: "Language",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "term",
                      title: "Approved wording",
                      type: "string",
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: { language: "language", term: "term" },
                    prepare({ language, term }) {
                      return {
                        title: term || "Untitled translation",
                        subtitle: String(language || "").toUpperCase(),
                      };
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: "notes",
              title: "Notes",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "sourceTerm", translations: "translations" },
            prepare({ title, translations }) {
              const count = Array.isArray(translations)
                ? translations.length
                : 0;
              return {
                title: title || "Untitled glossary term",
                subtitle: `${count} approved translation${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "reviewChecklist",
      title: "Human review checklist",
      type: "array",
      description:
        "Checks an editor must complete before publishing an AI-generated translation.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: {
      scope: "scope",
      sourceLanguage: "sourceLanguage",
      targetLanguages: "targetLanguages",
    },
    prepare({ scope, sourceLanguage, targetLanguages }) {
      const targets = Array.isArray(targetLanguages)
        ? targetLanguages.join(", ").toUpperCase()
        : "none";

      return {
        title: `${scope || "Unknown"} translation guidelines`,
        subtitle: `${String(sourceLanguage || "?").toUpperCase()} → ${targets}`,
        media: Translate,
      };
    },
  },
});
