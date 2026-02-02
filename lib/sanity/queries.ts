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
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";

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

/**
 * Fragment for case study cards (used in carousels/listings)
 */
const caseStudyCardFragment = /* groq */ `
  _id,
  title,
  subtitle,
  slug,
  description,
  services[]->{
    _id,
    name,
    taglabel
  },
  mainImage,
  isVerticalVideo,
  mainVideo,
  "mainImageUrl": mainImage.secure_url,
  "mainVideoUrl": mainVideo.asset->url,
  client->{
    _id,
    name,
    logo,
    "logoUrl": logo.secure_url
  },
  websiteUrl,
  websiteUrlText,
  publishedAt
`;

/**
 * Fragment for service data
 */
const serviceFragment = /* groq */ `
  _id,
  name,
  taglabel,
  "iconUrl": serviceicon.asset.secure_url,
  serviceicon,
  serviceBackground,
  serviceDescription,
  servicegrouprel[]->{
    _id,
    name,
    taglabel
  },
  unitsrel[]->{
    _id,
    name,
    slug,
    tagline,
    "logoUrl": logo.secure_url,
    backgroundImage,
    cta
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
  "cases": *[_type == "caseStudy" && channel match $channel && language == $language && isPublished == true] | order(publishedAt desc){
    ${caseStudyCardFragment}
  },
  "services": *[_type == "services" && language == $language] | order(name asc){
    ${serviceFragment}
  }
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
  cases: Array<{
    _id: string;
    title: string;
    subtitle: string | null;
    slug: { current: string };
    description: string | null;
    services: Array<{ _id: string; name: string; taglabel: string | null }>;
    mainImage: unknown;
    isVerticalVideo: boolean;
    mainVideo: unknown;
    mainImageUrl: string | null;
    mainVideoUrl: string | null;
    client: {
      _id: string;
      name: string;
      logo: unknown;
      logoUrl: string | null;
    } | null;
    websiteUrl: string | null;
    websiteUrlText: string | null;
    publishedAt: string | null;
  }>;
  services: Array<{
    _id: string;
    name: string;
    taglabel: string | null;
    iconUrl: string | null;
    serviceicon: unknown;
    serviceBackground: string | null;
    serviceDescription: string | null;
    servicegrouprel: Array<{
      _id: string;
      name: string;
      taglabel: string | null;
    }>;
    unitsrel: Array<{
      _id: string;
      name: string;
      slug: { current: string };
      tagline: string | null;
      logoUrl: string | null;
      backgroundImage: unknown;
      cta: unknown;
    }>;
  }>;
}

// =============================================================================
// CACHED DATA FETCHING FUNCTIONS
// =============================================================================

/**
 * Fetch all global data (nav, footer, cases, services) in ONE request.
 *
 * This replaces 6 separate queries and is cached for the entire render.
 *
 * @param channel - The channel (e.g., "1spWeb")
 * @param language - The language code (e.g., "en", "de")
 * @returns Object containing nav, footer, cases, and services
 *
 * @example
 * ```typescript
 * const { nav, footer, cases, services } = await getGlobalData('1spWeb', 'en');
 * const hasCases = cases.length > 0;
 * const hasServices = services.length > 0;
 * ```
 */
export const getGlobalData = cache(
  async (channel: string, language: string): Promise<GlobalData> => {
    const { data } = await sanityFetch({
      query: GLOBAL_DATA_QUERY,
      params: { channel, language },
    });

    return (data as GlobalData) || {
      nav: null,
      footer: null,
      cases: [],
      services: [],
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
  });

  return data || [];
});

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
      language
    }
  `);

  const { data } = await sanityFetch({
    query: CASE_SLUGS_QUERY,
    params: {},
    // For static generation, we want the latest data
    perspective: "published",
    stega: false,
  });

  return (data as Array<{ slug: string; language: string }>) || [];
});

/**
 * Get all page slugs for static generation.
 */
export const getAllPageSlugs = cache(async () => {
  const PAGE_SLUGS_QUERY = defineQuery(/* groq */ `
    *[_type == "page" && defined(slug.current) && !isHomepage]{
      "slug": slug.current,
      language,
      channel
    }
  `);

  const { data } = await sanityFetch({
    query: PAGE_SLUGS_QUERY,
    params: {},
    perspective: "published",
    stega: false,
  });

  return (
    (data as Array<{ slug: string; language: string; channel: string }>) || []
  );
});
