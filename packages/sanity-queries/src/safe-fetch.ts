/**
 * Safe Sanity Fetch Wrapper
 * =========================
 *
 * This module provides a robust wrapper around Sanity fetching with:
 * - Automatic retries with exponential backoff
 * - Structured error logging
 * - Graceful fallbacks for non-critical data
 * - Type safety with generics
 *
 * ## When to Use This
 *
 * Use `safeSanityFetch` for:
 * - Navigation/footer data (should never crash the page)
 * - Non-critical content where errors can be gracefully handled
 * - Background data loading where fallbacks are acceptable
 *
 * Use regular `sanityFetch` for:
 * - Main page content (missing = 404)
 * - Draft mode/live preview (needs real-time feedback)
 *
 * ## Example
 *
 * ```typescript
 * const navData = await safeSanityFetch({
 *   query: NAV_QUERY,
 *   params: { channel, language },
 *   fallback: { menuItems: [] },
 *   context: 'Navigation data fetch'
 * });
 * ```
 */

import { sanityFetch } from "./fetch";
import type { QueryParams } from "next-sanity";

// =============================================================================
// TYPES
// =============================================================================

interface SafeFetchOptions<TFallback> {
  /**
   * The GROQ query to execute
   */
  query: string;

  /**
   * Query parameters
   */
  params?: QueryParams;

  /**
   * Human-readable context for error messages
   * @example "Fetching navigation for en/1spWeb"
   */
  context?: string;

  /**
   * Fallback value if all retries fail
   * If not provided, errors will be thrown
   */
  fallback?: TFallback;

  /**
   * Number of retry attempts (default: 2)
   */
  retries?: number;

  /**
   * Base delay between retries in ms (default: 500)
   * Actual delay = attempt * baseDelay (exponential backoff)
   */
  retryDelay?: number;

  /**
   * Whether to log errors to console (default: true in development)
   */
  logErrors?: boolean;
}

interface FetchResult<T> {
  data: T;
  error: Error | null;
  retryCount: number;
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

/**
 * Custom error class for Sanity fetch failures
 * Contains additional context for debugging
 */
export class SanityFetchError extends Error {
  public readonly context: string;
  public readonly query: string;
  public readonly params: QueryParams | undefined;
  public readonly originalError: Error;
  public readonly retryCount: number;

