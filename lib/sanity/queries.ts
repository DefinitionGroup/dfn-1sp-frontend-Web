/**
 * Centralized Sanity Data Layer
 * ==============================
 *
 * This module provides cached, deduplicated data fetching functions for Sanity.
 *
 * ## Why This Exists
 *
 * React's `cache()` function deduplicates requests within a single server render.
 * This means if both `generateMetadata()` and the page component call `getPageBySlug()`,
 * only ONE Sanity API request is made.
 *
 * ## How It Works
 *
 * 1. Each function is wrapped with `cache()` from React
 * 2. Functions use the same `sanityFetch` from next-sanity/live
 * 3. The cache key is automatically derived from function arguments
 *
 * ## Usage
 *
 * ```typescript
 * import { getGlobalData, getPageBySlug } from '@/lib/sanity/queries';
 *
 * // In generateMetadata:
 * const data = await getPageBySlug('about', '1spWeb', 'en');
 *
 * // In the page component (same request, deduped):
 * const data = await getPageBySlug('about', '1spWeb', 'en');
 * ```
 */

import { cache } from "react";
import { sanityFetch } from "@/sanity/lib/fetch";
import { defineQuery } from "next-sanity";
import { getChannelFromEnv } from "@1sp/site-config";

const INTERACTIVE_CAROUSEL_FIELD_MAP = {
  "1spWeb": "connectedDataCarouselPromo1SP",
  flizrWeb: "connectedDataCarouselPromoFLZR",
  msmWeb: "connectedDataCarouselPromoMSM",
  studioco2Web: "connectedDataCarouselPromoStudioCO2",
} as const;

// =============================================================================
// QUERY FRAGMENTS (Reusable pieces)
// =============================================================================

/**
 * Fragment for CTA links - reused across many queries
 */
const ctaLinkFragment = /* groq */ `
  link{
    _type,
    linkType,
    externalUrl,
    page->{
      _id,
      slug
    }
  }
`;

/**
 * Fragment for team member data
 */
const teamMemberFragment = /* groq */ `
  _id,
  name,
  image{
    ...,
    secure_url,
    resource_type,
    public_id
  },
  video{
    ...,
    secure_url,
    resource_type,
    public_id
  },
  altText,
  fullname,
  position,
  email,
  profileUrl,
  tagline,
  channel,
  unit->{
    _id,
    name,
    logoSignet
  }
`;

// =============================================================================
// CONSOLIDATED GLOBAL DATA QUERY
// =============================================================================

/**
 * This single query replaces 6 separate queries in SiteWrapper:
 * - NAVBAR_QUERY
 * - FOOTER_QUERY
 * - HAS_CASE_STUDIES_QUERY (now derived from cases array length)
 * - CASE_STUDIES_QUERY
 * - HAS_SERVICES_QUERY (now derived from services array length)
 * - SERVICES_QUERY
 *
 * This is a GROQ "named projection" - we create an object with named keys,
 * each containing the result of a subquery.
 */
const GLOBAL_DATA_QUERY = defineQuery(/* groq */ `{
  "nav": *[_type == "menu" && menuType == "Navbar" && channel == $channel && language == $language][0]{
    _id,
    title,
    menuType,
    imageCloud,
    "logoUrl": imageCloud.secure_url,
    menuItems[]{
      _key,
      "slug": page->slug.current,
      "title": page->title,
      displayName
    }
  },
  "footer": *[_type == "menu" && menuType == "Footer" && channel == $channel && language == $language][0]{
    _id,
    menuType,
    imageCloud,
    addressTitle,
    locations[]{
      _key,
      name,
      address
    },
    footerColumns[]{
      _key,
      title,
      links[]{
        _key,
        linkType,
        isCaseLink,
        "slug": page->slug.current,
        "case": case->{ "slug": slug },
        externalUrl,
        displayName
      }
    },
    socialLinks[]{
      _key,
      icon,
      name,
      url
    },
    copyright
  },
  "hasCaseStudies": count(*[_type == "caseStudy" && $channel in channel && language == $language && isPublished == true]) > 0,
  "hasServices": count(*[_type == "services" && language == $language]) > 0
}`);

