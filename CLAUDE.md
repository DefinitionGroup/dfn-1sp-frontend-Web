# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server with Turbopack (http://localhost:3000)
pnpm dev:diag     # Dev with CSS diagnostic outlines (NEXT_PUBLIC_DIAG=1)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint (next lint)
```

No test framework is configured. Node 22 (see `.nvmrc`). Use pnpm exclusively.

## Architecture

**Next.js 15 App Router** with React 19, TypeScript, Tailwind CSS v4, and Sanity CMS.

### Routing

- `app/(site)/[locale]/` — public website with locale prefix (en, de, pl)
- `app/(studio)/studio/` — embedded Sanity Studio at `/studio`
- `app/api/` — contact form, draft mode, ISR revalidation, relationship sync, Personio jobs
- `middleware.ts` — redirects `/` to `/{locale}`, sets `channel` and `locale` cookies

The channel is hardcoded to `1spWeb` in middleware. Sanity supports 4 channels (1spWeb, msmWeb, studioco2Web, flizrWeb) with different language combos.

**URL strategy:** Public-facing URLs are locale-free (e.g., `/about`, `/cases/my-case`). Middleware internally rewrites these to `/en/...`. Old locale-prefixed URLs (`/en/about`) get 301-redirected to the locale-free version for SEO.

### Page Builder Pattern

Central architecture. Sanity pages have a `content1sp` array of typed blocks. The flow:

1. **Sanity schema** → `sanity/schemaTypes/1SP/Components/` (defines CMS fields)
2. **Schema registration** → `sanity/schemaTypes/1spContent.ts` (adds to `oneSPComponents`)
3. **Page schema** → `sanity/schemaTypes/page.ts` (adds type to `content1sp` array)
4. **React component** → `components/pagebuilder/pg-*.tsx` (renders the block)
5. **PageBuilder switch** → `components/PageBuilder.tsx` (dynamic import + `_type` switch case)

Every block is wrapped in `ErrorBoundary`. Heavy components use `next/dynamic` with `ssr: true`. The switch handles ~30 registered block types.

`pagebuilder/server/` — server-rendered wrapper components (e.g., `SmartCarouselBlock.tsx`, `CasesGalleryFilteredBlock.tsx`)
`pagebuilder/client/` — client-rendered variants (e.g., `DeferredShowtimeGalleryShell.tsx`)

See `docs/PAGEBUILDER_COMPONENT_GUIDE.md` for the full step-by-step guide with templates.

### Component Tiers

| Prefix/Dir | Purpose |
|---|---|
| `components/pagebuilder/pg-*` | Page builder blocks, one per Sanity `_type` |
| `components/pagebuilder/server/` | Server-rendered wrapper shells for heavy blocks |
| `components/pagebuilder/client/` | Client-rendered variants |
| `components/data/data-*` | "Smart" components that fetch their own Sanity data |
| `components/ui/*` | Pure UI, no CMS dependency |
| `components/menu/*` | Navigation (nav overlay, footer) |
| `components/dev/*` | Debug utilities (CSS diagnostic outlines via `NEXT_PUBLIC_DIAG`) |

### Data Fetching

- **GROQ queries**: `sanity/lib/queries.ts` — all query definitions with conditional `_type` projections
- **Cached fetch layer**: `lib/sanity/queries.ts` — wraps queries with React `cache()` for request dedup (shared between `generateMetadata` and page render)
- **Safe fetch**: `lib/sanity/safe-fetch.ts` — retry + exponential backoff wrapper
- **Live updates**: `sanity/lib/live.ts` — `sanityFetch` via `next-sanity/live` for real-time content
- **ISR**: `revalidate = 60` on pages; on-demand via `/api/revalidate` webhook with tag-based cache invalidation

The revalidation webhook uses a tag hierarchy: `sanity` (global), `pages`, `page:${slug}`, `cases`, `case:${slug}`, `services`, `units`, `people`. Includes Sanity webhook signature verification.

### Sanity CMS

- Project ID: `wu6i3y0h`, dataset: `production`
- Types are auto-generated via Sanity Typegen → `types/sanity.types.ts`
- Images/videos managed through Cloudinary (`sanity-plugin-cloudinary`)
- Multi-language via `@sanity/document-internationalization` (DE, EN, PL)
- Internationalized document types: page, menu, caseStudy, unit, client, person, services, serviceGroup
- Visual editing with stega-encoded URLs; `StegaErrorHandler` suppresses hydration errors
- Studio desk structure in `sanity/structure.ts` — organized per-channel, then per-language
- Bidirectional relationship sync via custom Sanity action + `/api/sync-relationships`

### Styling

- Tailwind CSS v4 (CSS-first config via `@import "tailwindcss"` in `globals.css`)
- Brand colors: `--color-brand-lime` (#afff40), `--color-brand-orange` (#ff8800), `--color-brand-pink`
- Fonts: `AspektaVF` (variable, primary sans), `NyghtSerif-Regular` (serif accent)
- `cn()` utility in `lib/utils.ts` (clsx + tailwind-merge)
- shadcn/ui configured (new-york style, icons: lucide)
- View transitions enabled (`experimental.viewTransition` in next.config)
- Animation: `motion` / `motion-plus` (Motion One) — not Framer Motion

### Key Utilities

- `utils/utils.ts` — Cloudinary URL optimization (`optimizedVideoUrl`, `cloudinaryPosterUrl`, `cloudinaryPosterSrcSet`), link resolvers (`resolveLink`, `resolveLinkAsync`, `ctaToButtonProps`)
- `lib/utils.ts` — `cn()` (clsx + tailwind-merge), `assetUrl()` for Cloudinary assets
- `lib/hero-utils.tsx` — hero component utilities
- `lib/responsive.ts` — responsive design helpers
- `lib/clamp.tsx` — numeric clamp utility
- `components/ui/DeferredVideo.tsx` — LCP-optimized video: shows Cloudinary poster immediately, crossfades to video after delay
- `hooks/use-optimized-transition-router.ts` — View transitions router with 1.5s timeout fallback
- `hooks/use-robust-in-view.ts` — IntersectionObserver with mobile-aware thresholds and RAF fallback visibility after configurable delay
- `hooks/use-media-query.ts` — media query hook with legacy `addListener` fallback
- `lib/translations.ts` — Static EN/DE UI string translations (no i18n library)
- `lib/structured-data.tsx` — JSON-LD generators (Organization, WebPage, ContactPage, Article, Person, ItemList, BreadcrumbList) + content extractors for Person/Unit data

### Third-party Integrations

- **3D globe**: Three.js + `@react-three/fiber` + `@react-three/drei` + `three-globe` — used in `SmartUnitsGlobe` (dynamically imported, wrapped in Suspense)
- **Icons**: `@phosphor-icons/react` (primary icon library)
- **Analytics**: `@vercel/analytics` + `@vercel/speed-insights` (in root layout)
- **Jobs**: Personio API → `/api/personio/jobs` → `pg-PageBuilderPersonioJobs.tsx`
- **Styled components**: `styled-components` v6 (used selectively alongside Tailwind)

### App Routes

- `app/robots.ts` — robots.txt generator
- `app/sitemap.ts` — sitemap generator
- `app/actions.ts` — server actions
- `app/api/revalidate/` — ISR webhook (tag-based)
- `app/api/revalidate-home/` — home-specific revalidation
- `app/api/draft-mode/` — enable/disable draft mode
- `app/api/contact/` — contact form submission
- `app/api/cases/` — case data endpoint
- `app/api/personio/jobs/` — Personio job listings
- `app/api/sync-relationships/` — bidirectional relationship sync

## Conventions

- **Commits**: Follow conventional commit format
- **Sanity null handling**: Sanity returns `null` (not `undefined`) for empty arrays. Always use `(array ?? [])` before array operations—default params won't protect you. See `docs/SANITY_NULL_HANDLING.md`.
- **Imports**: Use `@/*` path alias (maps to project root)
- **Links**: Use `Link` from `next-view-transitions` (not `next/link`)
- **Media**: Images via Cloudinary asset type in Sanity schemas; use `cloudinary.asset` field type
- **Structured data**: All pages include JSON-LD (WebPage, BreadcrumbList, Person, Organization). See `lib/structured-data.tsx`

## Documentation

- `docs/PAGEBUILDER_COMPONENT_GUIDE.md` — Step-by-step guide for adding new page builder blocks
- `docs/SANITY_NULL_HANDLING.md` — Guidance on Sanity null vs undefined behavior
- `docs/CONTACT_FORM.md` — Contact form implementation details
- `docs/CLEANUP-COMPONENTS.md` — Component cleanup notes
- `docs/UNUSED.md` — Unused code tracking
- `PERFORMANCE_PLAN.md` — Bundle optimization roadmap (identifies splitChunks issues, unused deps, icon consolidation)
