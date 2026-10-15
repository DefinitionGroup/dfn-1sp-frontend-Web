import type { MetadataRoute } from "next";
import { getRobotsRoute } from "@1sp/utils/deployment-tier";
import { isRenaissancePublic } from "@renaissance/lib/deployment";
import { CANONICAL_URL } from "@renaissance/lib/structured-data";

/**
 * Robots.txt configuration
 *
 * Uses the canonical production URL for the sitemap reference.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  if (!isRenaissancePublic()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return getRobotsRoute(`${CANONICAL_URL}/sitemap.xml`);
}
