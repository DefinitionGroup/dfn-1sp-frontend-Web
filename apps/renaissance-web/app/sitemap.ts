import type { MetadataRoute } from "next";
import {
    getAllPageSitemapSlugs,
    getAllCaseSlugs,
    getHomePage,
} from "@1sp/sanity-queries";
import { CANONICAL_URL } from "@renaissance/lib/structured-data";

/**
 * Dynamic Sitemap
 *
 * Generates a sitemap.xml from all published pages and case studies in Sanity.
 * URLs are locale-free (no /en/ prefix) since middleware handles the rewrite.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const homepage = await getHomePage("renaissanceWeb", "en");

    // Homepage
    const homePages: MetadataRoute.Sitemap = homepage ? [
        {
            url: CANONICAL_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
    ] : [];

    // Dynamic pages from Sanity (includes real _updatedAt dates)
    const pages = await getAllPageSitemapSlugs();
    const pageEntries: MetadataRoute.Sitemap = pages
      .filter(
        (page) =>
          page.channel === "renaissanceWeb" && page.language === "en",
      )
      .map((page) => ({
        url: `${CANONICAL_URL}/${page.slug}`,
        lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // Case studies from Sanity (includes real _updatedAt dates)
    const cases = await getAllCaseSlugs();
    const caseEntries: MetadataRoute.Sitemap = cases
      .filter(
        (cs) => cs.channel?.includes("renaissanceWeb") && cs.language === "en",
      )
      .map((cs) => ({
        url: `${CANONICAL_URL}/cases/${cs.slug}`,
        lastModified: cs._updatedAt ? new Date(cs._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));

    return [...homePages, ...pageEntries, ...caseEntries];
}
