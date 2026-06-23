import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'page',
    title: 'Page',
    type: 'document',

    // Define groups to organize fields in the Studio
    groups: [
        { name: 'basic', title: 'Basic', default: true },
        { name: 'settings', title: 'Settings' },
        { name: 'content', title: 'Content' },
        { name: 'seo', title: 'SEO' },
    ],

    fields: [
        defineField({
            name: 'language',
            title: 'Language',
            type: 'string',
            readOnly: true,
            hidden: true,
            group: 'settings',
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.language || 'de',
            description: 'Managed by i18n tooling; do not edit manually.',
        }),

        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            group: 'basic',
        }),

        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            group: 'basic',
            options: {
                source: 'title',
                maxLength: 96,
                slugify: (input: string) => {
                    const baseSlug = input
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]+/g, "")
                        .replace(/--+/g, "-")
                        .replace(/^-+/, "")
                        .replace(/-+$/, "");
                    return baseSlug;
                },
                isUnique: async (
                    slug: string,
                    context: {
                        document?: { channel?: string; _id: string; language?: string };
                        getClient: (options: { apiVersion: string }) => any;
                    }
                ) => {
                    const { document, getClient } = context;
                    const channel = document?.channel || "1spWeb";
                    const language = document?.language || "de";
                    const client = getClient({ apiVersion: "2021-03-25" });

                    const baseId = document?._id.replace(/^drafts\./, "");

                    const query = `*[
                        _type == "page" && 
                        slug.current == $slug && 
                        channel == $channel && 
                        language == $language && 
                        !(_id in [$draftId, $publishedId])
                    ][0]`;
                    const params = {
                        slug: slug,
                        channel: channel,
                        language: language,
                        draftId: `drafts.${baseId}`,
                        publishedId: baseId,
                    };

                    const existingDoc = await client.fetch(query, params);
                    return !existingDoc;
                },
            },
            validation: (Rule: any) => Rule.required(),
        }),
        defineField({
            name: 'isHomepage',
            title: 'Homepage',
            type: 'boolean',
            group: 'settings',
            initialValue: false,
            description: 'Mark this page as the homepage for this language and channel. Only one homepage per language+channel is allowed.',
            validation: (Rule: any) =>
                Rule.custom(async (value: boolean, context: any) => {
                    if (!value) return true;
                    const { document, getClient } = context;
                    const language = document?.language || 'de';
                    const channel = document?.channel || '1spWeb';
                    const baseId = (document?._id || '').replace(/^drafts\./, '');
                    const client = getClient({ apiVersion: '2024-10-01' });
                    const query = `count(*[_type == "page" && isHomepage == true && language == $language && channel == $channel && !(_id in [$draftId, $publishedId])])`;
                    const params = {
                        language,
                        channel,
                        draftId: `drafts.${baseId}`,
                        publishedId: baseId,
                    };
                    const count = await client.fetch(query, params);
                    return count === 0 || 'Another homepage already exists for this language + channel.';
                }),
        }),
        defineField({
            name: 'metadata',
            title: 'Metadata',
            type: 'metadata',
            group: 'seo',
        }),
        defineField({
            name: 'navbarVariant',
            title: 'Navbar Variant',
            type: 'string',
            group: 'settings',
            initialValue: 'light',
            description: 'Choose the navbar color scheme for this page',
            options: {
                list: [
                    { title: 'Light (white text)', value: 'light' },
                    { title: 'Dark (dark text)', value: 'dark' },
                ],
                layout: 'radio',
            },
        }),

        // ---------------------------------------------------------------
        // Unified page-builder content (Phase 1A — replaces the per-channel
        // content<Channel> arrays below). Available on every channel; each
        // app's PageBuilder registry decides what to render.
        //
        // The legacy fields below remain in place during the transition so
        // existing 1SP pages keep rendering. A migration (PR 3) copies their
        // data into this field; later PRs deprecate then remove them.
        // ---------------------------------------------------------------
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            group: 'content',
            description:
                'Unified page-builder content. New pages should use this field. ' +
                'Legacy per-channel fields (Content 1SP, Content MSM, etc.) are ' +
                'kept temporarily for backward compatibility and will be removed.',
            of: [
                // 1SP / FLZR shared block set (29 types)
                { type: 'headlineChallenge', title: 'Headline Component' },
                { type: 'heroShowTime' },
                { type: 'sublineComponent' },
                { type: 'oneSPHeader' },
                { type: 'contentSection' },
                { type: 'twoColContentSection' },
                { type: 'tabbedContentSection' },
                { type: 'casesIntro' },
                { type: 'casesGalleryFiltered' },
                { type: 'casesGalleryFilteredWithPagination' },
                { type: 'servicesGalleryFiltered' },
                { type: 'servicesHeroWithBadge' },
                { type: 'intertitleCTA' },
                { type: 'galleryHeroStep' },
                { type: 'galleryCardsStep' },
                { type: 'galleryListStep' },
                { type: 'galleryPeopleStep' },
                { type: 'galleryScrollHighlightStep' },
                { type: 'galleryRevealStep' },
                { type: 'galleryOverview' },
                { type: 'carousel' },
                { type: 'smartCarousel' },
                { type: 'smartPeople' },
                { type: 'smartUnitsGallery' },
                { type: 'smartUnitsGlobe' },
                { type: 'globeComponent' },
                { type: 'unitLogoGrid' },
                { type: 'pageBuilderLogoFloat' },
                { type: 'pageBuilderPersonioJobs' },
                // Portable text — covers what contentMSM / contentStudioCO2 used to hold
                { type: 'block' },
            ],
        }),

        defineField({
            name: 'contactForm',
            title: 'Contact Form',
            type: 'contactForm',
            group: 'content',
            description: 'Shown after the Page Builder modules on the Contact page.',
            hidden: ({ parent }: any) => parent?.slug?.current !== 'contact',
        }),

        defineField({
            name: 'channel',
            title: 'Channel',
            type: 'string',
            group: 'settings',
            options: {
                list: [
                    { title: '1sp Website', value: '1spWeb' },
                    { title: 'MSM Website', value: 'msmWeb' },
                    { title: 'Studio CO2 Website', value: 'studioco2Web' },
                    { title: 'Flizr Website', value: 'flizrWeb' },
                ],
            },
            readOnly: true,
            initialValue: (context: any) =>
                context?.document?.__inferMetadata?.params?.channel || '1spWeb',
            description: 'Automatically set from creation location',
        }),
    ],

    preview: {
        select: { title: 'title', channel: 'channel', isHomepage: 'isHomepage' },
        prepare({ title, channel, isHomepage }: any) {
            const channelLabel = channel === '1spWeb' ? '1SP Website'
                : channel === 'msmWeb' ? 'MSM Website'
                    : channel === 'studioco2Web' ? 'Studio CO2 Website'
                        : channel === 'flizrWeb' ? 'Flizr Website'
                            : channel || '';
            const suffix = isHomepage ? ' • 🏠 Homepage' : '';
            return {
                title: title || 'Untitled Page',
                subtitle: `${channelLabel}${suffix}`,
            }
        },
    },
})
