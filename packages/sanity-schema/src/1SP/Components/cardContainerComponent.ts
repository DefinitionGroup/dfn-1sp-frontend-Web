import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "cardContainerComponent",
  title: "Card Container",
  type: "object",
  description: "Responsive media-card grid with a staggered entrance animation.",
  fields: [
    defineField({
      name: "columns",
      title: "Desktop columns",
      type: "number",
      initialValue: 3,
      options: {
        list: [
          { title: "2 columns", value: 2 },
          { title: "3 columns", value: 3 },
          { title: "5 columns", value: 5 },
          { title: "6 columns", value: 6 },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required().custom((value) =>
        [2, 3, 5, 6].includes(value as number) ? true : "Choose 2, 3, 5, or 6 columns",
      ),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      description: "Only Media Cards can be placed inside this container.",
      of: [defineArrayMember({ type: "cardInsideComponent" })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: "navPointName", title: "Navigation point name", type: "string" }),
    defineField({ name: "hideFromNav", title: "Hide from navigation", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { columns: "columns", cards: "cards" },
    prepare({ columns, cards }) {
      const count = Array.isArray(cards) ? cards.length : 0;
      return {
        title: "Card Container",
        subtitle: `${columns || 3} columns · ${count} card${count === 1 ? "" : "s"}`,
      };
    },
  },
});
