import { defineType, defineField } from "sanity";
import { GridFour } from "@phosphor-icons/react";

export default defineType({
  name: "pageBuilderLogoFloat",
  title: "PageBuilder Logo Float",
  type: "object",
  icon: GridFour,
  description:
    "Desktop-focused floating logo wall for units. Supports auto mode or manual drag-and-drop ordering.",
  groups: [
    { name: "layout", title: "Layout", default: true },
    { name: "selection", title: "Selection" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({
      name: "logoVariant",
      title: "Logo Variant",
      type: "string",
      group: "layout",
      initialValue: "logoColor",
      options: {
        list: [
          { title: "Logo Color", value: "logoColor" },
          { title: "Logo (Default)", value: "logo" },
          { title: "Logo Signet", value: "logoSignet" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "cardSize",
      title: "Card Size",
      type: "string",
      group: "layout",
      initialValue: "md",
      options: {
        list: [
          { title: "Small", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Large", value: "lg" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "selectionMode",
      title: "Unit Selection Mode",
      type: "string",
      group: "selection",
      initialValue: "auto",
      options: {
        list: [
          { title: "Auto (All active units)", value: "auto" },
          { title: "Manual selection (Drag & Drop order)", value: "manual" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "maxItems",
      title: "Maximum Items",
      type: "number",
      group: "selection",
      initialValue: 24,
      hidden: ({ parent }) => parent?.selectionMode === "manual",
      validation: (Rule) => Rule.min(1).max(80),
    }),
    defineField({
      name: "selectedUnits",
      title: "Selected Units",
      type: "array",
      group: "selection",
      hidden: ({ parent }) => parent?.selectionMode !== "manual",
      description:
        "Drag and drop to reorder logos. This order will be used on the website.",
      of: [
        {
          type: "reference",
          to: [{ type: "unit" }],
          options: {
            filter: ({ document }: { document: any }) => {
              const currentLanguage = document?.language || "de";
              return {
                filter: '_type == "unit" && language == $language && isActive == true',
                params: { language: currentLanguage },
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { selectionMode?: string };
          if (
            parent?.selectionMode === "manual" &&
            (!Array.isArray(value) || value.length === 0)
          ) {
            return "Select at least one unit in manual mode.";
          }
          return true;
        }),
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
      group: "navigation",
      initialValue: true,
      description:
        "If enabled, this section is excluded from the minimap navigation.",
    }),
  ],
  preview: {
    select: {
      selectionMode: "selectionMode",
      selectedUnits: "selectedUnits",
      maxItems: "maxItems",
    },
    prepare({ selectionMode, selectedUnits, maxItems }) {
      const manualCount = selectedUnits?.length || 0;
      const modeInfo =
        selectionMode === "manual"
          ? `Manual - ${manualCount} selected`
          : `Auto - Max ${maxItems || 24}`;
      return {
        title: "PageBuilder Logo Float",
        subtitle: modeInfo,
        media: GridFour,
      };
    },
  },
});
