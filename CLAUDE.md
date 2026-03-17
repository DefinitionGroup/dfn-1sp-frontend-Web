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
- `app/api/` — contact form, draft mode, ISR revalidation, relationship sync
- `middleware.ts` — redirects `/` to `/{locale}`, sets `channel` and `locale` cookies

The channel is hardcoded to `1spWeb` in middleware. Sanity supports 4 channels (1spWeb, msmWeb, studioco2Web, flizrWeb) with different language combos.

### Page Builder Pattern

Central architecture. Sanity pages have a `content1sp` array of typed blocks. The flow:

1. **Sanity schema** → `sanity/schemaTypes/1SP/Components/` (defines CMS fields)
2. **Schema registration** → `sanity/schemaTypes/1spContent.ts` (adds to `oneSPComponents`)
3. **Page schema** → `sanity/schemaTypes/page.ts` (adds type to `content1sp` array)
4. **React component** → `components/pagebuilder/pg-*.tsx` (renders the block)
5. **PageBuilder switch** → `components/PageBuilder.tsx` (dynamic import + `_type` switch case)

Every block is wrapped in `ErrorBoundary`. Heavy components use `next/dynamic` with `ssr: true`.

See `docs/PAGEBUILDER_COMPONENT_GUIDE.md` for the full step-by-step guide with templates.

### Component Tiers

| Prefix/Dir | Purpose |
|---|---|
| `components/pagebuilder/pg-*` | Page builder blocks, one per Sanity `_type` |
| `components/data/data-*` | "Smart" components that fetch their own Sanity data |
| `components/ui/*` | Pure UI, no CMS dependency |
| `components/menu/*` | Navigation (nav overlay, footer) |
| `components/dev/*` | Debug utilities (CSS diagnostic outlines via `NEXT_PUBLIC_DIAG`) |

### Data Fetching

- **GROQ queries**: `sanity/lib/queries.ts` — all query definitions with conditional `_type` projections
- **Cached fetch layer**: `lib/sanity/queries.ts` — wraps queries with React `cache()` for request dedup (shared between `generateMetadata` and page render)
- **Safe fetch**: `lib/sanity/safe-fetch.ts` — retry + exponential backoff wrapper
- **Live updates**: `sanity/lib/live.ts` — `sanityFetch` via `next-sanity/live` for real-time content
- **ISR**: `revalidate = 60` on pages; on-demand via `/api/revalidate` webhook

### Sanity CMS

- Project ID: `wu6i3y0h`, dataset: `production`
- Types are auto-generated via Sanity Typegen → `types/sanity.types.ts`
- Images/videos managed through Cloudinary (`sanity-plugin-cloudinary`)
- Multi-language via `@sanity/document-internationalization`
- Visual editing with stega-encoded URLs; `StegaErrorHandler` suppresses hydration errors
- Studio desk structure in `sanity/structure.ts` — organized per-channel, then per-language

### Styling

- Tailwind CSS v4 (CSS-first config via `@import "tailwindcss"` in `globals.css`)
- Brand colors: `--color-brand-lime` (#afff40), `--color-brand-orange` (#ff8800), `--color-brand-pink`
- Fonts: `AspektaVF` (variable, primary sans), `NyghtSerif-Regular` (serif accent)
- `cn()` utility in `lib/utils.ts` (clsx + tailwind-merge)
- shadcn/ui configured (new-york style)
- View transitions enabled (`experimental.viewTransition` in next.config)

### Key Utilities

- `utils/utils.ts` — Cloudinary URL optimization (`optimizedVideoUrl`, `cloudinaryPosterUrl`), link resolvers (`resolveLink`, `resolveLinkAsync`, `ctaToButtonProps`)
- `components/ui/DeferredVideo.tsx` — LCP-optimized video: shows Cloudinary poster immediately, crossfades to video after delay
- `hooks/use-optimized-transition-router.ts` — View transitions router with 1.5s timeout fallback
- `lib/translations.ts` — Static EN/DE UI string translations (no i18n library)
- `lib/structured-data.tsx` — JSON-LD generators (Organization, WebPage, ContactPage, Article, Person, ItemList, BreadcrumbList) + content extractors for Person/Unit data

## Conventions

- **Commits**: Follow conventional commit format
- **Sanity null handling**: Sanity returns `null` (not `undefined`) for empty arrays. Always use `(array ?? [])` before array operations—default params won't protect you. See `docs/SANITY_NULL_HANDLING.md`.
- **Imports**: Use `@/*` path alias (maps to project root)
- **Links**: Use `Link` from `next-view-transitions` (not `next/link`)
- **Media**: Images via Cloudinary asset type in Sanity schemas; use `cloudinary.asset` field type
- **Structured data**: All pages include JSON-LD (WebPage, BreadcrumbList, Person, Organization). See `lib/structured-data.tsx`