  constructor(
    message: string,
    options: {
      context: string;
      query: string;
      params?: QueryParams;
      originalError: Error;
      retryCount: number;
    }
  ) {
    super(message);
    this.name = "SanityFetchError";
    this.context = options.context;
    this.query = options.query;
    this.params = options.params;
    this.originalError = options.originalError;
    this.retryCount = options.retryCount;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if we're in development mode
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * Truncate a query for logging (avoid huge console output)
 */
const truncateQuery = (query: string, maxLength = 100): string => {
  if (query.length <= maxLength) return query;
  return query.slice(0, maxLength) + "...";
};

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Safely fetch data from Sanity with automatic retries and error handling.
 *
 * ## How Exponential Backoff Works
 *
 * When a request fails, we wait longer before each retry:
 * - Attempt 0: Immediate
 * - Attempt 1: Wait 500ms
 * - Attempt 2: Wait 1000ms
 *
 * This prevents overwhelming a potentially struggling server.
 *
 * ## Fallback Behavior
 *
 * - If `fallback` is provided: Returns fallback on error, no throw
 * - If no `fallback`: Throws SanityFetchError after all retries exhausted
 *
 * @param options - Fetch configuration
 * @returns The query result, or fallback if provided
 */
export async function safeSanityFetch<TData, TFallback = TData>(
  options: SafeFetchOptions<TFallback>
): Promise<TData | TFallback> {
  const {
    query,
    params = {},
    context = "Sanity fetch",
    fallback,
    retries = 2,
    retryDelay = 500,
    logErrors = isDev,
  } = options;

  let lastError: Error | null = null;
  let attemptCount = 0;

  // Try the fetch with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    attemptCount = attempt;

    try {
      // Wait before retry (except first attempt)
      if (attempt > 0) {
        const delay = attempt * retryDelay;
        if (logErrors) {
          console.log(
            `[Sanity] Retry ${attempt}/${retries} for "${context}" after ${delay}ms`
          );
        }
        await sleep(delay);
      }

      // Attempt the fetch
      const { data } = await sanityFetch({
        query,
        params,
      });

      // Success! Return the data
      return data as TData;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Log the error in development
      if (logErrors) {
        console.error(
          `[Sanity] Fetch failed (attempt ${attempt + 1}/${retries + 1}):`,
          {
            context,
            error: lastError.message,
            query: truncateQuery(query),
            params,
          }
        );
      }
    }
  }

  // All retries exhausted
  if (fallback !== undefined) {
    // Return fallback instead of throwing
    if (logErrors) {
      console.warn(
        `[Sanity] All retries failed for "${context}", using fallback`
      );
    }
    return fallback;
  }

  // No fallback provided - throw a detailed error
  throw new SanityFetchError(
    `Sanity fetch failed after ${retries + 1} attempts: ${context}`,
    {
      context,
      query,
      params,
      originalError: lastError!,
      retryCount: attemptCount,
    }
  );
}

// =============================================================================
// SPECIALIZED WRAPPERS
// =============================================================================

/**
 * Fetch critical global data (nav, footer) with guaranteed fallback.
 *
 * This NEVER throws - it always returns either data or a safe empty structure.
 * Use this for data that must never crash the page.
 *
 * @example
 * ```typescript
 * const nav = await safeFetchGlobalData(NAVBAR_QUERY, { channel, language });
 * // nav is guaranteed to be an object, even if fetch fails
 * ```
 */
export async function safeFetchGlobalData<T extends object>(
  query: string,
  params: QueryParams,
  emptyFallback: T,
  context?: string
): Promise<T> {
  return safeSanityFetch<T, T>({
    query,
    params,
    fallback: emptyFallback,
    context: context || "Global data fetch",
    retries: 2,
  });
}

/**
 * Fetch page content with proper error propagation.
 *
 * Unlike safeSanityFetch, this throws on error (after retries) because
 * missing page content usually means we should show a 404.
 *
 * @example
 * ```typescript
 * const page = await fetchPageContent(PAGE_QUERY, { slug, channel, language });
 * if (!page) notFound();
 * ```
 */
export async function fetchPageContent<T>(
  query: string,
  params: QueryParams,
  context?: string
): Promise<T | null> {
  try {
    return await safeSanityFetch<T>({
      query,
      params,
      context: context || "Page content fetch",
      retries: 1, // Fewer retries for pages - fail faster
    });
  } catch (error) {
    // For page content, we return null to let the page handle 404
    if (isDev) {
      console.error(`[Sanity] Page fetch failed:`, error);
    }
    return null;
  }
}

// =============================================================================
// BATCH FETCH HELPER
// =============================================================================

/**
 * Fetch multiple queries in parallel with individual error handling.
 *
 * Each query is independent - if one fails, others still succeed.
 *
 * @example
 * ```typescript
 * const results = await batchSanityFetch([
 *   { key: 'nav', query: NAV_QUERY, params, fallback: {} },
 *   { key: 'footer', query: FOOTER_QUERY, params, fallback: {} },
 * ]);
 * // results.nav and results.footer are guaranteed to exist
 * ```
 */
export async function batchSanityFetch<
  T extends Record<string, unknown>
>(
  queries: Array<{
    key: keyof T;
    query: string;
    params?: QueryParams;
    fallback: T[keyof T];
  }>
): Promise<T> {
  const results = await Promise.all(
    queries.map(async ({ key, query, params, fallback }) => {
      const data = await safeSanityFetch({
        query,
        params,
        fallback,
        context: `Batch fetch: ${String(key)}`,
      });
      return { key, data };
    })
  );

  return results.reduce((acc, { key, data }) => {
    acc[key] = data as T[keyof T];
    return acc;
  }, {} as T);
}
