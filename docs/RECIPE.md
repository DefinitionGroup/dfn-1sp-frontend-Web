# Multi-site, Multi-language, Sanity → Vercel → Next.js — Recipe

This document is a step-by-step blueprint for turning a **single Next.js website**
into a **multi-brand platform** where:

- One Sanity backend serves N brands from one dataset.
- Each brand gets its own Vercel deployment with its own domain.
- All brands share schema, queries, types, and utilities — but own their own visual code.
- Content is multi-language (EN, DE, or however many you need).

It is written to be copied verbatim into a `CLAUDE.md` or `AGENTS.md` so an AI
agent can follow it on a fresh engagement. Every rule here was derived from a
real production migration; the reasoning is explained alongside each step.

---

## Table of contents

1. [Guiding principles](#1-guiding-principles)
2. [Prerequisites](#2-prerequisites)
3. [Phase 0 — Stop hardcoding the brand](#3-phase-0--stop-hardcoding-the-brand)
4. [Phase 1 — Extract shared packages](#4-phase-1--extract-shared-packages)
5. [Phase 2 — Add the second site](#5-phase-2--add-the-second-site)
6. [Phase 3 — Unify per-channel content arrays (schema migration)](#6-phase-3--unify-per-channel-content-arrays-schema-migration)
7. [Phase 4 — Deploy each site to its own Vercel project](#7-phase-4--deploy-each-site-to-its-own-vercel-project)
8. [Phase 5 — Operations at scale](#8-phase-5--operations-at-scale)
9. [Adding a new site — checklist](#9-adding-a-new-site--checklist)
10. [Invariants (never break these)](#10-invariants-never-break-these)
11. [Known traps](#11-known-traps)

---

## 1. Guiding principles

**Share data and contracts. Never share UI.**

- Schema definitions, GROQ queries, TypeGen types, pure utility functions →
  shared packages.
- Buttons, heroes, navbars, page builders, anything that touches pixels →
  per-app. Each site looks different. Coupling visual code across sites creates
  a refactor debt that compounds forever.

**The database is one. The deployments are many.**

- One Sanity project, one dataset, one Studio. Content editors work in one
  place and publishing affects all sites simultaneously. This is the whole
  point.
- One Vercel project *per site*. Each deployment gets its own domain, its own
  env vars, and its own build. `NEXT_PUBLIC_CHANNEL` pins a deployment to a
  brand.

**Content evolves; schemas migrate; code ships first.**

- Always deploy the code change before running a data migration.
- Migrations are additive first (new field), then subtractive (remove old
  field) — never both in one step.
- Every migration must be idempotent and have a documented rollback path.

**The main branch is the source of truth for production.**

- Use a `dev` branch as a staging gate. Never deploy experimental changes
  directly to production.
- ISR (Incremental Static Regeneration) + tag-based on-demand revalidation is
  the default caching strategy. Keep `revalidate = 60` on pages.

---

## 2. Prerequisites

Before starting, confirm these are in place.

| Item | Target | Why |
|---|---|---|
| Node | 22 (set in `.nvmrc`) | Next.js 15 + React 19 require it |
| Package manager | pnpm 10+ | workspace protocol + isolated node_modules |
| Framework | Next.js 15 App Router | layouts, server components, ISR, middleware |
| CMS | Sanity v4 | multi-language plugin, TypeGen, live preview |
| Deployment | Vercel | per-branch preview URLs, ISR webhook support |
| Media | Cloudinary | video + image optimisation independent of Sanity |
| Git | mono-repo branch strategy | `main` = production, `dev` = staging |

Confirm pnpm is the *only* lockfile. Delete `package-lock.json` or
`yarn.lock` if present — Vercel will pick up the wrong package manager if both
exist.

```bash
rm -f package-lock.json yarn.lock
```

Add to root `package.json`:

```json
{
  "packageManager": "pnpm@10.7.0",
  "engines": { "node": ">=22" }
}
```

Add `vercel.json` at repo root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "framework": "nextjs"
}
```

---

## 3. Phase 0 — Stop hardcoding the brand

**Goal:** every reference to the current site's name, domain, colour, or locale
list comes from a config object keyed by a `channel` string — never from a
literal.

### 3.1 Define `WebsiteChannel`

Create `packages/site-config/src/index.ts` (or `lib/site-config.ts` if packages
don't exist yet):

```typescript
export type WebsiteChannel =
  | "brandAWeb"    // e.g. "1spWeb"
  | "brandBWeb"    // e.g. "flizrWeb"
  | "brandCWeb";

export interface SiteConfig {
  name: string;
  shortName: string;
  locales: string[];          // ["en", "de"] — first is default
  domains: string[];          // production domains for middleware host mapping
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleSiteVerification?: string;
  };
  tracking: {
    googleAnalyticsId?: string;
  };
  logo: {
    light: string;            // path or Cloudinary public_id
    dark: string;
    alt: string;
  };
}

export const DEFAULT_CHANNEL: WebsiteChannel = "brandAWeb";

export const SITE_CONFIGS: Record<WebsiteChannel, SiteConfig> = {
  brandAWeb: { ... },
  brandBWeb: { ... },
  brandCWeb: { ... },
};

export function getSiteConfig(channel: WebsiteChannel): SiteConfig {
  return SITE_CONFIGS[channel];
}

export function getChannelFromEnv(): WebsiteChannel {
  const env = process.env.NEXT_PUBLIC_CHANNEL;
  if (env && env in SITE_CONFIGS) return env as WebsiteChannel;
  return DEFAULT_CHANNEL;
}

export function resolveChannelFromHost(host: string): WebsiteChannel | null {
  for (const [channel, config] of Object.entries(SITE_CONFIGS)) {
    if (config.domains.some(d => host === d || host.endsWith(`.${d}`))) {
      return channel as WebsiteChannel;
    }
  }
  return null;
}

// Convenience: the channel for this deployment (build-time constant)
export const ACTIVE_CHANNEL: WebsiteChannel = getChannelFromEnv();
export const SITE_BRAND: SiteConfig = getSiteConfig(ACTIVE_CHANNEL);
```

### 3.2 Add server-side `getChannel()`

In `packages/site-config/src/server.ts`:

```typescript
import "server-only";
import { cookies } from "next/headers";
import { getChannelFromEnv, DEFAULT_CHANNEL, SITE_CONFIGS, type WebsiteChannel } from "./index.ts";

export async function getChannel(): Promise<WebsiteChannel> {
  const fromEnv = process.env.NEXT_PUBLIC_CHANNEL;
  if (fromEnv && fromEnv in SITE_CONFIGS) return fromEnv as WebsiteChannel;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("channel")?.value;
  if (fromCookie && fromCookie in SITE_CONFIGS) return fromCookie as WebsiteChannel;

  return DEFAULT_CHANNEL;
}
```

### 3.3 Update middleware

In `middleware.ts`, set the `channel` cookie from the host (enables staging
Vercel preview URLs to simulate any brand):

```typescript
import { resolveChannelFromHost, DEFAULT_CHANNEL } from "@1sp/site-config";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const channel = resolveChannelFromHost(host) ?? DEFAULT_CHANNEL;

  const response = NextResponse.next();
  response.cookies.set("channel", channel, { path: "/", sameSite: "lax" });
  return response;
}
```

### 3.4 Which helper to use where

| Context | Helper | Import |
|---|---|---|
| Server component, route handler | `await getChannel()` | `@1sp/site-config/server` |
| `generateStaticParams`, edge, middleware | `getChannelFromEnv()` | `@1sp/site-config` |
| Middleware host mapping | `resolveChannelFromHost(host)` | `@1sp/site-config` |

**Never** read `process.env.NEXT_PUBLIC_CHANNEL` directly in feature code.

### 3.5 Find and replace all hardcoded brand references

Search the codebase for:

- The company name as a literal string (e.g. `"Acme"`, `"acmeweb"`)
- `process.env.NEXT_PUBLIC_CHANNEL` used directly
- Hardcoded locale arrays like `["en", "de"]`
- Hardcoded GA IDs, domain names, logo paths

Replace every instance with a lookup from `SITE_BRAND` or `getSiteConfig(channel)`.

---

## 4. Phase 1 — Extract shared packages

**Goal:** data-layer code lives in `packages/`; visual code stays in the app.

### 4.1 Monorepo structure

```
pnpm-workspace.yaml   → packages: [".", "apps/*", "packages/*"]

packages/
├── site-config/        @company/site-config
├── sanity-types/       @company/sanity-types
├── sanity-schema/      @company/sanity-schema
├── sanity-queries/     @company/sanity-queries
├── pagebuilder-core/   @company/pagebuilder-core
└── utils/              @company/utils

apps/
├── brand-a-web/        (original app, kept as-is or at root)
└── brand-b-web/        (new site)
```

Each package needs a `package.json` with:

```json
{
  "name": "@company/package-name",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts"
  },
  "types": "./src/index.ts",
  "files": ["src"]
}
```

Reference workspace packages with `"workspace:*"` — **not** a semver range.

### 4.2 What goes in each package

#### `@company/site-config`
Everything from Phase 0: `WebsiteChannel`, `SITE_CONFIGS`, `getSiteConfig`,
`getChannelFromEnv`, `resolveChannelFromHost`, `getChannel` (server).

Dependencies: none (must stay zero-dep for use in middleware/edge).

#### `@company/sanity-schema`
All `defineType()` / `defineField()` calls. No React rendering code. No query
logic.

Dependencies: `sanity`, `@sanity/icons`, `@sanity/ui` (for custom input
components only).

#### `@company/sanity-queries`
GROQ query strings, Sanity client creation, cached fetch wrappers,
`sanityFetch` for live preview, env var readers.

Dependencies: `@company/site-config`, `@company/sanity-types`, `next-sanity`,
`@sanity/image-url`, `@vercel/stega`.

#### `@company/sanity-types`
TypeGen output + any hand-written types that TypeGen doesn't cover (menu
types, etc.). This is the only package that is *generated* — treat it like a
build artefact that happens to be checked in.

Dependencies: none.

#### `@company/pagebuilder-core`
`BlockRegistry` type definition + `renderBlocks(content, registry)` function.
This is the *contract* — each app provides its own registry of React
components. The package itself has no visual code.

Dependencies: none (types only; React is a peer dep).

```typescript
// packages/pagebuilder-core/src/index.ts
export type BlockRenderer<T = Record<string, unknown>> =
  (props: T) => React.ReactNode;

export type BlockRegistry = Record<string, BlockRenderer<any>>;

export function renderBlocks(
  content: Array<{ _type: string; [key: string]: unknown }> | null | undefined,
  registry: BlockRegistry
): React.ReactNode[] {
  return (content ?? []).map((block, i) => {
    const Renderer = registry[block._type];
    if (!Renderer) return null;
    return <Renderer key={block._key ?? i} {...block} />;
  });
}
```

#### `@company/utils`
`cn()` (clsx + tailwind-merge), Cloudinary URL helpers, shared hooks
(`useMediaQuery`, `useInView`, etc.), translation string maps.

Dependencies: `clsx`, `tailwind-merge`. React is a peer dep.

### 4.3 Declare ALL deps in each package — no silent hoisting

pnpm uses an isolated `node_modules` layout. A package that imports `react`
without declaring it will resolve locally (because root declares it) but will
fail on Vercel's clean checkout. The rule:

> If a file in package X imports Y, then Y must appear in package X's
> `package.json` `dependencies` or `peerDependencies`.

After extracting packages, do an import audit:

```bash
# For each package, list all bare imports and compare to package.json deps
grep -rh "^import" packages/site-config/src/ | \
  grep -oP "from '[^@./][^']+'" | sort -u
```

Cross-reference with `package.json`. Anything missing is a latent Vercel failure.

---

## 5. Phase 2 — Add the second site

### 5.1 Scaffold the new app

```
apps/brand-b-web/
├── app/
│   ├── layout.tsx
│   ├── (site)/[locale]/
│   │   ├── page.tsx
│   │   └── [...slug]/page.tsx
│   └── api/
├── components/
│   ├── pagebuilder/        ← brand B's own PageBuilder
│   └── ui/                 ← brand B's own visual components
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

`package.json` for the new app:

```json
{
  "name": "brand-b-web",
  "private": true,
  "dependencies": {
    "@company/site-config": "workspace:*",
    "@company/sanity-queries": "workspace:*",
    "@company/sanity-types": "workspace:*",
    "@company/utils": "workspace:*",
    "next": "15.x.x",
    "react": "^19",
    "@portabletext/react": "^4.0.0"
  }
}
```

### 5.2 Visual code rule

Components under `apps/brand-b-web/components/` must **never** import from
`apps/brand-a-web/components/`. Cross-app visual imports create tight coupling
and make independent deploys fragile.

If two apps need the same UI atom, extract it to `@company/utils` only if it
is truly brand-agnostic and has no visual opinion. Otherwise, copy it — the
duplication is intentional.

### 5.3 Route parity via shared queries

Both apps read from the same Sanity dataset. Slug-based pages use
`getChannelFromEnv()` in `generateStaticParams`:

```typescript
export async function generateStaticParams() {
  const channel = getChannelFromEnv();   // ← never a literal
  const slugs = await getPageSlugsForChannel(channel);
  return slugs.map(slug => ({ slug: slug.split("/") }));
}
```

Sanity GROQ queries must always filter by `$channel`:

```groq
*[_type == "page" && channel == $channel && !(_id in path("drafts.**"))]{
  slug, title, content
}
```

### 5.4 Sanity Studio desk structure

Keep one Studio but organise the desk by channel, then by language. This way
editors for Brand A and editors for Brand B work in clearly separated areas
with no risk of cross-contamination.

```typescript
// sanity/structure.ts
export const structure = (S) =>
  S.list().title("Content").items([
    S.listItem().title("Brand A").child(
      S.list().items([
        S.documentTypeListItem("page").title("Pages")
          .filter('channel == "brandAWeb"'),
        // ...
      ])
    ),
    S.listItem().title("Brand B").child(
      S.list().items([
        S.documentTypeListItem("page").title("Pages")
          .filter('channel == "brandBWeb"'),
      ])
    ),
  ]);
```

---

## 6. Phase 3 — Unify per-channel content arrays (schema migration)

This phase applies when the original codebase had **separate content arrays
per brand** (e.g. `content1sp`, `contentMSM`) and you want to consolidate
into a single `content` field.

Skip this phase entirely if starting fresh — design a unified `content` field
from day one and never create per-channel arrays.

### 6.1 Why unify

Per-channel arrays mean every GROQ projection is duplicated N times, every
consumer component has a conditional, and editors must know which field to edit
per brand. The unified field eliminates all three problems.

### 6.2 Migration sequence (always this order)

**PR 1 — additive schema change (no data touch)**
- Add the new `content` field to the Sanity schema alongside the old fields.
- Mark old fields `readOnly: true` and add a `deprecated` description.
- Deploy this. Editors see the new empty `Content` field and the old
  read-only fields — no breakage.

**PR 2 — frontend reads new field with coalesce fallback**
- Change GROQ to: `"content": coalesce(content, contentBrandA, contentBrandB)`
- Update all consumers to read `page.content`.
- Deploy this. Existing documents still serve via the coalesce fallback.
  New documents written to `content` also work.

**PR 3 — migration script (code only, do not run yet)**
- Write the migration script using `@sanity/migrate`'s `defineMigration`.
- Use `setIfMissing` (idempotent) — never overwrite an existing value.
- Commit and deploy. The script exists but is not executed.

**Run the migration** (after PR 3 is deployed and smoke-tested):
```bash
# Dry run first — shows what would change, touches nothing
npx sanity@latest migration run --dry --dataset production

# Real run
npx sanity@latest migration run --dataset production
```

**PR 4 — drop the coalesce (read `content` directly)**
- Only run after verifying migration completed on every document.
- GROQ queries now read `content[]` with no fallback.

**PR 5 — remove old fields from schema (cleanup)**
- After a stable period (1–2 sprints), remove the deprecated fields.

### 6.3 Migration script template

```typescript
// migrations/unify-content/index.ts
import { defineMigration, at, setIfMissing } from "sanity/migrate";

const CHANNEL_TO_LEGACY: Record<string, string> = {
  brandAWeb: "contentBrandA",
  brandBWeb: "contentBrandB",
};

export default defineMigration({
  title: "Unify per-channel content arrays into content",
  documentTypes: ["page"],
  filter: `_type == "page" && !defined(content) && (defined(contentBrandA) || defined(contentBrandB))`,
  migrate: {
    document(doc) {
      const channel = doc.channel as string;
      const legacyField = CHANNEL_TO_LEGACY[channel];
      if (!legacyField) return;
      const legacyData = doc[legacyField as keyof typeof doc];
      if (!legacyData) return;
      return at("content", setIfMissing(legacyData));
    },
  },
});
```

### 6.4 What NOT to do

- **Do not use `hidden` on `defineArrayMember`** to whitelist blocks
  per channel. Sanity's type definition `ArrayOfEntry<T>` explicitly removes
  the `hidden` property — it is not supported on array members. Predicates like
  `hidden: ({document}) => document?.channel !== "brandA"` silently do nothing.
- **Per-channel block whitelisting requires Sanity workspaces** —
  `defineConfig([workspaceA, workspaceB])` where each workspace registers its
  own block subset. Use this only when a site genuinely needs blocks that
  shouldn't exist on other sites. Starting with one shared `content` array is
  almost always fine.

---

## 7. Phase 4 — Deploy each site to its own Vercel project

### 7.1 One Vercel project per brand

| Brand | Vercel project | Root directory | `NEXT_PUBLIC_CHANNEL` |
|---|---|---|---|
| Brand A | `company-brand-a` | `.` or `apps/brand-a-web` | `brandAWeb` |
| Brand B | `company-brand-b` | `apps/brand-b-web` | `brandBWeb` |

Each project is connected to the **same GitHub repository** but points at
a different root directory and has different env vars.

### 7.2 Required env vars per Vercel project

```
NEXT_PUBLIC_CHANNEL=brandBWeb

NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-16

SANITY_API_WRITE_TOKEN=sk...
SANITY_VIEWER_TOKEN=sk...
SANITY_REVALIDATE_SECRET=...
SANITY_PREVIEW_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Site-specific
NEXT_PUBLIC_SITE_URL=https://brandb.com
```

Brand-level config (name, SEO defaults, logo, GA ID) lives in `SITE_CONFIGS`
in code — **not** in env vars. Only deployment-specific secrets and the channel
pin go in env vars.

### 7.3 Branch strategy

```
main     → auto-deploys Brand A production (and Brand B production)
dev      → auto-deploys Brand A staging (and Brand B staging)
feature/* → preview deployments on each Vercel project
```

Merge path: `feature/*` → `dev` (staging gate) → `main` (production).

### 7.4 Vercel CLI: setting env vars non-interactively

```bash
# From the repo root, linked to the Vercel project
printf "brandBWeb" | vercel env add NEXT_PUBLIC_CHANNEL production
printf "brandBWeb" | vercel env add NEXT_PUBLIC_CHANNEL preview
printf "brandBWeb" | vercel env add NEXT_PUBLIC_CHANNEL development
```

### 7.5 Local dev for the second site

Add a `.env.local` override in `apps/brand-b-web/`:

```env
NEXT_PUBLIC_CHANNEL=brandBWeb
```

Or set the `channel` cookie in your browser to `brandBWeb` to simulate any
brand on the same local server.

---

## 8. Phase 5 — Operations at scale

### 8.1 Sanity → Vercel webhooks

**At 1–2 sites:** one global Sanity webhook that hits Brand A's
`/api/revalidate`. Brand A's ISR triggers; Brand B relies on its `revalidate`
TTL. Harmless but lazy.

**At 3+ sites:** configure one webhook per site, filtered to only fire when
content for that channel changes:

```groq
// Webhook filter for Brand B
_type in ["page", "caseStudy"] && channel == "brandBWeb"
```

Each webhook points at that brand's `/api/revalidate` endpoint.

### 8.2 ISR revalidation webhook (`/api/revalidate`)

The webhook verifies a shared secret, then revalidates by tag:

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { _type, slug } = body;

  // Coarse invalidation always runs
  revalidateTag("sanity");

  // Fine-grained invalidation
  if (_type === "page" && slug?.current) {
    revalidateTag(`page:${slug.current}`);
  }

  return Response.json({ revalidated: true });
}
```

Tag the fetch calls at query time:

```typescript
// In your cached fetch wrapper
fetch(..., { next: { tags: ["sanity", "pages", `page:${slug}`] } })
```

### 8.3 TypeGen pipeline

Sanity TypeGen generates TypeScript types from the deployed schema.
Point the output to the shared package so all apps stay in sync:

`sanity-typegen.json`:
```json
{
  "path": "./apps/brand-a-web/**/*.{ts,tsx}",
  "schema": "schema.json",
  "generates": "packages/sanity-types/src/index.ts"
}
```

Add to root `package.json`:
```json
{
  "scripts": {
    "typegen": "sanity schema extract && sanity typegen generate"
  }
}
```

Run `pnpm typegen` after every schema change. Commit the result. Do not
hand-edit the output file — it will be overwritten.

### 8.4 Cloudinary for media

Store all images and videos in Cloudinary, not in Sanity assets or
`public/`. Use the `sanity-plugin-cloudinary` plugin for the editor upload
experience.

```typescript
// Utility in @company/utils
export function assetUrl(asset: { public_id?: string; secure_url?: string }): string {
  if (!asset.public_id) return asset.secure_url ?? "";
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${asset.public_id}`;
}
```

Never commit binary files (`*.mp4`, `*.webm`, large images) to the repo.

---

## 9. Adding a new site — checklist

Use this every time a new brand joins the platform. Estimated effort: 1–2 days
for a standard site.

### Code changes

- [ ] Add `brandXWeb` to `WebsiteChannel` union type in `@company/site-config`
- [ ] Add `brandXWeb` entry to `SITE_CONFIGS` (name, locales, domains, SEO, logo)
- [ ] Add a channel filter to the Sanity Studio desk structure
- [ ] Scaffold `apps/brand-x-web/` (see Phase 2.1 for structure)
- [ ] Implement `apps/brand-x-web/components/pagebuilder/` with the blocks this
      brand needs (copy+adapt from Brand A or start fresh — visual code is
      per-app)
- [ ] `pnpm build` locally to confirm the new app compiles

### Sanity

- [ ] Create an initial set of `page` documents in the dataset with
      `channel: "brandXWeb"` for at least: homepage, a generic slug page,
      `/contact`
- [ ] Configure CORS to allow the new Vercel deployment domain

### Vercel

- [ ] Create a new Vercel project pointing at `apps/brand-x-web/`
- [ ] Set all required env vars (see Phase 4.2), especially
      `NEXT_PUBLIC_CHANNEL=brandXWeb`
- [ ] Link the project to the same GitHub repo; configure `dev` → dev deploy,
      `main` → production deploy
- [ ] Set up the Sanity revalidation webhook pointing at the new
      `/api/revalidate` endpoint (with the channel filter if ≥3 sites)

### DNS & domains

- [ ] Point the brand domain's DNS at Vercel
- [ ] Add the domain in the Vercel project settings
- [ ] Add the domain to `SITE_CONFIGS[brandXWeb].domains` so the middleware
      host resolver works in production

### QA

- [ ] Confirm homepage, a slug page, `/contact` render on preview URL
- [ ] Confirm Sanity Studio `/studio` shows the new channel's documents
- [ ] Confirm `/sitemap.xml` lists only Brand X pages
- [ ] Confirm ISR revalidation fires and updates a page within 60 seconds
      of a publish

---

## 10. Invariants (never break these)

1. **No channel literal in feature code.** Use `getChannel()` (server) or
   `getChannelFromEnv()` (build-time / edge). Never `"brandAWeb"` inline.

2. **No brand string literals.** Use `SITE_BRAND.name` or
   `getSiteConfig(channel).name`. Never `"Acme Corp"` inline.

3. **Every Sanity query must filter by `$channel`.** A query that returns
   documents from all channels will leak Brand A content into Brand B's
   pages.

4. **`generateStaticParams` must call `getChannelFromEnv()`**, never a
   literal, so each deployment only pre-renders its own pages.

5. **No cross-app visual imports.** `apps/brand-b-web` must not import from
   `apps/brand-a-web`. Only imports from `packages/*` are allowed across apps.

6. **Each package declares its own deps.** No relying on root hoisting.
   Vercel's clean checkout exposes any omission immediately.

7. **Code ships before data migrations.** Never run a migration against a
   schema the deployed code doesn't yet know about.

8. **Migrations are idempotent.** Use `setIfMissing`, never `set`. Safe to
   re-run if interrupted.

9. **`main` is production.** Merge path is `feature` → `dev` → `main`.
   No experimental commits directly to `main`.

10. **Vercel is the only deployment target.** No Docker, no other CI deploy
    steps. Merges to `main` / `dev` auto-deploy via Vercel Git integration.

---

## 11. Known traps

### Multiple lockfiles → Vercel uses wrong package manager
Presence of `package-lock.json` alongside `pnpm-lock.yaml` causes Vercel to
detect npm and fail on `workspace:*` deps. Delete all non-pnpm lockfiles.
Add `"packageManager": "pnpm@X.Y.Z"` to root `package.json` and set
`installCommand` in `vercel.json`.

### pnpm isolation: transitive deps not hoisted
Local builds resolve transitive deps via the parent directory's
`node_modules` (Node walks upward). Vercel's clean checkout has no parent.
Symptom: `Cannot find module 'X'` only in CI. Fix: declare every direct
import as a direct dep in *that package's* `package.json`.

### `hidden` on `defineArrayMember` does nothing
`ArrayOfEntry<T>` in Sanity's types is `Omit<T, 'name' | 'hidden'>`. The
`hidden` property is stripped. Per-channel block filtering requires Sanity
workspaces, not hidden predicates on array members.

### Sanity `null` vs `undefined`
Sanity returns `null` for empty arrays/fields, not `undefined`. Default
function parameters (`fn(arr = [])`) do NOT protect against `null`. Always
use `(arr ?? [])` before array operations. See `docs/SANITY_NULL_HANDLING.md`
in the reference codebase.

### `framer-motion` vs `motion`
The library renamed to `motion`. Import from `"motion/react"`, not
`"framer-motion"`. Both may exist in the lockfile if dependencies aren't
deduplicated — run `pnpm dedupe` after adding packages.

### Two lockfiles in a worktree
A git worktree sitting inside the parent repo has two `pnpm-lock.yaml` files
in the Node resolution path. Vercel sees only the worktree's lockfile; local
builds see both. Keep worktrees only for development; merge to a real branch
before considering the build canonical.

### ISR + `revalidate = 60` doesn't help editors
`revalidate = 60` means up to 60 seconds of stale content. Wire up the
Sanity webhook → `/api/revalidate` so publishes take effect in seconds, not
minutes. The webhook and the TTL work together: the TTL is the safety net,
the webhook is the fast path.

### Video assets committed to the repo
Large MP4/WebM files in `public/` bloat the git history and slow Vercel
builds. Store all video in Cloudinary. Reference paths will 404 until assets
are migrated; don't ship a site until migration is complete.
