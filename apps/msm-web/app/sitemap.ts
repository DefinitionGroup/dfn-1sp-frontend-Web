import {sanityFetch} from "@1sp/sanity-queries/fetch";
import {msmPath} from "@msm/lib/editorial";
import type { MetadataRoute } from "next";
import { getAllPageSitemapSlugs, getAllCaseSlugs, getAllMsmUnitSlugs } from "@1sp/sanity-queries";
import { MSM_CANONICAL_URL as CANONICAL_URL } from "@msm/lib/site-url";

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
    const pages = await getAllPageSitemapSlugs("msmWeb");
    const pageEntries: MetadataRoute.Sitemap = pages
      .filter((page) => page.channel === "msmWeb")
      .map((page) => ({
        url: `${CANONICAL_URL}${msmPath(page.language || "en", page.slug)}`,
        lastModified: page._updatedAt ? new Date(page._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // Case studies from Sanity (includes real _updatedAt dates)
    const [cases, units] = await Promise.all([getAllCaseSlugs(), getAllMsmUnitSlugs()]);
    const caseEntries: MetadataRoute.Sitemap = cases
      .filter((cs) => cs.channel?.includes("msmWeb"))
      .map((cs) => ({
        url: `${CANONICAL_URL}${msmPath(cs.language || "en", `cases/${cs.slug}`)}`,
        lastModified: cs._updatedAt ? new Date(cs._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }));

    const unitEntries: MetadataRoute.Sitemap = units.map((unit: { slug: string; language?: string; _updatedAt?: string }) => ({
      url: `${CANONICAL_URL}${msmPath(unit.language || "en", `units/${unit.slug}`)}`,
      lastModified: unit._updatedAt ? new Date(unit._updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    const {data: people} = await sanityFetch({query: `*[_type == "person" && "msmWeb" in channel && defined(siteContent[channel == "msmWeb"][0].slug.current)]{language, _updatedAt, "slug": siteContent[channel == "msmWeb"][0].slug.current}`, perspective: "published", stega: false});
    const peopleEntries = people.map((p: {language: string; slug: string; _updatedAt: string}) => ({url: `${CANONICAL_URL}${msmPath(p.language, `people/${p.slug}`)}`, lastModified: new Date(p._updatedAt), changeFrequency: "monthly" as const, priority: 0.6}));
    return [...homePages, {url: `${CANONICAL_URL}/de`, changeFrequency: "weekly", priority: 1}, ...pageEntries, ...caseEntries, ...unitEntries, ...peopleEntries];
}
