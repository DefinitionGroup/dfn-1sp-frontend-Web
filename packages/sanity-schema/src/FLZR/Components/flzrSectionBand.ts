import { defineField, defineType } from "sanity";

const isSectionStart = (parent: unknown) =>
  (parent as { mode?: string } | undefined)?.mode !== "reset";

const showsBadge = (parent: unknown) => {
  const value = parent as
    | { mode?: string; showBadge?: boolean }
    | undefined;

  return value?.mode !== "reset" && value?.showBadge !== false;
};

export default defineType({
  name: "flzrSectionBand",
  title: "FLZR Section Band",
  type: "object",
  description:
    "Starts a rounded FLZR section that contains all following blocks until the next Section Band marker. Use Reset to end a band without starting another one.",
  hidden: ({ document }) => document?.channel !== "flizrWeb",
  fields: [
    defineField({
      name: "mode",
      title: "Marker Mode",
      type: "string",
      initialValue: "section",
      options: {
        list: [
          { title: "Start Section", value: "section" },
          { title: "Reset to Unframed Content", value: "reset" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "surfaceTone",
      title: "Section Background",
      type: "string",
      initialValue: "fade",
      hidden: ({ parent }) => !isSectionStart(parent),
      options: {
        list: [
          { title: "White", value: "paper" },
          { title: "Very Light Gray", value: "soft" },
          { title: "Gradient", value: "fade" },
        ],
        layout: "radio",
      },
      validation: (Rule) =>
        Rule.custom((value, context) =>
          isSectionStart(context.parent) && !value
            ? "Choose a section background."
            : true,
        ),
    }),
    defineField({
      name: "showBadge",
      title: "Show Section Badge",
      type: "boolean",
      initialValue: true,
      hidden: ({ parent }) => !isSectionStart(parent),
    }),
    defineField({
      name: "badgeNumber",
      title: "Badge Number",
      type: "string",
      description: "Manually authored two-digit number, for example 01.",
      hidden: ({ parent }) => !showsBadge(parent),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!showsBadge(context.parent)) return true;
          if (!value) return "Enter a two-digit badge number.";
          return /^\d{2}$/.test(value)
            ? true
            : "Use exactly two digits, for example 01.";
        }),
    }),
    defineField({
      name: "badgeLabel",
      title: "Badge Label",
      type: "string",
      description: "Short section label such as SERVICES, REACH or CAREERS.",
      hidden: ({ parent }) => !showsBadge(parent),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!showsBadge(context.parent)) return true;
          if (!value?.trim()) return "Enter a badge label.";
          return value.trim().length <= 18
            ? true
            : "Keep the badge label to 18 characters or fewer.";
        }),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((_value, context) =>
      context.document?.channel === "flizrWeb"
        ? true
        : "FLZR Section Bands can only be used on flizrWeb pages.",
    ),
  preview: {
    select: {
      mode: "mode",
      surfaceTone: "surfaceTone",
      showBadge: "showBadge",
      badgeNumber: "badgeNumber",
      badgeLabel: "badgeLabel",
    },
    prepare({ mode, surfaceTone, showBadge, badgeNumber, badgeLabel }) {
      if (mode === "reset") {
        return {
          title: "End FLZR Section Band",
          subtitle: "Following blocks render without a section frame",
        };
      }

      const badge = showBadge === false
        ? "Badge off"
        : `${badgeNumber || "--"} ${badgeLabel || "UNTITLED"}`;
      const surfaceLabels: Record<string, string> = {
        paper: "White",
        soft: "Very Light Gray",
        fade: "Gradient",
      };

      return {
        title: badge,
        subtitle: `Section start · ${surfaceLabels[surfaceTone] || "Background not set"}`,
      };
    },
  },
});
