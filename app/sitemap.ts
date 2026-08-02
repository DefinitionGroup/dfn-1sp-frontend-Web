import type { MetadataRoute } from "next";
import { getAllPageSitemapSlugs, getAllCaseSlugs } from "@1sp/sanity-queries";
import { CANONICAL_URL } from "@/lib/structured-data";

const PUBLIC_LANGUAGE = "en";
const RESERVED_NON_PUBLIC_SLUGS = new Set(["test"]);

type SitemapDocument = {
    slug: string;
    language?: string;
    _updatedAt?: string;
};

function uniqueLatestBySlug<T extends SitemapDocument>(documents: T[]): T[] {
    const bySlug = new Map<string, T>();

    for (const document of documents) {
        const current = bySlug.get(document.slug);
        if (!current || (document._updatedAt ?? "") > (current._updatedAt ?? "")) {
            bySlug.set(document.slug, document);
        }
    }

    return [...bySlug.values()];
}

/**
 * Dynamic Sitemap
 *
 * Generates a sitemap.xml from all published pages and case studies in Sanity.
 * URLs are locale-free (no /en/ prefix) since middleware handles the rewrite.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Homepage
    const homePages: MetadataRoute.Sitemap = [
        {
            url: CANONICAL_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
    ];

    // Dynamic pages from Sanity (includes real _updatedAt dates)
    const pages = await getAllPageSitemapSlugs();
    const publicPages = uniqueLatestBySlug(
        pages.filter(
            (page) =>
                (page.language || PUBLIC_LANGUAGE) === PUBLIC_LANGUAGE &&
                !RESERVED_NON_PUBLIC_SLUGS.has(page.slug),
        ),
    );
    const pageEntries: MetadataRoute.Sitemap = publicPages.map((page) => ({
        url: `${CANONICAL_URL}/${page.slug}`,
        lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    // Case studies from Sanity (includes real _updatedAt dates)
    const cases = await getAllCaseSlugs();
    const publicCases = uniqueLatestBySlug(
      cases.filter(
        (cs) =>
          cs.channel?.includes("1spWeb") &&
          (cs.language || PUBLIC_LANGUAGE) === PUBLIC_LANGUAGE,
      ),
    );
    const caseEntries: MetadataRoute.Sitemap = publicCases
      .map((cs) => ({
        url: `${CANONICAL_URL}/cases/${cs.slug}`,
        lastModified: cs._updatedAt ? new Date(cs._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));

    return [...homePages, ...pageEntries, ...caseEntries];
}
