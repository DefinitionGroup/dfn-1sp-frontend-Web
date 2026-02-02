# Sanity Performance Refactoring Guide

> **Branch**: `performmance-refactor1-2026`  
> **Started**: January 31, 2026  
> **Goal**: Reduce Sanity API requests by ~70%, improve reliability, eliminate errors

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problems Identified](#problems-identified)
3. [Implementation Steps](#implementation-steps)
   - [Step 1: Centralized Data Layer](#step-1-centralized-data-layer)
   - [Step 2: Safe Fetch Wrapper](#step-2-safe-fetch-wrapper)
   - [Step 3: Refactor SiteWrapper](#step-3-refactor-sitewrapper)
   - [Step 4: Deduplicate Page Fetches](#step-4-deduplicate-page-fetches)
   - [Step 5: Tag-Based Cache Invalidation](#step-5-tag-based-cache-invalidation)
   - [Step 6: Static Generation](#step-6-static-generation)
4. [Testing Checklist](#testing-checklist)
5. [Rollback Plan](#rollback-plan)

---

## Executive Summary

This refactoring effort addresses several critical performance and reliability issues in our Sanity + Next.js integration. The primary goals are:

- **Reduce API calls**: From ~8-12 requests per page load to ~2-3
- **Add request deduplication**: Using React's `cache()` function
- **Implement proper error handling**: With retries and graceful fallbacks
- **Enable granular cache invalidation**: Using Sanity tags instead of broad path invalidation

---

## Problems Identified

### 🔴 Critical Issue #1: SiteWrapper Makes 6 API Calls Per Page

**File**: `components/SiteWrapper.tsx`

Every single page load triggers 6 separate Sanity API calls:

```typescript
// Current implementation - 6 separate fetches!
const { data: navbarData } = await sanityFetch({ query: NAVBAR_QUERY, ... });
const { data: footerData } = await sanityFetch({ query: FOOTER_QUERY, ... });
const { data: hasCaseStudies } = await sanityFetch({ query: HAS_CASE_STUDIES_QUERY, ... });
const { data: caseStudies } = await sanityFetch({ query: CASE_STUDIES_QUERY, ... });
const { data: hasServices } = await sanityFetch({ query: HAS_SERVICES_QUERY, ... });
const { data: services } = await sanityFetch({ query: SERVICES_QUERY, ... });
```

**Why this is bad**:
- Each `sanityFetch` call is a network round-trip to Sanity's API
- The `HAS_CASE_STUDIES_QUERY` and `HAS_SERVICES_QUERY` are redundant - we fetch the full lists anyway
- None of these are cached between page navigations
- 6 requests × every page = massive API usage

**Solution**: Consolidate into a single GROQ query using projections.

---

### 🔴 Critical Issue #2: Duplicate Page/Metadata Fetches

**Files**: `app/(site)/[locale]/page.tsx`, `app/(site)/[locale]/[slug]/page.tsx`

Pages fetch the same data twice - once for `generateMetadata()` and once for the page render:

```typescript
// In generateMetadata - fetches the page
export async function generateMetadata({ params }) {
  const { data } = await sanityFetch({ query: HOME_PAGE_QUERY, params: ... });
  return { title: data?.metaTitle || data?.title };
}

// In the page component - fetches the SAME page again
export default async function Page({ params }) {
  const { data } = await sanityFetch({ query: HOME_PAGE_QUERY, params: ... });
  return <PageBuilder content={data?.content1sp} />;
}
```

**Why this is bad**:
- Same query executed twice per page load
- `sanityFetch` from `next-sanity/live` does NOT automatically deduplicate
- Doubles our API usage on every page

**Solution**: Use React's `cache()` function to deduplicate requests within a single render.

---

### 🟡 Medium Issue #3: No Error Handling on Sanity Fetches

Most Sanity fetch calls have no try/catch:

```typescript
// If Sanity is down or slow, this crashes the page
const { data } = await sanityFetch({ query: NAVBAR_QUERY, ... });
```

**Solution**: Create a `safeSanityFetch` wrapper with retry logic and fallbacks.

---

### 🟡 Medium Issue #4: Path-Based Invalidation is Too Broad

**File**: `app/api/revalidate/route.ts`

Current approach uses `revalidatePath()` which can be overly aggressive:

```typescript
case "siteSettings":
case "globalSettings":
  revalidatePath("/", "layout"); // Invalidates EVERYTHING
```

**Solution**: Use `revalidateTag()` for granular, targeted invalidation.

---

## Implementation Steps

---

## Step 1: Centralized Data Layer

**File Created**: `lib/sanity/queries.ts`

### What We're Building

A centralized module that:
1. Wraps all queries with React's `cache()` for automatic deduplication
2. Provides typed, reusable query functions
3. Consolidates the 6 SiteWrapper queries into 1

### How React `cache()` Works

```typescript
import { cache } from 'react';

// Without cache - called 3 times = 3 API requests
async function getData() {
  return await fetch('/api/data');
}

// With cache - called 3 times = 1 API request (deduped within same render)
const getData = cache(async () => {
  return await fetch('/api/data');
});
```

**Key insight**: React's `cache()` deduplicates calls **within a single server render**. If `generateMetadata()` and the page component both call `getData()`, it only executes once.

### The Consolidated Global Data Query

Instead of 6 separate queries, we use GROQ projections to fetch everything in one request:

```groq
{
  "nav": *[_type == "menu" && menuType == "navbar" && ...][0]{ ... },
  "footer": *[_type == "menu" && menuType == "footer" && ...][0]{ ... },
  "cases": *[_type == "caseStudy" && ...] | order(...){ ... },
  "services": *[_type == "services" && ...]{ ... }
}
```

This is called a **"named projection"** or **"object projection"** in GROQ - we're creating an object with named keys, each containing a subquery result.

### Code Implementation

See `lib/sanity/queries.ts` for the full implementation.

---

## Step 2: Safe Fetch Wrapper

**File Created**: `lib/sanity/safe-fetch.ts`

### What We're Building

A wrapper around `sanityFetch` that provides:
1. **Automatic retries**: 2 retries with exponential backoff
2. **Error logging**: Structured error messages for debugging
3. **Graceful fallbacks**: Return null or default data instead of crashing
4. **Type safety**: Full TypeScript generics support

### Exponential Backoff Explained

When a request fails, we wait longer between each retry:
- Attempt 1: Wait 0ms (immediate)
- Attempt 2: Wait 500ms
- Attempt 3: Wait 1000ms

This prevents hammering a potentially overloaded server.

```typescript
const delay = attempt * 500; // 0, 500, 1000
await new Promise(resolve => setTimeout(resolve, delay));
```

### When to Use Safe Fetch

Use `safeSanityFetch` for:
- **Critical data** that should have fallbacks (navigation, footer)
- **Non-blocking content** where errors shouldn't crash the page

Use regular `sanityFetch` for:
- **Page content** where missing data means a 404
- **Draft mode / live preview** where you want immediate feedback

---

## Step 3: Refactor SiteWrapper

**File Modified**: `components/SiteWrapper.tsx`

### Before (6 API calls)

```typescript
const { data: navbarData } = await sanityFetch({ query: NAVBAR_QUERY, ... });
const { data: footerData } = await sanityFetch({ query: FOOTER_QUERY, ... });
const { data: hasCaseStudies } = await sanityFetch({ query: HAS_CASE_STUDIES_QUERY, ... });
const { data: caseStudies } = await sanityFetch({ query: CASE_STUDIES_QUERY, ... });
const { data: hasServices } = await sanityFetch({ query: HAS_SERVICES_QUERY, ... });
const { data: services } = await sanityFetch({ query: SERVICES_QUERY, ... });
```

### After (1 API call)

```typescript
const globalData = await getGlobalData(channel, language);
```

### Impact

- **API calls reduced**: 6 → 1 (83% reduction)
- **Network round trips**: 6 → 1
- **Time saved**: ~300-500ms per page load (varies by network)

---

## Step 4: Deduplicate Page Fetches

**Files Modified**: All page components in `app/(site)/[locale]/`

### The Problem

`generateMetadata()` and the page component both need the same data:

```typescript
// This fetches twice - once in metadata, once in page
export async function generateMetadata({ params }) {
  const { data } = await sanityFetch({ query: PAGE_QUERY, params });
  return { title: data?.title };
}

export default async function Page({ params }) {
  const { data } = await sanityFetch({ query: PAGE_QUERY, params }); // Second fetch!
  return <Content data={data} />;
}
```

### The Solution

Use our cached query function:

```typescript
import { getPageBySlug } from '@/lib/sanity/queries';

// Now both call the same cached function
export async function generateMetadata({ params }) {
  const data = await getPageBySlug(slug, channel, language);
  return { title: data?.metaTitle || data?.title };
}

export default async function Page({ params }) {
  const data = await getPageBySlug(slug, channel, language); // Deduped!
  return <Content data={data} />;
}
```

### Impact

- **API calls per page**: 2 → 1 (50% reduction)
- **Applied to**: Home page, dynamic pages, case studies, services

---

## Step 5: Tag-Based Cache Invalidation

**File Modified**: `app/api/revalidate/route.ts`

### Path vs Tag Invalidation

| Approach | Granularity | Use Case |
|----------|-------------|----------|
| `revalidatePath("/en/cases")` | Invalidates one URL | Single page changes |
| `revalidatePath("/", "layout")` | Invalidates EVERYTHING | Nuclear option |
| `revalidateTag("cases")` | Invalidates all fetches with that tag | Content type changes |

### How Tags Work

1. **Tag your fetches**:
```typescript
await client.fetch(query, params, {
  next: { tags: ['global', 'nav'] }
});
```

2. **Invalidate by tag**:
```typescript
revalidateTag('nav'); // Only invalidates fetches tagged with 'nav'
```

### Our Tag Strategy

| Document Type | Tags to Invalidate |
|---------------|-------------------|
| `page` | `pages`, `page:${slug}` |
| `case` / `caseStudy` | `cases`, `case:${slug}`, `global` |
| `service` | `services`, `global` |
| `menu` | `global`, `nav`, `footer` |
| `siteSettings` | `global` |

---

## Step 6: Static Generation

**Files Modified**: Case and service pages

### What is `generateStaticParams`?

It tells Next.js to pre-render pages at build time:

```typescript
export async function generateStaticParams() {
  const cases = await getAllCaseSlugs();
  return cases.map(c => ({ slug: c.slug, locale: c.language }));
}
```

**Benefits**:
- Pages are pre-built HTML (fastest possible)
- No Sanity API call on first visit
- ISR still works for new content

### When NOT to Use Static Generation

- **High-churn content**: If content changes every few minutes
- **Personalized content**: If pages vary by user
- **Draft mode**: Static pages don't support live preview (handled separately)

---

## Testing Checklist

After implementation, verify:

- [ ] Home page loads with navigation and footer
- [ ] Dynamic pages (`/en/about`, etc.) render correctly
- [ ] Case study pages work
- [ ] Services pages work
- [ ] Draft mode / live preview still works
- [ ] Webhook revalidation triggers correctly
- [ ] No console errors in browser or server logs

### How to Test API Call Reduction

Add this to `next.config.ts` temporarily:

```typescript
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

Then check the server console - you should see fewer Sanity API calls.

---

## Rollback Plan

If issues arise:

1. **Revert SiteWrapper**: Restore the 6 individual `sanityFetch` calls
2. **Revert page components**: Remove the cached query imports
3. **Keep the new files**: `lib/sanity/queries.ts` and `lib/sanity/safe-fetch.ts` can stay (they're additive)

The refactoring is designed to be incremental - each step can be reverted independently.

---

## Progress Log

### January 31, 2026

#### ✅ Step 1: Created REFACTOR.MD documentation
This file you're reading now! Documents all changes, explains reasoning, and serves as a tutorial.

#### ✅ Step 2: Created Centralized Data Layer
**File**: `lib/sanity/queries.ts`

**What was created**:
- `getGlobalData()` - Consolidated query that fetches nav, footer, cases, and services in ONE request
- `getPageBySlug()` - Cached page fetcher for deduplication
- `getHomePage()` - Cached home page fetcher
- `getCaseBySlug()` - Cached case study fetcher
- `getAllCases()` - Cached cases list fetcher
- `getAllServices()` - Cached services fetcher
- `getAllCaseSlugs()` - For static generation
- `getAllPageSlugs()` - For static generation

**Key concept**: React's `cache()` function memoizes results within a single server render. When both `generateMetadata()` and the page component call the same function with the same arguments, only ONE API request is made.

#### ✅ Step 3: Created Safe Fetch Wrapper
**File**: `lib/sanity/safe-fetch.ts`

**What was created**:
- `safeSanityFetch()` - Main wrapper with retry logic and fallbacks
- `SanityFetchError` - Custom error class with context
- `safeFetchGlobalData()` - For critical data that must never crash
- `fetchPageContent()` - For page data that should 404 on failure
- `batchSanityFetch()` - For parallel fetches with individual error handling

**Key concept**: Exponential backoff - when requests fail, we wait longer between each retry (0ms, 500ms, 1000ms) to avoid overwhelming a struggling server.

#### ✅ Step 4: Refactored SiteWrapper
**File**: `components/SiteWrapper.tsx`

**Before** (6 API calls):
```typescript
const { data: navbarData } = await sanityFetch({ query: NAVBAR_QUERY, ... });
const { data: footerData } = await sanityFetch({ query: FOOTER_QUERY, ... });
const { data: hasCaseStudies } = await sanityFetch({ query: HAS_CASE_STUDIES_QUERY, ... });
const { data: caseStudies } = await sanityFetch({ query: CASE_STUDIES_QUERY, ... });
const { data: hasServices } = await sanityFetch({ query: HAS_SERVICES_QUERY, ... });
const { data: services } = await sanityFetch({ query: SERVICES_QUERY, ... });
```

**After** (1 API call):
```typescript
const { nav, footer, cases, services } = await getGlobalData(channel, language);
const hasCaseStudies = cases.length > 0;
const hasServices = services.length > 0;
```

**Impact**: 83% reduction in API calls for the wrapper (6 → 1)

#### ✅ Step 5: Deduplicated Page Fetches
**Files Modified**:
- `app/(site)/[locale]/page.tsx` - Home page
- `app/(site)/[locale]/[slug]/page.tsx` - Dynamic pages
- `app/(site)/[locale]/cases/page.tsx` - Cases listing
- `app/(site)/[locale]/cases/[slug]/page.tsx` - Case study detail
- `app/(site)/[locale]/services/page.tsx` - Services page
- `app/(site)/[locale]/contact/page.tsx` - Contact page

**Key change**: All pages now use cached query functions that are shared between `generateMetadata()` and the page component, eliminating duplicate API calls.

#### ✅ Step 6: Updated Revalidation API
**File**: `app/api/revalidate/route.ts`

**What changed**:
- Added comprehensive documentation explaining path vs tag invalidation
- Implemented tag-based cache invalidation for surgical updates
- Added detailed logging for debugging

**Tag Strategy**:
| Document Type | Tags Invalidated |
|---------------|-----------------|
| `page` | `pages`, `page:${slug}` |
| `case`/`caseStudy` | `cases`, `case:${slug}`, `global` |
| `service` | `services`, `global` |
| `menu` | `global` + layout revalidation |
| `siteSettings` | Everything (nuclear option) |

#### ✅ Step 7: Added Static Generation
**Files Modified**:
- `app/(site)/[locale]/cases/[slug]/page.tsx`
- `app/(site)/[locale]/[slug]/page.tsx`

**What was added**:
- `generateStaticParams()` function to pre-render pages at build time
- `dynamicParams = true` to allow ISR for new content

**Impact**: First visitors get instant HTML with no API call needed.

#### ✅ Created Additional Utilities
**File**: `lib/sanity/client.ts`

**What was created**:
- `taggedFetch()` - For explicit Next.js cache tags
- `staticFetch()` - For build-time static generation
- `customFetch()` - For advanced use cases

---

## Summary of Files Changed/Created

### New Files
| File | Purpose |
|------|---------|
| `REFACTOR.MD` | This documentation |
| `lib/sanity/queries.ts` | Centralized cached query functions |
| `lib/sanity/safe-fetch.ts` | Error handling wrapper |
| `lib/sanity/client.ts` | Additional client utilities |

### Modified Files
| File | Changes |
|------|---------|
| `components/SiteWrapper.tsx` | 6 queries → 1 consolidated query |
| `app/(site)/[locale]/page.tsx` | Cached fetch + documentation |
| `app/(site)/[locale]/[slug]/page.tsx` | Cached fetch + static generation |
| `app/(site)/[locale]/cases/page.tsx` | Cached fetch |
| `app/(site)/[locale]/cases/[slug]/page.tsx` | Cached fetch + static generation |
| `app/(site)/[locale]/services/page.tsx` | Cached fetch |
| `app/(site)/[locale]/contact/page.tsx` | Cached fetch |
| `app/api/revalidate/route.ts` | Tag-based invalidation |

---

## Still TODO (Future Work)

- [ ] Convert client-side data components to server components
- [ ] Add more granular error boundaries
- [ ] Implement request deduplication metrics/logging
- [ ] Consider implementing a caching layer for frequently accessed data

---

## Build Verification

The refactoring has been verified with a successful Next.js build:

```
Route (app)                                     Size  First Load JS
┌ ○ /_not-found                                 193 B         439 kB
├ ƒ /[locale]                                   125 B        1.82 MB
├ ● /[locale]/[slug]                            125 B        1.82 MB   ← SSG with generateStaticParams
├ ● /[locale]/cases/[slug]                    2.47 kB        1.82 MB   ← SSG with generateStaticParams
...

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

**Key indicators of success**:
- Pages marked with `●` are now statically generated at build time
- No TypeScript errors
- All routes compiled successfully

---

*Last updated: January 31, 2026*
