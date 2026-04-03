# Platform Strategy: Rendering, Data & Component Architecture

> How the 1SP frontend works end-to-end — from Sanity CMS to the browser.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Rendering Strategy: ISR (not SSG, not SSR)](#rendering-strategy)
3. [The Two-Layer PageBuilder](#the-two-layer-pagebuilder)
4. [Data Flow: From Sanity to Screen](#data-flow)
5. [Caching & Revalidation](#caching--revalidation)
6. [Deferred Rendering & Performance](#deferred-rendering--performance)
7. [Trade-offs & Decision Guide](#trade-offs--decision-guide)
8. [Best Practices](#best-practices)

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                         SANITY STUDIO                            │
│              (mounted at /studio, app/(studio))                  │
└──────────────────────────┬────────────────────────────────────────┘
                           │ GROQ queries + webhook on publish
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (Server)                           │
│                                                                   │
│  lib/sanity/queries.ts    ← React cache()-wrapped fetch functions │
│  sanity/lib/live.ts       ← defineLive() sets up sanityFetch      │
│  sanity/lib/queries.ts    ← Raw GROQ query strings                │
│                                                                   │
│  Every function: cache() → sanityFetch() → Sanity CDN            │
│  Tags: ["pages"], ["cases"], ["global"], ["units"], etc.          │
└──────────────────────────┬────────────────────────────────────────┘
                           │ Serialized props (JSON)
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                   PAGE ROUTES (Server Components)                 │
│                                                                   │
│  app/(site)/[locale]/page.tsx          ← Homepage (ISR 60s)       │
│  app/(site)/[locale]/[slug]/page.tsx   ← Dynamic pages (ISR 60s)  │
│  app/(site)/[locale]/cases/[slug]/…    ← Case detail (ISR 60s)    │
│  app/(site)/[locale]/services/…        ← Services (ISR 60s)       │
│  app/(site)/[locale]/contact/…         ← Contact (ISR 60s)        │
│                                                                   │
│  Each: generateStaticParams() + revalidate = 60                   │
└──────────────────────────┬────────────────────────────────────────┘
                           │ content blocks array
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                      PAGEBUILDER (Orchestrator)                   │
│                  components/PageBuilder.tsx                        │
│                                                                   │
│  • Maps Sanity _type → React component                            │
│  • Splits blocks into eager (first N) vs deferred (rest)          │
│  • Wraps each in ErrorBoundary                                    │
│  • Uses next/dynamic for code-splitting                           │
│                                                                   │
│  Block types route to either:                                     │
│    ├── Server Components  (pagebuilder/server/*)                  │
│    └── Client Components  (pagebuilder/pg-*.tsx, "use client")    │
└───────────────────────────────────────────────────────────────────┘
```

---

## Rendering Strategy

### What we use: ISR (Incremental Static Regeneration)

The site is **not** pure SSG (fully static at build time) and **not** pure SSR (rendered on every request). It uses **ISR** — a hybrid that pre-renders pages at build time but refreshes them incrementally.

#### How it works

```typescript
// Every page route exports these two things:

// 1. Pre-render known pages at build time
export async function generateStaticParams() {
  const pages = await getAllPageSlugs();
  return pages.map((page) => ({
    locale: page.language || "en",
    slug: page.slug,
  }));
}

// 2. Re-generate the cached HTML every 60 seconds
export const revalidate = 60;

// 3. Allow new pages that weren't in generateStaticParams
export const dynamicParams = true;  // (on [slug] pages)
```

#### The lifecycle of a page request

```
BUILD TIME
──────────
1. generateStaticParams() queries Sanity for all slugs
2. Next.js renders each page to static HTML + RSC payload
3. HTML is cached in the CDN edge

FIRST VISIT (within 60s of build)
──────────────────────────────────
1. CDN serves cached HTML instantly (TTFB ~10-50ms)
2. React hydrates on the client

VISIT AFTER 60s ("stale-while-revalidate")
──────────────────────────────────────────
1. CDN serves the stale cached HTML instantly (user sees it fast)
2. In the background, Next.js re-renders the page with fresh Sanity data
3. The new HTML replaces the stale cache
4. Next visitor gets the fresh version

NEW PAGE (slug not in generateStaticParams)
────────────────────────────────────────────
1. dynamicParams = true → Next.js renders on-demand (SSR-like)
2. Result is cached → subsequent visits are instant
```

### Why not pure SSG?

| Aspect | Pure SSG | ISR (what we use) |
|--------|----------|-------------------|
| Build time | Rebuilds ALL pages on every deploy | Only builds known pages once; updates incrementally |
| Content freshness | Stale until next deploy | Fresh within 60 seconds |
| New pages | Requires a full rebuild | Rendered on first visit, cached after |
| Sanity Live preview | Not possible | Works via draft mode |

### Why not pure SSR?

| Aspect | Pure SSR | ISR (what we use) |
|--------|----------|-------------------|
| TTFB | Slow (Sanity query on every request) | Fast (served from cache) |
| Sanity API usage | High (every page view = API call) | Low (1 call per 60s per page) |
| CDN caching | Complex to configure | Built-in |
| Cost | Higher (more compute, more API calls) | Lower |

---

## The Two-Layer PageBuilder

The PageBuilder has **two layers of components** to cleanly separate data fetching from rendering:

### Layer 1: Server Components (`pagebuilder/server/`)

These are **async React Server Components** that run only on the server. Their job is to **fetch data** and pass it as serialized props to client components.

```
pagebuilder/server/
├── CasesGalleryFilteredBlock.tsx          → fetches case studies
├── CasesGalleryFilteredWithPaginationBlock.tsx
├── PageBuilderLogoFloatBlock.tsx          → fetches unit logos
├── ServicesGalleryFilteredBlock.tsx        → fetches services
├── SmartCarouselBlock.tsx                 → fetches carousel cases
└── UnitLogoGridBlock.tsx                  → fetches unit grid data
```

**Example: `PageBuilderLogoFloatBlock.tsx`**

```typescript
// No "use client" — this is a Server Component
import { getUnitLogoFloatUnits } from "@/lib/sanity/queries";
import PageBuilderLogoFloatClient from "../pg-PageBuilderLogoFloat";

export default async function PageBuilderLogoFloatBlock({
  language = "en",
  maxItems = 24,
  selectionMode = "auto",
  selectedUnitIds = [],
  ...props
}) {
  // ✅ Data fetching happens on the server — zero client JS
  const units = selectionMode === "manual" && selectedUnitIds.length > 0
    ? await getUnitsByIds(selectedUnitIds)
    : await getUnitLogoFloatUnits(language, maxItems);

  // ✅ Transform data on the server
  const logos = units.map((unit) => ({
    id: unit._id,
    name: unit.name,
    url: assetUrl(pickLogoAsset(unit, logoVariant)),
  })).filter(Boolean);

  // ✅ Pass plain serializable props to the client component
  return <PageBuilderLogoFloatClient data={...props} logos={logos} />;
}
```

### Layer 2: Client Components (`pagebuilder/pg-*.tsx`)

These have `"use client"` and handle **interactivity**: animations, scroll effects, hover states, etc. They receive **pre-fetched, serialized data** as props — they never call Sanity directly.

```
pagebuilder/
├── pg-PageBuilderLogoFloat.tsx   ← "use client", receives logos[]
├── pg-CasesGalleryFiltered.tsx   ← "use client", receives caseStudies[]
├── pg-SmartCarousel.tsx          ← "use client", receives caseStudies[]
├── pg-Header.tsx                 ← "use client", receives step data
├── pg-ContentSection.tsx         ← "use client", receives content blocks
└── ... (30+ client components)
```

### When to use which pattern

| Pattern | When to use | Example |
|---------|-------------|---------|
| **Server → Client** (two files) | Component needs its **own data** beyond what the page provides | `SmartCarouselBlock` fetches carousel cases, passes to `SmartCarouselClient` |
| **Client only** (one file) | Component gets all data from the parent PageBuilder via **props** | `pg-Header.tsx` receives `step` data inline from the Sanity content array |
| **Server only** | Component has zero interactivity (rare in this project) | JSON-LD `<script>` tags, `<link>` preloads |

### The flow through PageBuilder.tsx

```typescript
// PageBuilder.tsx (Server Component — no "use client")

// Some components are statically imported (critical path)
import OneSPHeaderStep from "./pagebuilder/pg-Header";

// Most are dynamically imported (code-split)
const ContentSection = dynamic(() => import("./pagebuilder/pg-ContentSection"), {
  loading: () => <ComponentLoader />,
  ssr: true,  // Still server-rendered, but the JS chunk loads separately
});

// Server components imported the same way
const CasesGalleryFiltered = dynamic(
  () => import("./pagebuilder/server/CasesGalleryFilteredBlock"),
  { ssr: true }
);

// The switch-case maps Sanity _type to component:
switch (block._type) {
  case "oneSPHeader":
    return <OneSPHeaderStep step={block} />;         // Client component
  case "casesGalleryFiltered":
    return <CasesGalleryFiltered {...block} />;      // Server → Client
  case "contentSection":
    return <ContentSection data={block} />;          // Client component
}
```

---

## Data Flow

### From Sanity to Screen (complete path)

```
SANITY STUDIO (editor publishes)
        │
        ▼
SANITY CDN (GROQ API)
        │
        ▼
lib/sanity/queries.ts
├── getHomePage(channel, language)        ← cache()-wrapped
├── getPageBySlug(slug, channel, lang)   ← cache()-wrapped
├── getAllCases(channel, language)        ← cache()-wrapped
└── getGlobalData(channel, language)     ← cache()-wrapped
        │
        ▼
sanityFetch() from next-sanity/live
├── Uses defineLive() with serverToken
├── Tags each fetch: ["pages"], ["cases"], etc.
├── fetchOptions.revalidate = 60 (TTL fallback)
└── In draft mode: real-time live updates
        │
        ▼
PAGE ROUTE (Server Component)
├── Calls data functions (deduplicated via React cache())
├── Extracts content blocks array
├── Passes contentBlocks to PageBuilder
        │
        ▼
PAGEBUILDER (Server Component)
├── Splits into eager blocks (first 2) + deferred blocks
├── Maps _type → component
├── Server components fetch their own data (additional queries)
├── Client components receive serialized props
        │
        ▼
BROWSER
├── Initial HTML (SSR/ISR cached)
├── Hydration attaches event listeners
├── DeferredSection loads below-fold content on scroll
└── Sanity Live provides real-time updates in draft mode
```

### React `cache()` deduplication

A key optimization: both `generateMetadata()` and the page component call the same data function. React's `cache()` ensures only **one** Sanity API call is made:

```typescript
// lib/sanity/queries.ts
export const getHomePage = cache(async (channel, language) => {
  const { data } = await sanityFetch({ query: HOME_PAGE_QUERY, ... });
  return data;
});

// app/(site)/[locale]/page.tsx
export async function generateMetadata() {
  const page = await getHomePage("1spWeb", "en");  // Call 1
  return { title: page.title };
}

export default async function Home() {
  const page = await getHomePage("1spWeb", "en");  // Call 2 — deduplicated!
  return <PageBuilder content={page.content1sp} />;
}
```

---

## Caching & Revalidation

### Three cache layers

```
Layer 1: React cache()
  ├── Scope: single server render
  ├── Purpose: deduplicates getHomePage() calls within one request
  └── Lifetime: dies after the render completes

Layer 2: Next.js Data Cache (ISR)
  ├── Scope: per-page, persisted across requests
  ├── Purpose: serves cached HTML for 60 seconds
  ├── Config: export const revalidate = 60
  └── Also: sanityFetch fetchOptions.revalidate = 60

Layer 3: CDN Edge Cache (Vercel/hosting)
  ├── Scope: global edge network
  ├── Purpose: serves cached response from nearest PoP
  └── Managed by: Next.js ISR headers (stale-while-revalidate)
```

### Webhook-based on-demand revalidation

When an editor publishes in Sanity Studio, a webhook hits `/api/revalidate`:

```
Sanity Studio → publish → webhook → /api/revalidate
                                        │
                  ┌─────────────────────┤
                  │                     │
          revalidateTag()        revalidatePath()
          (surgical)             (path-based)
```

**Tag-based revalidation** (surgical):
```typescript
// When a case study is published:
revalidateTag("cases");           // All case listings
revalidateTag("case:my-slug");    // This specific case page
revalidateTag("global");          // Nav overlay showing cases
```

**Path-based revalidation** (broader):
```typescript
revalidatePath("/cases");                // Cases listing page
revalidatePath(`/cases/${slug}`);        // Specific case page
```

**Emergency button** — `/api/revalidate-home`:
```typescript
// GET /api/revalidate-home → clears all homepage caches
revalidatePath("/", "layout");   // Invalidates everything
revalidatePath("/");             // Homepage specifically
```

### Tag mapping by document type

| Sanity document type | Tags invalidated | Paths invalidated |
|---------------------|------------------|-------------------|
| `page` | `pages`, `page:{slug}` | `/{slug}` |
| `caseStudy` | `cases`, `case:{slug}`, `global` | `/cases/{slug}`, `/cases` |
| `service` | `services`, `pages`, `global` | `/services` |
| `menu` | `global` | `/` (layout) |
| `siteSettings` | `global`, `pages`, `cases`, `services` | `/` (layout) — nuclear option |
| `unit` | `units` | — |
| `person` | `people` | `/people/{slug}` |

---

## Deferred Rendering & Performance

### The `deferAfter` pattern

The PageBuilder splits content blocks into **eager** and **deferred** sections:

```typescript
// Homepage: render first 2 blocks immediately, defer the rest
<PageBuilder content={page.content1sp} deferAfter={2} />
```

```typescript
// Inside PageBuilder.tsx:
const eagerBlocks = content.slice(0, 2);    // Hero + first section
const deferredBlocks = content.slice(2);     // Everything else

return (
  <>
    {/* Rendered in initial HTML — critical for LCP */}
    {eagerBlocks.map((block) => renderBlock(block))}

    {/* Only rendered when scrolled into view */}
    {deferredBlocks.length > 0 && (
      <DeferredSection minHeight={calculatedHeight}>
        <PageBuilder content={deferredBlocks} renderMode="deferred" />
      </DeferredSection>
    )}
  </>
);
```

### DeferredSection mechanics

```typescript
// components/ui/DeferredSection.tsx ("use client")
function DeferredSection({ children }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setShouldRender(true);   // Mount children
        observer.disconnect();   // One-shot
      }
    });
    observer.observe(ref.current);
  }, []);

  return shouldRender ? children : <div style={{ minHeight }} />;
}
```

**Why this matters:**
- The hero and first section render in the initial HTML (fast LCP)
- Below-fold sections don't download video/images until scrolled near
- Prevents 20+ concurrent MP4 downloads from killing hero video playback

### Component-level deferred patterns

For especially heavy components, there's also **per-component deferral**:

```typescript
// DeferredShowtimeGalleryShell.tsx — "use client"
// The ShowtimeGallery (with scroll-driven animations) is:
// 1. Dynamically imported (ssr: false → no server bundle)
// 2. Only mounted when scrolled into viewport
// 3. Placeholder has calculated minHeight to prevent CLS
```

---

## Trade-offs & Decision Guide

### ISR with revalidate = 60

| ✅ Upside | ⚠️ Downside |
|-----------|-------------|
| Instant TTFB from cache | Content can be up to 60s stale |
| Low Sanity API usage | First visitor after 60s triggers background regen |
| Scales infinitely via CDN | Webhook failures can delay updates beyond 60s |
| Works with Sanity Live (draft mode) | Cold start on new slugs (first visit is slower) |

### Server Components for data fetching

| ✅ Upside | ⚠️ Downside |
|-----------|-------------|
| Zero client-side JS for data logic | Requires two files (server + client) per component |
| Data transforms run on server (fast) | Can't use hooks or browser APIs in server layer |
| Secrets (API tokens) stay on server | Debugging requires checking server logs |
| Smaller client bundles | Props must be serializable (no functions, classes) |

### `next/dynamic` with `ssr: true`

| ✅ Upside | ⚠️ Downside |
|-----------|-------------|
| Code-split JS bundles | Small delay before interactivity (chunk download) |
| Server HTML still includes the component | `loading` placeholder briefly visible |
| Reduces main bundle size | One more import indirection to trace |

### DeferredSection pattern

| ✅ Upside | ⚠️ Downside |
|-----------|-------------|
| Dramatically reduces initial page weight | Content below fold is invisible to SSR |
| Prevents resource contention with hero | SEO: deferred content may not be indexed* |
| Reduces network congestion | Requires accurate `minHeight` to avoid CLS |

> *Note: Googlebot typically executes JavaScript and will see deferred content. However, other crawlers might not. For SEO-critical content, keep it in the eager section.

---

## Best Practices

### 1. Adding a new PageBuilder block

**If your block needs its own data (additional Sanity queries):**

```
1. Create server component:  pagebuilder/server/MyBlockServer.tsx
   - async function, fetches data, passes to client
2. Create client component:  pagebuilder/pg-MyBlock.tsx
   - "use client", receives data as props, handles interactivity
3. Register in PageBuilder.tsx:
   - Add dynamic import pointing to the SERVER component
   - Add switch case for the Sanity _type
```

**If your block only uses data passed by the page (inline content):**

```
1. Create client component:  pagebuilder/pg-MyBlock.tsx
   - "use client", receives block data as props
2. Register in PageBuilder.tsx:
   - Add dynamic import pointing to the client component
   - Add switch case for the Sanity _type
```

### 2. Where to put Sanity queries

```
lib/sanity/queries.ts     ← Cached fetch functions (getXxx)
sanity/lib/queries.ts     ← Raw GROQ query strings (XXX_QUERY)
```

Always wrap new fetch functions in `cache()`:

```typescript
export const getMyData = cache(async (id: string) => {
  const { data } = await sanityFetch({
    query: MY_QUERY,
    params: { id },
    tags: ["my-tag"],       // ← important for revalidation
  });
  return data;
});
```

### 3. Choose the right tag for revalidation

Tags should match the **domain** of the data, not the page it appears on:

```typescript
// ✅ Good — tag matches the data domain
sanityFetch({ query: CASES_QUERY, tags: ["cases"] });

// ❌ Bad — tag matches the page, not the data
sanityFetch({ query: CASES_QUERY, tags: ["homepage"] });
```

### 4. Revalidation webhook: update `/api/revalidate` when adding types

If you add a new Sanity document type, add a `case` to the webhook handler:

```typescript
// app/api/revalidate/route.ts
case "myNewType":
  revalidateTag("my-tag");
  revalidatedTags.push("my-tag");
  break;
```

### 5. Performance: eager vs. deferred

| Content | Rendering | Why |
|---------|-----------|-----|
| Hero / header | **Eager** (always first) | LCP element |
| First content section | **Eager** | Visible on load |
| Case gallery with 50 cards | **Deferred** | Heavy, below fold |
| ShowtimeGallery (scroll-driven) | **Deferred** + `ssr: false` | Huge JS + intersection logic |
| Globe / 3D components | **Deferred** | WebGL is heavy |

### 6. Multi-channel architecture

The project supports multiple channels (brands) via a `channel` parameter:

```
1spWeb          ← Main 1SP Agency site
msmWeb          ← MSM.digital sub-brand
studioco2Web    ← Studio CO2 sub-brand
```

Channel routing:
- Determined by cookie (`channel`) or defaults to `"1spWeb"`
- Passed through data layer to Sanity queries
- Sanity content is filtered by channel in GROQ

### 7. Draft mode & Sanity Live

```
Production:  ISR cached pages, fresh within 60s
Draft mode:  Real-time updates via Sanity Live (WebSocket)
```

Draft mode is activated via `/api/draft-mode` and enables:
- `<SanityLive />` component for real-time content streaming
- `<VisualEditing />` for click-to-edit in Sanity Studio
- Content is fetched live, bypassing ISR cache

---

## Quick Reference

| Question | Answer |
|----------|--------|
| What rendering strategy? | ISR with 60s revalidation |
| Where is data fetched? | Server Components (page routes + `pagebuilder/server/`) |
| Where is interactivity? | Client Components (`pagebuilder/pg-*.tsx`) |
| How are bundles optimized? | `next/dynamic` with `ssr: true` |
| How is below-fold content handled? | `DeferredSection` + `IntersectionObserver` |
| How is cache invalidated? | Sanity webhook → `/api/revalidate` → `revalidateTag()` |
| How does live preview work? | Draft mode → `SanityLive` + `VisualEditing` |
| What's the fallback if webhook fails? | `revalidate = 60` TTL ensures max 60s staleness |
