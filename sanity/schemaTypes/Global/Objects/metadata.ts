import { defineType, defineField } from 'sanity';

export default defineType({
    name: 'metadata',
    title: 'Metadata',
    type: 'object',
    fields: [
        defineField({ name: 'title', title: 'Meta Title', type: 'string' }),
        defineField({ name: 'description', title: 'Meta Description', type: 'text' }),
        defineField({ name: 'image', title: 'Meta Image', type: 'image' }),
        defineField({
            name: 'keywords',
            title: 'Meta Keywords',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'excludeFromSitemap',
            title: 'Exclude From Sitemap',
            type: 'boolean',
            description: 'Exclude this page from sitemap.xml. Useful for test or temporary pages.',
            initialValue: false,
        }),
    ],
});
