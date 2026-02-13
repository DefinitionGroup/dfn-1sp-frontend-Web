import type { MetadataRoute } from "next";

/**
 * Robots.txt configuration
 *
 * Tells search engine crawlers which pages to index and where to find the sitemap.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/studio", "/studio/", "/api/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
