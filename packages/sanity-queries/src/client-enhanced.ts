/**
 * Enhanced Sanity Client Utilities
 * =================================
 *
 * This module provides additional client utilities beyond the basic
 * sanityFetch from defineLive.
 *
 * ## When to Use Which
 *
 * | Function | Use Case |
 * |----------|----------|
 * | `sanityFetch` (from live.ts) | Default for all fetches, handles live preview |
 * | `taggedFetch` | When you need explicit Next.js cache tags |
 * | `staticFetch` | For generateStaticParams (no stega, no draft) |
 *
 * ## How Cache Tags Work
 *
 * Next.js cache tags allow surgical cache invalidation:
 *
 * ```typescript
 * // When fetching:
 * const data = await taggedFetch(query, params, ['global', 'nav']);
 *
 * // When revalidating (in webhook):
 * revalidateTag('nav'); // Only invalidates fetches tagged with 'nav'
 * ```
 */

import { client } from "./client";
import { studioUrl } from "./env";
import type { QueryParams } from "next-sanity";

/**
 * Fetch from Sanity with explicit Next.js cache tags.
 *
 * Use this when you need to tie a fetch to specific cache tags
 * for surgical invalidation via webhooks.
 *
 * @param query - GROQ query string
 * @param params - Query parameters
 * @param tags - Array of cache tags
 * @param revalidate - Revalidation time in seconds (default: 60)
 *
 * @example
 * ```typescript
 * const globalData = await taggedFetch(
 *   GLOBAL_DATA_QUERY,
 *   { channel, language },
 *   ['global', 'nav', 'footer']
 * );
 * ```
 */
export async function taggedFetch<T>(
  query: string,
  params: QueryParams = {},
  tags: string[],
  revalidate: number | false = 60
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      tags,
      // If tags are specified, use tag-based invalidation
      // Otherwise fall back to time-based
      revalidate: tags.length > 0 ? false : revalidate,
    },
  });
}

/**
 * Fetch for static generation (build time).
 *
 * - Bypasses CDN to get fresh data
 * - Disables stega (no invisible characters)
 * - Returns only published content
 *
 * Use this in `generateStaticParams()` to get the latest slugs at build time.
 *
 * @example
 * ```typescript
 * export async function generateStaticParams() {
 *   const slugs = await staticFetch<{ slug: string }[]>(
 *     `*[_type == "page"]{ "slug": slug.current }`
 *   );
 *   return slugs.map(s => ({ slug: s.slug }));
 * }
 * ```
 */
export async function staticFetch<T>(
  query: string,
  params: QueryParams = {}
): Promise<T> {
  // Use API directly (not CDN) for build-time freshness
  const staticClient = client.withConfig({
    useCdn: false,
    perspective: "published",
    stega: false,
  });

  return staticClient.fetch<T>(query, params, {
    // Cache for the duration of the build, not longer
    cache: "force-cache",
    next: {
      // Don't revalidate during build
      revalidate: false,
    },
  });
}

/**
 * Fetch with custom cache configuration.
 *
 * For advanced use cases where you need full control.
 */
export async function customFetch<T>(
  query: string,
  params: QueryParams = {},
  options: {
    useCdn?: boolean;
    perspective?: "published" | "previewDrafts" | "raw";
    revalidate?: number | false;
    tags?: string[];
    stega?: boolean;
  } = {}
): Promise<T> {
  const {
    useCdn = true,
    perspective = "published",
    revalidate = 60,
    tags = [],
    stega = true,
  } = options;

  const configuredClient = client.withConfig({
    useCdn,
    perspective,
    stega: stega ? { studioUrl } : false,
  });

  return configuredClient.fetch<T>(query, params, {
    next: {
      revalidate: tags.length > 0 ? false : revalidate,
      tags,
    },
  });
}
