import type { MetadataRoute } from "next";
import { getAllPageSlugs, getAllCaseSlugs } from "@/lib/sanity/queries";

/**
 * Dynamic Sitemap
 *
 * Generates a sitemap.xml from all published pages and case studies in Sanity.
 * This helps search engines discover and index all content efficiently.
 *
 * Includes:
 * - Homepage for each locale
 * - All dynamic pages (about, services, contact, etc.)
 * - All published case studies
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000";

    // Supported locales
    const locales = ["en", "de", "es"];

    // Static homepage entries for each locale
    const homePages: MetadataRoute.Sitemap = locales.map((locale) => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
        alternates: {
            languages: Object.fromEntries(
                locales.map((l) => [l, `${baseUrl}/${l}`])
            ),
        },
    }));

    // Dynamic pages from Sanity
    const pages = await getAllPageSlugs();
    const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
        url: `${baseUrl}/${page.language || "en"}/${page.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    // Case studies from Sanity
    const cases = await getAllCaseSlugs();
    const caseEntries: MetadataRoute.Sitemap = cases.map((cs) => ({
        url: `${baseUrl}/${cs.language || "en"}/cases/${cs.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    return [...homePages, ...pageEntries, ...caseEntries];
}