// =============================================================================
// TYPES
// =============================================================================

/**
 * Type for the consolidated global data response
 */
export interface GlobalData {
  nav: {
    _id: string;
    title: string;
    menuType: string;
    imageCloud: unknown;
    logoUrl: string | null;
    menuItems: Array<{
      _key: string;
      slug: string | null;
      title: string | null;
      displayName: string | null;
    }>;
  } | null;
  footer: {
    _id: string;
    menuType: string;
    imageCloud: unknown;
    addressTitle: string | null;
    locations: Array<{
      _key: string;
      name: string;
      address: string;
    }>;
    footerColumns: Array<{
      _key: string;
      title: string;
      links: Array<{
        _key: string;
        linkType: string;
        isCaseLink: boolean;
        slug: string | null;
        case: { slug: { current: string } } | null;
        externalUrl: string | null;
        displayName: string;
      }>;
    }>;
    socialLinks: Array<{
      _key: string;
      icon: string;
      name: string;
      url: string;
    }>;
    copyright: string | null;
  } | null;
  hasCaseStudies: boolean;
  hasServices: boolean;
}

// =============================================================================
// CACHED DATA FETCHING FUNCTIONS
// =============================================================================

/**
 * Fetch all global shell data in ONE request.
 *
 * This replaces 6 separate queries and is cached for the entire render.
 *
 * @param channel - The channel (e.g., "1spWeb")
 * @param language - The language code (e.g., "en", "de")
 * @returns Object containing nav, footer, and lightweight availability flags
 *
 * @example
 * ```typescript
 * const { nav, footer, hasCaseStudies, hasServices } = await getGlobalData('1spWeb', 'en');
 * ```
 */
export const getGlobalData = cache(
  async (channel: string, language: string): Promise<GlobalData> => {
    const { data } = await sanityFetch({
      query: GLOBAL_DATA_QUERY,
      params: { channel, language },
      tags: ["global"],
    });

    return (data as GlobalData) || {
      nav: null,
      footer: null,
      hasCaseStudies: false,
      hasServices: false,
    };
  }
);

/**
 * Fetch a page by its slug.
 *
 * Cached - if called multiple times in the same render (e.g., generateMetadata + page),
 * only one API request is made.
 *
 * @param slug - The page slug
 * @param channel - The channel (e.g., "1spWeb")
 * @param language - The language code (e.g., "en", "de")
 */
export const getPageBySlug = cache(
  async (slug: string, channel: string, language: string) => {
    // Import the existing PAGE_QUERY to avoid duplication
    const { PAGE_QUERY } = await import("@/sanity/lib/queries");

    const { data } = await sanityFetch({
      query: PAGE_QUERY,
      params: { slug, channel, language },
      tags: ["pages", `page:${slug}`],
    });

    return data;
  }
);

/**
 * Fetch the home page.
 *
 * Cached for deduplication between generateMetadata and page render.
 *
 * @param channel - The channel (e.g., "1spWeb")
 * @param language - The language code (e.g., "en", "de")
 */
export const getHomePage = cache(async (channel: string, language: string) => {
  // Import the existing HOME_PAGE_QUERY
  const { HOME_PAGE_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { channel, language },
    tags: ["pages"],
  });

  return data;
});

/**
 * Fetch a case study by its slug.
 *
 * @param slug - The case study slug
 * @param channel - The channel (e.g., "1spWeb")
 * @param language - The language code
 */
export const getCaseBySlug = cache(async (slug: string, channel: string, language: string) => {
  const { CASE_STUDY_BY_SLUG_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: CASE_STUDY_BY_SLUG_QUERY,
    params: { slug, channel, language },
    tags: ["cases", `case:${slug}`],
  });

  return data;
});

/**
 * Fetch all case studies (for listings).
 *
 * @param channel - The channel
 * @param language - The language code
 */
