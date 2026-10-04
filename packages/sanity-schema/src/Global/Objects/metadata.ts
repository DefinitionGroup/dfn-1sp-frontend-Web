import { defineType, defineField } from 'sanity';

// Social overrides are currently rendered by MSM. Keep other Studio channels
// on their existing contract until their renderers support these fields.
const hideMsmFields = ({ document }: { document?: { _type?: string; channel?: unknown } }) =>
    document?._type !== 'msmUnit' && document?.channel !== 'msmWeb' &&
    !(Array.isArray(document?.channel) && document.channel.includes('msmWeb'));

export const msmMetadataFields = [
        defineField({
            name: 'openGraphTitle', title: 'Social Sharing Title', type: 'string',
            description: 'MSM Open Graph and Twitter title. Falls back to Meta Title, then the page title.',
            hidden: hideMsmFields,
        }),
        defineField({
            name: 'openGraphDescription', title: 'Social Sharing Description', type: 'text', rows: 3,
            description: 'MSM Open Graph and Twitter description. Falls back to Meta Description.',
            hidden: hideMsmFields,
        }),
        defineField({
            name: 'openGraphImage', title: 'Social Sharing Image', type: 'cloudinaryImage',
            description: 'Use a 1200 × 630 image. Falls back to Meta Image or page media, then a still from the MSM homepage video.',
            hidden: hideMsmFields,
        }),
        defineField({
            name: 'noIndex', title: 'Hide From Search Engines', type: 'boolean',
            description: 'MSM pages only: emits noindex and excludes the page from the sitemap. Preview deployment guards still take precedence.',
            hidden: hideMsmFields,
        }),
];

export default defineType({
    name: 'metadata',
    title: 'Metadata',
    type: 'object',
    fields: [
        defineField({ name: 'title', title: 'Meta Title', type: 'string' }),
        defineField({ name: 'description', title: 'Meta Description', type: 'text' }),
        defineField({ name: 'image', title: 'Meta Image', type: 'cloudinaryImage' }),
        ...msmMetadataFields,
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
