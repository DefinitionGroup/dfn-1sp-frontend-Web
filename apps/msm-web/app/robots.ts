import type { MetadataRoute } from "next";
import { getRobotsRoute } from "@1sp/utils/deployment-tier";
import { MSM_CANONICAL_URL as CANONICAL_URL } from "@msm/lib/site-url";

/**
 * Robots.txt configuration
 *
 * Uses the canonical production URL for the sitemap reference.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return getRobotsRoute(`${CANONICAL_URL}/sitemap.xml`);
}