export const getAllCases = cache(async (channel: string, language: string) => {
  const { CASE_STUDIES_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: CASE_STUDIES_QUERY,
    params: { channel, language },
    tags: ["cases"],
  });

  return data || [];
});

/**
 * Fetch all services.
 *
 * @param language - The language code
 */
export const getAllServices = cache(async (language: string) => {
  const { SERVICES_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: SERVICES_QUERY,
    params: { language },
    tags: ["services"],
  });

  return data || [];
});

/**
 * Fetch services assigned to a website channel.
 *
 * This is intentionally separate from `getAllServices()` so existing 1SP
 * pages keep their current behavior until they are migrated deliberately.
 */
export const getAllServicesForChannel = cache(async (channel: string, language: string) => {
  const { SERVICES_BY_CHANNEL_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: SERVICES_BY_CHANNEL_QUERY,
    params: { channel, language },
    tags: ["services"],
  });

  return data || [];
});

export const getCasesForChannel = cache(
  async (channel: string, language: string, maxItems = 6) => {
    const { CASE_STUDIES_BY_CHANNEL_LIMIT_QUERY } = await import("@/sanity/lib/queries");

    const { data } = await sanityFetch({
      query: CASE_STUDIES_BY_CHANNEL_LIMIT_QUERY,
      params: { channel, language, maxItems },
      tags: ["cases"],
    });

    return data || [];
  }
);

export const getServicesForChannel = cache(
  async (channel: string, language: string, maxItems = 8) => {
    const { SERVICES_BY_CHANNEL_LIMIT_QUERY } = await import("@/sanity/lib/queries");

    const { data } = await sanityFetch({
      query: SERVICES_BY_CHANNEL_LIMIT_QUERY,
      params: { channel, language, maxItems },
      tags: ["services"],
    });

    return data || [];
  }
);

export const getSmartPeople = cache(
  async (
    channel: "1spWeb" | "flizrWeb" | "msmWeb" | "studioco2Web",
    maxItems: number,
  ) => {
    const { SMART_PEOPLE_QUERY } = await import("@/sanity/lib/queries");

      const { data } = await sanityFetch({
        query: SMART_PEOPLE_QUERY,
        params: {
          channel,
          maxItems: Math.max(0, maxItems - 1),
        },
        tags: ["people"],
      });

    return data || [];
  }
);

export const getSmartUnits = cache(
  async (
    language: string,
    maxItems: number,
    sortBy: "recent" | "name-asc" | "name-desc" = "recent",
  ) => {
    const { SMART_UNITS_QUERY } = await import("@/sanity/lib/queries");

    const sortExpression =
      sortBy === "name-asc"
        ? "order(name asc)"
        : sortBy === "name-desc"
          ? "order(name desc)"
          : "order(_createdAt desc)";

    const { data } = await sanityFetch({
      query: defineQuery(
        SMART_UNITS_QUERY.replace("order(_createdAt desc)", sortExpression)
      ),
      params: {
        language,
        maxItems: Math.max(0, maxItems - 1),
      },
      tags: ["units"],
    });

    return data || [];
  }
);

export const getUnitLogoGridUnits = cache(async (language: string, maxItems: number) => {
  const { UNIT_LOGO_GRID_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: UNIT_LOGO_GRID_QUERY,
    params: {
      language,
      maxItems: Math.max(0, maxItems - 1),
    },
    tags: ["units"],
  });

  return data || [];
});

export const getUnitLogoFloatUnits = cache(async (language: string, maxItems: number) => {
  const { UNIT_LOGO_FLOAT_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: UNIT_LOGO_FLOAT_QUERY,
    params: { language, maxItems },
    tags: ["units"],
  });

  return data || [];
});

export const getCaseStudiesByIds = cache(async (ids: string[]) => {
  if (!ids.length) {
    return [];
  }

  const { CASE_STUDIES_BY_IDS_QUERY } = await import("@/sanity/lib/queries");

  const { data } = await sanityFetch({
    query: CASE_STUDIES_BY_IDS_QUERY,
    params: { ids },
    tags: ["cases"],
  });

  return data || [];
});

