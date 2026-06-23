import { defineType, defineField } from "sanity";
export default defineType({
    name: "gridElement",
    title: "Grid Element",
    type: "object",
    fields: [
        defineField({ name: 'hasGrid', title: 'Has Grid', type: 'boolean' }),
        defineField({
            name: 'customAnimation',
            title: 'Custom Animation',
            type: 'boolean',
        }),
        defineField({
            name: 'delay',
            title: 'Grid Animation Delay',
            type: 'number',
            initialValue: 0.2,
            hidden: ({ parent }) => !parent?.customAnimation,
        }),
        defineField({
            name: 'staggerDelay',
            title: 'Grid Animation Stagger Delay',
            type: 'number',
            initialValue: 0.06,
            hidden: ({ parent }) => !parent?.customAnimation,
        }),
    ],
    preview: {
        select: {
            hasGrid: 'hasGrid',
        },
        prepare({ hasGrid }) {
            return {
                title: 'Grid Element',
                subtitle: hasGrid ? 'Grid is enabled' : 'Grid is disabled',
            }
        }
    }
})