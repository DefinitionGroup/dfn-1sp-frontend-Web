import { defineType, defineField } from "sanity";
import { Briefcase } from "@phosphor-icons/react";

export default defineType({
  name: "pageBuilderPersonioJobs",
  title: "PageBuilder Personio Jobs",
  type: "object",
  icon: Briefcase,
  description:
    "Displays live job offers from Personio Recruiting. Credentials are read from server environment variables.",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "display", title: "Display" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      initialValue: "Open Positions",
      group: "content",
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "maxItems",
      title: "Maximum Items",
      type: "number",
      initialValue: 20,
      validation: (Rule) => Rule.min(1).max(100),
      group: "content",
    }),
    defineField({
      name: "onlyPublished",
      title: "Only Published Jobs",
      type: "boolean",
      initialValue: true,
      group: "content",
    }),
    defineField({
      name: "applyLabel",
      title: "Apply Button Label",
      type: "string",
      initialValue: "Apply",
      group: "content",
    }),
    defineField({
      name: "emptyStateText",
      title: "Empty State Text",
      type: "string",
      initialValue: "No open positions at the moment.",
      group: "content",
    }),
    defineField({
      name: "showDepartment",
      title: "Show Department",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showLocation",
      title: "Show Location",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showEmploymentType",
      title: "Show Employment Type",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showContractType",
      title: "Show Contract Type",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showSeniority",
      title: "Show Seniority",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showDescription",
      title: "Show Description Snippet",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showSchedule",
      title: "Show Schedule",
      type: "boolean",
      initialValue: true,
      group: "display",
    }),
    defineField({
      name: "showUpdatedAt",
      title: "Show Updated Date",
      type: "boolean",
      initialValue: true,
      group: "display",
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
      initialValue: false,
      description:
        "If enabled, this section is excluded from the minimap navigation.",
      group: "navigation",
    }),
  ],
  preview: {
    select: {
      headline: "headline",
      maxItems: "maxItems",
      onlyPublished: "onlyPublished",
    },
    prepare({ headline, maxItems, onlyPublished }) {
      return {
        title: headline || "PageBuilder Personio Jobs",
        subtitle: `Personio API • Max ${maxItems || 20}${onlyPublished ? " • Published only" : ""}`,
        media: Briefcase,
      };
    },
  },
});
