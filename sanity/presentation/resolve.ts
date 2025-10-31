import { defineDocuments, defineLocations } from 'sanity/presentation'

// Map docs → front-end locations (used by “Open preview” / “Used on x pages”)
export const locations = {
    page: defineLocations({
        select: { title: 'title', slug: 'slug.current', language: 'language' },
        resolve: (doc) => {
            if (!doc) {
                return { locations: [] };
            }

            const title = (doc as any).title as string | undefined;
            const slug = (doc as any).slug as string | undefined;
            const language = (doc as any).language as string | undefined;

            const locations: { title: string; href: string }[] = [];

            if (!slug) {
                // Home page (no slug)
                locations.push({ title: `${title ?? 'Home'}`, href: `/${language}` });
            } else {
                // Normal page with slug
                locations.push({ title: title ?? slug, href: `/${language}/${slug}` });
            }

            return { locations };
        },
    }),
    // Optional, if menus have a route:
    // menu: defineLocations({ ... })
};

// Map URLs in the preview → docs that should show up in “Documents on this page”
export const mainDocuments = defineDocuments([
    // /:locale (home)
    {
        route: '/:locale',
        filter: `
      _type == "page" &&
      language == $locale &&
      (!defined(slug.current) || slug.current in ["", "home", "index"])
    `,
        params: ({ params }) => ({
            locale: params?.locale,
        }),
    },
    // /:locale/:slug (regular pages)
    {
        route: '/:locale/:slug',
        filter: `
      _type == "page" &&
      language == $locale &&
      slug.current == $slug
    `,
        params: ({ params }) => ({
            locale: params?.locale,
            slug: params?.slug,
        }),
    },
])
