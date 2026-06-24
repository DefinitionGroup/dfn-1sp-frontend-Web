import type { MetadataRoute } from "next";
import { CANONICAL_URL } from "@/lib/structured-data";

/**
 * Robots.txt configuration
 *
 * Uses the canonical production URL for the sitemap reference.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/studio", "/studio/", "/api/"],
            },
        ],
        sitemap: `${CANONICAL_URL}/sitemap.xml`,
    };
}