export const getInteractiveCarouselCases = cache(
  async (channel: string, language: string, maxItems: number) => {
    const normalizedChannel =
      channel in INTERACTIVE_CAROUSEL_FIELD_MAP ? channel : "1spWeb";
    const carouselField =
      INTERACTIVE_CAROUSEL_FIELD_MAP[
        normalizedChannel as keyof typeof INTERACTIVE_CAROUSEL_FIELD_MAP
      ];

    const { getInteractiveCarouselQuery } = await import("@/sanity/lib/queries");

    const { data } = await sanityFetch({
      query: defineQuery(getInteractiveCarouselQuery(carouselField)),
      params: { channel: normalizedChannel, language, maxItems },
      tags: ["cases"],
    });

    return data || [];
  }
);

// =============================================================================
// STATIC GENERATION HELPERS
// =============================================================================

/**
 * Get all case study slugs for static generation.
 *
 * Used in generateStaticParams() to pre-render case study pages at build time.
 *
 * @example
 * ```typescript
 * export async function generateStaticParams() {
 *   const slugs = await getAllCaseSlugs();
 *   return slugs.map(({ slug, language }) => ({
 *     slug: slug.current,
 *     locale: language
 *   }));
 * }
 * ```
 */
export const getAllCaseSlugs = cache(async () => {
  const CASE_SLUGS_QUERY = defineQuery(/* groq */ `
    *[_type == "caseStudy" && isPublished == true && defined(slug.current)]{
      "slug": slug.current,
      language,
      channel,
      _updatedAt
    }
  `);

  const { data } = await sanityFetch({
    query: CASE_SLUGS_QUERY,
    params: {},
    // For static generation, we want the latest data
    perspective: "published",
    stega: false,
  });

  return (data as Array<{ slug: string; language: string; channel?: string[]; _updatedAt: string }>) || [];
});

/**
 * Get all page slugs for static generation.
 *
 * Filters by the deployment's active channel (resolved via
 * `NEXT_PUBLIC_CHANNEL`, default `1spWeb`). Each site should only pre-render
 * its own channel's pages — pages from other channels would render empty
 * because they live in different `content<Channel>` arrays.
 *
 * Pass an explicit `channel` to override (e.g. internal tooling).
 */
export const getAllPageSlugs = cache(async (channel: string = getChannelFromEnv()) => {
  const PAGE_SLUGS_QUERY = defineQuery(/* groq */ `
    *[_type == "page" && defined(slug.current) && !isHomepage && channel == $channel]{
      "slug": slug.current,
      language,
      channel,
      _updatedAt
    }
  `);

  const { data } = await sanityFetch({
    query: PAGE_SLUGS_QUERY,
    params: { channel },
    perspective: "published",
    stega: false,
  });

  return (
    (data as Array<{ slug: string; language: string; channel: string; _updatedAt: string }>) || []
  );
});

/**
 * Get all page slugs that should be included in sitemap.xml.
 *
 * Filters by the deployment's active channel — each site's sitemap only
 * includes pages belonging to its channel.
 */
export const getAllPageSitemapSlugs = cache(async (channel: string = getChannelFromEnv()) => {
  const PAGE_SITEMAP_SLUGS_QUERY = defineQuery(/* groq */ `
    *[
      _type == "page" &&
      defined(slug.current) &&
      !isHomepage &&
      channel == $channel &&
      metadata.excludeFromSitemap != true
    ]{
      "slug": slug.current,
      language,
      channel,
      _updatedAt
    }
  `);

  const { data } = await sanityFetch({
    query: PAGE_SITEMAP_SLUGS_QUERY,
    params: { channel },
    perspective: "published",
    stega: false,
  });

  return (
    (data as Array<{ slug: string; language: string; channel: string; _updatedAt: string }>) || []
  );
});
