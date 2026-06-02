# RECIPE — Multi-channel, Multi-language Sanity + Vercel + Next.js Template

> A clean, agent-followable setup recipe for a new project that needs to power
> N branded websites (channels) from one Sanity backend, deployed as N separate
> Vercel apps. Distilled from the production multisite work in this repo, with
> the corners we cut explicitly marked so they aren't repeated.
>
> **Drop this file into a fresh repo as `RECIPE.md`, then point your AI agent
> at it.** It's structured for an AI to execute step-by-step, with verification
> checkpoints between phases. Humans can also read it linearly.
>
> Conventions used in this doc:
> - **`@org/*`** is a placeholder for your private npm scope (`@yourcompany/*`).
> - **`primaryWeb`, `secondaryWeb`** are placeholder channel ids — pick your own.
> - **`💡 Improvement`** callouts mark choices that differ from the source repo,
>   where the source got it wrong (or just landed somewhere lossy) and you
>   should start clean.
> - **`⚠️ Anti-pattern`** callouts mark traps that bit the source repo and cost
>   real time. Don't repeat them.
> - **`🧪 Verify`** callouts are checkpoints — confirm before moving on.

---

## Table of contents

0. [Preconditions and decisions to make first](#0-preconditions-and-decisions-to-make-first)
1. [Architecture overview](#1-architecture-overview)
2. [Repo skeleton — pnpm workspace monorepo](#2-repo-skeleton--pnpm-workspace-monorepo)
3. [Sanity project setup](#3-sanity-project-setup)
4. [Shared packages](#4-shared-packages)
5. [The first channel app](#5-the-first-channel-app)
6. [Content modeling — page, global content, internationalization](#6-content-modeling)
7. [Page-builder system from day one](#7-page-builder-system-from-day-one)
8. [Performance patterns](#8-performance-patterns)
9. [Tailwind v4 + motion conventions](#9-tailwind-v4--motion-conventions)
10. [Deployment per site (Vercel)](#10-deployment-per-site-vercel)
11. [Adding channel #2 and beyond](#11-adding-channel-2-and-beyond)
12. [Sanity workspaces — when and how](#12-sanity-workspaces--when-and-how)
13. [Webhooks and revalidation strategy](#13-webhooks-and-revalidation-strategy)
14. [TypeGen workflow](#14-typegen-workflow)
15. [Migration discipline](#15-migration-discipline)
16. [Anti-patterns / lessons learned](#16-anti-patterns--lessons-learned)
17. [Operating notes for an AI agent following this recipe](#17-operating-notes-for-an-ai-agent)

---

## 0. Preconditions and decisions to make first

Before any code is written, lock down these answers:

| Decision | Why it matters | Default if unsure |
|---|---|---|
| **Channel ids** | Used as the discriminator in every Sanity document. Cannot be renamed cheaply later. | Use `<brand>Web` form, lowercase first letter: `acmeWeb`, `partnerWeb`. Don't use slashes, spaces, or capitals at the start. |
| **Locales (BCP-47 codes)** | Sanity + Next.js routing key off this. Adding later is fine; renaming is not. | `["en"]` to start; add `["en", "de"]` etc. when you need them. |
| **URL strategy per locale** | Default-locale URLs without a `/en` prefix, or always prefixed? Affects middleware, sitemaps, SEO. | Locale-free public URLs for the default locale (`/about`), prefixed for others (`/de/about`). Middleware handles the rewrite. |
| **Studio host** | Embedded in each Next.js app at `/studio`, or standalone deployed to `your.sanity.studio`? | **Embedded.** One less deploy, schema travels with the app. |
| **Dataset strategy** | One shared production dataset, or one per channel? | **One shared** dataset for content sharing across channels (cases, people). Per-channel datasets only if you need hard data isolation for compliance. |
| **Image/video hosting** | Sanity assets, Cloudinary, or both? | **Cloudinary** via `sanity-plugin-cloudinary`. Big videos must never live in git. |
| **Package manager** | pnpm, npm, or yarn? | **pnpm.** Workspaces, strict deps, no surprises. |
| **Node version** | Pin to one. | **Node 22+** (or whatever Next.js' current recommended LTS is). |
| **CMS-first agency vs product company?** | Affects how often editors touch the schema. | Either works. CMS-first benefits more from a strict block contract. |
| **Number of channels you'll launch in year 1** | Affects whether to invest in Sanity workspaces from day one. | Up to ~4 channels: hidden-field scoping is fine. 5+: invest in workspaces. |

> ❓ **Questions for the human before the agent starts**
>
> 1. What's your npm scope? (`@acme`, `@yourcorp`, etc.)
> 2. What's the first channel's id and what's its production URL?
> 3. What locales do you launch with?
> 4. Sanity project id (from sanity.io/manage) and dataset name.
> 5. Cloudinary cloud name (or pick another media provider — note it).
> 6. Which Vercel team will own these deployments?

---

## 1. Architecture overview

```
your-repo/                              ← root: workspace config only (no app code)
├── apps/
│   ├── primary-web/                    ← Next.js app for channel #1 (your flagship)
│   ├── secondary-web/                  ← Next.js app for channel #2 (when added)
│   └── studio/                         ← (optional) standalone Sanity Studio deploy
├── packages/
│   ├── site-config/                    ← @org/site-config
│   ├── sanity-schema/                  ← @org/sanity-schema
│   ├── sanity-queries/                 ← @org/sanity-queries
│   ├── sanity-types/                   ← @org/sanity-types (TypeGen output)
│   ├── pagebuilder-core/               ← @org/pagebuilder-core
│   └── utils/                          ← @org/utils
├── migrations/                         ← Sanity migrations live here
├── docs/                               ← Architecture, runbooks
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

### What goes in `packages/*` (shared)

- **Data shape** — Sanity schemas, GROQ queries, generated TypeScript types
- **Pure utilities** — `cn()`, Cloudinary URL helpers, logic-only hooks
- **Plumbing** — block registry types, render helpers
- **Channel/brand config** — per-channel SITE_CONFIGS, env-driven channel resolution

### What goes in `apps/*` (per-channel, never shared)

- **All visual code** — Buttons, Heroes, Cards, Nav, Footer, PageBuilder
- **The block→component registry** — each app maps Sanity `_type` to its own components
- **Layout, fonts, theme tokens, motion timings**
- **`next.config.ts`, middleware, API routes, sitemaps, robots**

### The core rule

> **Share data and contracts. Don't share UI.**
>
> Every site consumes the same Sanity schema and the same generated types.
> Every site has its own components, free to deviate visually and
> interactively. The block contract (props each `_type` receives) is shared;
> the rendering is not.
>
> ⚠️ **Anti-pattern (from this repo):** apps that copy entire component
> directories from one to another. Drift hell starts immediately. Components
> are per-app from day one; if two sites need an identical visual, accept the
> duplication — it's a feature, not a bug.

---

## 2. Repo skeleton — pnpm workspace monorepo

### 2.1 Initialize

```bash
mkdir your-repo && cd your-repo
git init
pnpm init -y
```

### 2.2 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"

onlyBuiltDependencies:
  - "@tailwindcss/oxide"
  - "@vercel/speed-insights"
  - esbuild
  - sharp
  - unrs-resolver
```

### 2.3 Root `package.json`

```jsonc
{
  "name": "your-repo",
  "private": true,
  "packageManager": "pnpm@10.7.0",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev:primary": "pnpm --filter @org/primary-web dev",
    "build:primary": "pnpm --filter @org/primary-web build",
    "lint": "pnpm -r lint",
    "typegen": "sanity schema extract && sanity typegen generate"
  }
}
```

> 💡 **Improvement over source repo:** declare `packageManager` and `engines`
> from day one. Source repo didn't — it caused npm to be auto-detected on
> Vercel and break `workspace:*` resolution on first deploy. Cost ~3 build
> attempts to find.

### 2.4 `tsconfig.base.json` at root

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "allowJs": true
  }
}
```

Each `apps/*` and `packages/*` `tsconfig.json` does `"extends": "../../tsconfig.base.json"`.

### 2.5 `.gitignore` essentials

```
node_modules/
.next/
.vercel/
.env
.env*.local
*.tsbuildinfo
EXPORT/           # never commit Sanity dataset exports
.DS_Store
```

> ⚠️ **Anti-pattern:** committing Sanity dataset exports (.ndjson, .tgz) to git.
> Source repo had a 99KB tarball and 148-line ndjson with production data
> committed. Treat dataset exports like database dumps — never in code repos.

### 2.6 Single lockfile rule

```bash
# Use pnpm ONLY. Never commit:
git ls-files | grep -E '(package-lock\.json|yarn\.lock)'
# Expected output: nothing
```

> ⚠️ **Anti-pattern:** mixed lockfiles. Source repo had both `package-lock.json`
> and `pnpm-lock.yaml` committed, which made Vercel default to npm. Pick pnpm,
> delete the others, never look back.

### 2.7 Initial commit

```bash
git add -A
git commit -m "chore: bootstrap pnpm workspace monorepo"
```

> 🧪 **Verify:** `ls -la` shows `pnpm-workspace.yaml`, `package.json`, `.gitignore`,
> `tsconfig.base.json`. No `node_modules/`, no other lockfiles.

---

## 3. Sanity project setup

### 3.1 Create the Sanity project

In sanity.io/manage:

1. Create a new project; note the project id.
2. Create one dataset called `production`.
3. (Optional) Create a dev dataset for safer schema iteration. Source repo
   had only `production` — that worked but every schema test ran against
   live content. **A dev dataset is worth the small monthly cost.**
4. Under API → CORS origins, add `http://localhost:3000` and your eventual
   Vercel preview/production URLs.
5. Generate an API token: API → Tokens → "Editor" role. Save as
   `SANITY_API_WRITE_TOKEN` env var — used for the contact form and
   migration scripts.

> 💡 **Improvement:** have a staging dataset from day one. Source repo ran all
> schema changes against production.

### 3.2 Sanity CLI config

In a future Studio app, `sanity.cli.ts` reads project id and dataset from env.
Plan env vars now:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=...
```

---

## 4. Shared packages

Build the six packages **in dependency order**. Each one is independently
green before you move on. After each package, `pnpm install` and verify
TypeScript resolves it.

### 4.1 `@org/site-config` — channel + brand config

```
packages/site-config/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts        ← pure: SITE_CONFIGS, channel resolution helpers
    └── server.ts       ← server-only: async getChannel() reading cookies
```

**`package.json`:**

```jsonc
{
  "name": "@org/site-config",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts"
  },
  "types": "./src/index.ts"
}
```

**`src/index.ts`** (the contract):

```ts
export type WebsiteChannel = "primaryWeb" | "secondaryWeb"; // expand later
export type LocaleCode = "en" | "de" | "pl";

export type SiteConfig = {
  channel: WebsiteChannel;
  name: string;
  shortName: string;
  defaultLocale: LocaleCode;
  locales: LocaleCode[];
  domains: { production?: string; preview?: string; local?: string };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleSiteVerification?: string;
  };
  tracking: {
    vercelAnalytics: boolean;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
  logo: { light: string; dark: string; alt: string };
};

export const SITE_CONFIGS: Record<WebsiteChannel, SiteConfig> = {
  primaryWeb: {
    channel: "primaryWeb",
    name: "Acme",
    shortName: "Acme",
    defaultLocale: "en",
    locales: ["en"],
    domains: {},
    seo: { defaultTitle: "Acme", defaultDescription: "..." },
    tracking: { vercelAnalytics: true },
    logo: { light: "/logo-light.svg", dark: "/logo-dark.svg", alt: "Acme" },
  },
  secondaryWeb: { /* fill in when launching */ } as SiteConfig,
};

const DEFAULT_CHANNEL: WebsiteChannel = "primaryWeb";
export const WEBSITE_CHANNELS = Object.keys(SITE_CONFIGS) as WebsiteChannel[];

export function isKnownChannel(value: unknown): value is WebsiteChannel {
  return typeof value === "string" && value in SITE_CONFIGS;
}

export function getChannelFromEnv(): WebsiteChannel {
  const v = process.env.NEXT_PUBLIC_CHANNEL?.trim();
  return isKnownChannel(v) ? v : DEFAULT_CHANNEL;
}

export function getSiteConfig(channel: string | undefined): SiteConfig {
  return channel && channel in SITE_CONFIGS
    ? SITE_CONFIGS[channel as WebsiteChannel]
    : SITE_CONFIGS[DEFAULT_CHANNEL];
}

// Optional: host-based channel resolution for multi-host deploys
export function resolveChannelFromHost(host: string | null | undefined): WebsiteChannel | null {
  // Parse process.env.NEXT_PUBLIC_HOST_CHANNEL_MAP like "acme.com:primaryWeb,..."
  // (omitted for brevity; see source repo)
  return null;
}

export const SITE_BRAND: SiteConfig = getSiteConfig(getChannelFromEnv());
export { DEFAULT_CHANNEL };
```

**`src/server.ts`** (cookie-aware, server-only):

```ts
import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_CHANNEL, isKnownChannel, type WebsiteChannel } from "./index";

export async function getChannel(): Promise<WebsiteChannel> {
  const fromEnv = process.env.NEXT_PUBLIC_CHANNEL?.trim();
  if (isKnownChannel(fromEnv)) return fromEnv;
  try {
    const fromCookie = (await cookies()).get("channel")?.value;
    if (isKnownChannel(fromCookie)) return fromCookie;
  } catch { /* outside request scope */ }
  return DEFAULT_CHANNEL;
}
```

> 💡 **Improvement:** put `SITE_CONFIGS` in code, not env vars. Source repo
> initially threaded 8+ `NEXT_PUBLIC_*` vars per deployment (logo paths, GA
> ID, etc.). Code-driven config is more maintainable; per-deployment env is
> just `NEXT_PUBLIC_CHANNEL=primaryWeb` plus the Sanity vars.

### 4.2 `@org/sanity-types` — TypeGen output

```
packages/sanity-types/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts        ← (generated) Sanity document types
    └── menu.ts         ← (hand-written) NavbarMenu, FooterMenu
```

The `src/index.ts` is **machine-generated** by `sanity typegen`. Configure
the output path in `sanity-typegen.json` (see [section 14](#14-typegen-workflow)).

> 💡 **Improvement over source repo:** wire TypeGen to write directly into the
> package from day one. Source repo's TypeGen wrote to `types/sanity.types.ts`
> and we had to hand-edit when adding fields. Don't repeat.

### 4.3 `@org/sanity-schema` — schemas

```
packages/sanity-schema/
├── package.json
└── src/
    ├── index.ts        ← exports `schema = { types: [...] }`
    ├── documents/      ← page, caseStudy, person, ...
    ├── objects/        ← cta, link, metadata, ...
    └── blocks/         ← all page-builder block types
```

**Critical rule:** all schemas use `defineType` / `defineField` /
`defineArrayMember` from `sanity`. No exceptions — gives you autocompletion,
type-safety, and consistent shape.

```ts
// src/index.ts
import type { SchemaTypeDefinition } from "sanity";
import page from "./documents/page";
import caseStudy from "./documents/caseStudy";
// ... etc

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [page, caseStudy /* ... */],
};
```

### 4.4 `@org/sanity-queries` — GROQ + cached fetch

```
packages/sanity-queries/
├── package.json
└── src/
    ├── index.ts            ← cached query functions (React cache())
    ├── groq.ts             ← raw GROQ strings (defineQuery)
    ├── client.ts           ← next-sanity client
    ├── fetch.ts            ← sanityFetch primitive (with draftMode)
    ├── live.ts             ← defineLive setup
    ├── env.ts              ← projectId, dataset, apiVersion
    ├── image.ts            ← urlFor, resolveImageUrl
    └── safe-fetch.ts       ← retry wrapper
```

`package.json` exports each subpath so consumers can import precisely:

```jsonc
"exports": {
  ".": "./src/index.ts",
  "./groq": "./src/groq.ts",
  "./client": "./src/client.ts",
  "./fetch": "./src/fetch.ts",
  "./live": "./src/live.ts",
  "./image": "./src/image.ts",
  "./env": "./src/env.ts",
  "./safe-fetch": "./src/safe-fetch.ts"
}
```

**Declare every direct dependency.** This package depends on `next-sanity`,
`@sanity/image-url`, `@vercel/stega`, and the `@org/*` workspace packages.
List them all in `package.json` — pnpm's isolated layout means transitives
are NOT available unless declared.

> ⚠️ **Anti-pattern that bit this repo three times:** workspace packages that
> import a transitive dep without declaring it. Locally it works because
> Node walks up the directory tree into the parent repo's `node_modules`.
> On Vercel's clean checkout, the resolution fails. The fix: audit every
> package's imports against its declared deps before pushing.

#### Cached query pattern

```ts
// src/index.ts
import { cache } from "react";
import { sanityFetch } from "./fetch";
import { PAGE_QUERY } from "./groq";
import { getChannelFromEnv } from "@org/site-config";

export const getPageBySlug = cache(async (
  slug: string,
  channel: string,
  language: string,
) => {
  const { data } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug, channel, language },
    tags: ["pages", `page:${slug}`],
  });
  return data;
});

export const getAllPageSlugs = cache(async (
  channel: string = getChannelFromEnv(),
) => {
  // returns slugs filtered by the active channel, used in
  // generateStaticParams so each site only pre-renders its own pages
  // ...
});
```

> 💡 **Why `cache()`:** when both `generateMetadata` and the page component
> call `getPageBySlug(slug, channel, language)`, React's `cache()`
> deduplicates them into one Sanity fetch per render.

### 4.5 `@org/pagebuilder-core` — registry contract

```
packages/pagebuilder-core/
└── src/index.ts
```

The whole package is ~100 lines of types + a `renderBlocks` helper. **Ship
this from day one.** It defines the contract every app's PageBuilder follows.

```ts
import React, { type ComponentType, type ReactElement, type ReactNode } from "react";

export type SanityBlock = { _type: string; _key?: string } & Record<string, unknown>;

export type BlockRegistry<TBlockType extends string = string> =
  Partial<Record<TBlockType, ComponentType<{ data: any }>>>;

export interface RenderBlocksOptions {
  fallback?: ComponentType<{ block: SanityBlock }>;
  wrapper?: ComponentType<{ children: ReactNode; blockType: string }>;
}

export function renderBlocks(
  content: SanityBlock[] | null | undefined,
  registry: BlockRegistry,
  options: RenderBlocksOptions = {},
): ReactElement[] {
  if (!content?.length) return [];
  const { fallback: Fallback, wrapper: Wrapper } = options;
  return content.map((block, i) => {
    const Component = registry[block._type];
    const key = block._key ?? `${block._type}-${i}`;
    let el: ReactNode = Component
      ? React.createElement(Component, { data: block })
      : Fallback ? React.createElement(Fallback, { block }) : null;
    if (Wrapper && el) el = React.createElement(Wrapper, { blockType: block._type, children: el });
    return React.createElement(React.Fragment, { key, children: el }) as ReactElement;
  });
}

export function defineRegistry<TBlockType extends string = string>(
  registry: Record<TBlockType, ComponentType<{ data: any }>>,
): BlockRegistry<TBlockType> {
  return registry as BlockRegistry<TBlockType>;
}
```

> 💡 **Critical improvement over source repo:** adopt the registry from day
> one, not after the fact. Source repo built two 525-line static `switch`
> statements (one per app) before extracting the registry, then never
> migrated. Both still exist, both rotted differently. Don't repeat.
> Every app's PageBuilder is a small file that calls `renderBlocks`.

### 4.6 `@org/utils` — pure utilities and hooks

```
packages/utils/
└── src/
    ├── cn.ts                       ← clsx + tailwind-merge
    ├── cloudinary.ts               ← optimizedImageUrl, optimizedVideoUrl, etc.
    ├── clamp.tsx
    ├── responsive.ts               ← media-query constants
    ├── text-content.tsx            ← hasVisibleText, hasVisibleNode
    ├── site-url.ts                 ← canonical URL helpers
    ├── translations.ts             ← static UI string map per locale
    └── hooks/
        ├── use-media-query.ts
        ├── use-robust-in-view.ts
        ├── use-outside-click.ts
        ├── use-optimized-transition-router.ts
        └── use-client-safe.ts
```

**No visual components in `utils`.** Buttons, Cards, anything with a
deliberate look — those live per-app.

`package.json` declares `clsx`, `tailwind-merge`, and `peerDependencies.react`.

> ⚠️ **Anti-pattern:** stuffing `ui-primitives` or "shared components" into a
> package. Tempting but it creates the worst kind of cross-app dependency.

### 4.7 Verify each package builds in isolation

```bash
pnpm install
pnpm -r tsc --noEmit
```

> 🧪 **Verify:** zero TypeScript errors. Each `@org/*` package resolves the
> ones it depends on. None of them import from `apps/*`.

---

## 5. The first channel app

```
apps/primary-web/
├── package.json
├── next.config.ts
├── tsconfig.json
├── middleware.ts
├── tailwind.config.ts          ← (optional — Tailwind v4 uses CSS-first config)
├── postcss.config.mjs
├── components.json             ← (if using shadcn/ui)
├── app/
│   ├── (site)/
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       ├── page.tsx              ← homepage
│   │       ├── [slug]/page.tsx       ← dynamic pages
│   │       ├── cases/page.tsx
│   │       ├── cases/[slug]/page.tsx
│   │       ├── contact/page.tsx
│   │       └── services/page.tsx
│   ├── (studio)/
│   │   └── studio/[[...tool]]/page.tsx ← embedded Studio
│   ├── api/
│   │   ├── revalidate/route.ts       ← Sanity webhook
│   │   ├── revalidate-home/route.ts
│   │   ├── contact/route.ts
│   │   ├── draft-mode/enable/route.ts
│   │   └── draft-mode/disable/route.ts
│   ├── layout.tsx                    ← root layout, fonts, metadata
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
├── components/
│   ├── ui/                           ← Button, Input, Card, ... (per-app)
│   ├── menu/                         ← Nav, Footer (per-app)
│   ├── pagebuilder/                  ← block components (per-app, registered)
│   ├── PageBuilder.tsx               ← tiny: calls renderBlocks(registry)
│   └── SiteWrapper.tsx
├── public/
│   ├── ci/                           ← logos, favicons
│   └── fonts/                        ← if using local fonts
└── sanity.config.ts                  ← Studio config (imports schema)
```

### 5.1 `apps/primary-web/package.json`

```jsonc
{
  "name": "@org/primary-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@org/site-config": "workspace:*",
    "@org/sanity-types": "workspace:*",
    "@org/sanity-queries": "workspace:*",
    "@org/sanity-schema": "workspace:*",
    "@org/pagebuilder-core": "workspace:*",
    "@org/utils": "workspace:*",

    "next": "15.5.x",
    "react": "19.x",
    "react-dom": "19.x",

    "sanity": "^4.x",
    "next-sanity": "^11.x",
    "@sanity/image-url": "^1.x",
    "@sanity/vision": "^4.x",
    "@sanity/document-internationalization": "^4.x",
    "sanity-plugin-cloudinary": "^1.x",
    "@portabletext/react": "^4.x",
    "@portabletext/types": "^2.x",

    "tailwindcss": "^4.x",
    "@tailwindcss/postcss": "^4.x",
    "tailwind-merge": "^3.x",
    "clsx": "^2.x",
    "tw-animate-css": "^1.x",

    "motion": "^12.x",
    "motion-plus": "^1.x",
    "next-view-transitions": "^0.3.x",

    "@vercel/analytics": "^1.x",
    "@vercel/speed-insights": "^1.x"
  }
}
```

**Important:** declare every dep this app imports, even transitives like
`@portabletext/react` that you might think come "free" with `next-sanity`.
With pnpm's strict layout they don't.

### 5.2 `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { externalDir: true, viewTransition: true },
  transpilePackages: [
    "@org/site-config",
    "@org/sanity-types",
    "@org/sanity-queries",
    "@org/sanity-schema",
    "@org/pagebuilder-core",
    "@org/utils",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
export default nextConfig;
```

### 5.3 `middleware.ts` (channel + locale resolution)

```ts
import { NextResponse, type NextRequest, type NextResponse as NextResponseT } from "next/server";
import { resolveChannelFromHost } from "@org/site-config";

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const locale = "en"; // see "Locale routing" section for multi-locale apps

  const applyChannelCookie = (res: NextResponseT) => {
    const ch = resolveChannelFromHost(req.headers.get("host"));
    if (ch && req.cookies.get("channel")?.value !== ch) {
      res.cookies.set("channel", ch, { path: "/", sameSite: "lax" });
    }
    return res;
  };

  // skip locale logic for /api, /trpc, /studio
  if (pathname.startsWith("/api") || pathname.startsWith("/trpc")) {
    return applyChannelCookie(NextResponse.next());
  }

  // redirect old /en/* URLs to the locale-free form (SEO consolidation)
  const segs = pathname.split("/").filter(Boolean);
  if (/^[a-z]{2}(-[A-Z]{2})?$/.test(segs[0] ?? "")) {
    const url = req.nextUrl.clone();
    url.pathname = "/" + segs.slice(1).join("/");
    return applyChannelCookie(NextResponse.redirect(url, 301));
  }

  // rewrite clean URL → internal [locale] route
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return applyChannelCookie(NextResponse.rewrite(url));
}

export const config = {
  matcher: [
    "/((?!studio|_next|.*\\.(?:json|xml|txt|ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### 5.4 Page routes

Every page route imports cached query helpers from `@org/sanity-queries` and
uses `await getChannel()` (from `@org/site-config/server`) to know which
channel is active. Never hardcode a channel string.

```tsx
// app/(site)/[locale]/page.tsx
import { getHomePage } from "@org/sanity-queries";
import { getChannel } from "@org/site-config/server";
import { SITE_BRAND } from "@org/site-config";
import PageBuilder from "@/components/PageBuilder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const channel = await getChannel();
  const page = await getHomePage(channel, locale);
  return {
    title: page?.metadata?.title || SITE_BRAND.seo.defaultTitle,
    description: page?.metadata?.description || SITE_BRAND.seo.defaultDescription,
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const channel = await getChannel();
  const page = await getHomePage(channel, locale);
  if (!page) return null;
  return <PageBuilder content={page.content as any[]} />;
}

export const revalidate = 60;
```

> 💡 **Improvement:** never reference `page.contentSomeChannel` — always
> `page.content`. See section 6 on schema design.

---

## 6. Content modeling

### 6.1 The page document — one unified content array

```ts
// packages/sanity-schema/src/documents/page.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [
    { name: "basic", default: true },
    { name: "settings" },
    { name: "content" },
    { name: "seo" },
  ],
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true, group: "settings" }),
    defineField({ name: "channel",  type: "string", readOnly: true, group: "settings",
      options: { list: ["primaryWeb", "secondaryWeb"] } }),
    defineField({ name: "title", type: "string", group: "basic" }),
    defineField({ name: "slug",  type: "slug",   group: "basic",
      options: { source: "title", isUnique: /* channel + language scoped */ }}),
    defineField({ name: "isHomepage", type: "boolean", group: "settings",
      /* validation: one homepage per channel+language */ }),
    defineField({ name: "metadata", type: "metadata", group: "seo" }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      group: "content",
      of: [
        // every block type your apps might render, in one list
        { type: "hero" },
        { type: "cta" },
        { type: "gallery" },
        // ...
        { type: "block" }, // portable text catch-all
      ],
    }),
  ],
});
```

> ⚠️ **Anti-pattern (source repo's biggest debt):** four parallel content
> arrays — `content1sp`, `contentMSM`, `contentStudioCO2`, `contentStudioFlizr` —
> each conditionally hidden. Doesn't scale beyond 4 channels. Every frontend
> consumer had to branch on field names. Migrating away required a multi-PR
> plan and a Sanity migration. **Do not invent this pattern. One `content`
> array, always.**

#### Scoping which blocks appear per channel

Default: **all blocks are available on every channel**, your app's
PageBuilder registry decides what to render. This works perfectly when
sites share most blocks.

When a channel needs **distinct** blocks that others must not see, adopt
Sanity workspaces (section 12). **Do not** try to put `hidden` on
`defineArrayMember` — it's explicitly omitted from the Sanity type
(`ArrayOfEntry<T> = Omit<T, "name" | "hidden">`).

### 6.2 Global content (shared across channels)

Cases, services, people, clients, units — content that may appear on more
than one site. Model these as **separate document types** with a `channel`
field that is an **array** (not a single value):

```ts
defineField({
  name: "channel",
  title: "Visible on channels",
  type: "array",
  of: [{ type: "string" }],
  options: { list: [
    { title: "Primary",   value: "primaryWeb" },
    { title: "Secondary", value: "secondaryWeb" },
  ]},
});
```

GROQ then filters with `in`:

```groq
*[_type == "caseStudy" && $channel in channel && language == $language]
```

> 💡 **Pattern that worked well in source repo:** global content has multi-
> channel `array`, per-channel content (pages, menus) has single `string`.

### 6.3 Localization

Use [`@sanity/document-internationalization`](https://www.sanity.io/plugins/document-internationalization):

```ts
// In your Studio config (sanity.config.ts):
import { documentInternationalization } from "@sanity/document-internationalization";

documentInternationalization({
  supportedLanguages: [
    { id: "en", title: "English" },
    { id: "de", title: "German" },
    { id: "pl", title: "Polish" },
  ],
  schemaTypes: ["page", "menu", "caseStudy", "person", "client", "unit", "services"],
  weakReferences: true,
});
```

**Routing:** middleware rewrites locale-free URLs (e.g. `/about`) to the
internal `[locale]` route. Non-default locales get a prefix
(`/de/about`). Old prefixed URLs 301-redirect to the clean form for SEO.

### 6.4 Per-channel `siteSettings` document (optional but recommended)

In addition to `SITE_CONFIGS` in code, model a singleton `siteSettings`
document per channel for things editors should be able to change without a
redeploy:

- Contact email, phone
- Office locations
- Social URLs
- Cookiebot id
- Footer copyright

```ts
defineType({
  name: "siteSettings",
  type: "document",
  fields: [
    defineField({ name: "channel", type: "string", readOnly: true /* singleton-locked */ }),
    defineField({ name: "contactEmail", type: "string" }),
    // ...
  ],
})
```

> 💡 **Improvement:** source repo split site config across env vars, schema
> defaults, and hardcoded strings. Unify: build-time concerns in
> `SITE_CONFIGS` (in code), runtime/editor-changeable in `siteSettings`
> (in Sanity).

### 6.5 Common reusable types

Build these as `objects` in `packages/sanity-schema/src/objects/`:

- `cta` (label, link, variant)
- `link` (internal page reference, external URL, mailto, tel)
- `metadata` (title, description, image, keywords, excludeFromSitemap)
- `cloudinaryAsset` / `cloudinaryImage` (referencing `sanity-plugin-cloudinary`)

---

## 7. Page-builder system from day one

### 7.1 The block contract

Every block schema follows the same shape:

```ts
// packages/sanity-schema/src/blocks/hero.ts
import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";

export default defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({ name: "headline", type: "string" }),
    defineField({ name: "subheadline", type: "text" }),
    defineField({ name: "cta", type: "cta" }),
    defineField({ name: "backgroundImage", type: "cloudinaryImage" }),
  ],
  preview: {
    select: { title: "headline", media: "backgroundImage" },
    prepare: ({ title, media }) => ({
      title: title || "Untitled hero",
      subtitle: "Hero",
      media: media ?? ImageIcon,
    }),
  },
});
```

**Every block has a `preview` with `title`, `subtitle: "<BlockTypeName>"`,
and a media or icon.** Editors browsing a page builder need that visual
anchor.

### 7.2 The per-app registry

```tsx
// apps/primary-web/components/PageBuilder.tsx
import { renderBlocks, defineRegistry } from "@org/pagebuilder-core";
import ErrorBoundary from "./ErrorBoundary";
import Hero from "./pagebuilder/Hero";
import Cta from "./pagebuilder/Cta";
import Gallery from "./pagebuilder/Gallery";
// ... one import per registered block

const registry = defineRegistry({
  hero: Hero,
  cta: Cta,
  gallery: Gallery,
  // ...
});

export default function PageBuilder({ content }: { content: any[] }) {
  return <>{renderBlocks(content, registry, { wrapper: ErrorBoundary })}</>;
}
```

**That's the whole PageBuilder.** No big switch statement. Adding a block
type: import the component, add one line to `registry`.

### 7.3 Block component shape

```tsx
// apps/primary-web/components/pagebuilder/Hero.tsx
import type { HeroBlock } from "@org/sanity-types";

export default function Hero({ data }: { data: HeroBlock }) {
  return (
    <section>
      <h1>{data.headline}</h1>
      {/* render data.subheadline, data.cta, etc. */}
    </section>
  );
}
```

Block components receive **only `data`**. They're pure, presentational
units. Data fetching belongs in the page route, not the block.

### 7.4 Smart blocks (data-fetching blocks)

When a block needs Sanity data of its own (e.g., a `smartCarousel` that
auto-selects cases), wrap it in a server component that fetches and then
renders the dumb component:

```
components/pagebuilder/
├── pg-SmartCarousel.tsx          ← dumb, takes resolved cases as data
└── server/
    └── SmartCarouselBlock.tsx    ← server component, fetches + renders
```

Register the server wrapper in your block registry:

```tsx
import SmartCarouselBlock from "./pagebuilder/server/SmartCarouselBlock";

const registry = defineRegistry({
  smartCarousel: SmartCarouselBlock,
  // ...
});
```

The server wrapper does the fetch, passes resolved data to the dumb
component. Keeps blocks renderable in isolation for tests/visual editing.

---

## 8. Performance patterns

### 8.1 ISR + tag-based revalidation

```tsx
// In every public page route:
export const revalidate = 60;
```

Pages serve from cache for 60s, then revalidate in the background. Sanity
webhook (section 13) does targeted revalidation via cache tags.

### 8.2 React `cache()` for render-time dedup

Already baked into `@org/sanity-queries`. Within one request, repeated calls
to `getPageBySlug(slug, channel, language)` make one Sanity fetch.

### 8.3 Dynamic imports for heavy components

```tsx
import dynamic from "next/dynamic";
const GlobeComponent = dynamic(() => import("./pg-GlobeComponent"), { ssr: true });
```

Use for Three.js, large galleries, anything that adds significant JS.

### 8.4 LCP video pattern

Hero videos kill LCP. The pattern that worked in source repo:

```tsx
// components/ui/DeferredVideo.tsx
"use client";
import { useState, useEffect } from "react";

export default function DeferredVideo({ posterUrl, videoUrl, delayMs = 500 }: Props) {
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), delayMs);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <img src={posterUrl} alt="" /* this is the LCP element */ />
      {showVideo && <video src={videoUrl} autoPlay muted loop playsInline />}
    </>
  );
}
```

Combined with `<link rel="preload" as="image" href={posterUrl}>` in the
page's `<head>` (use Next.js' `<HeroPreloadLinks>` pattern from source
repo) gives near-perfect LCP scores.

### 8.5 Cloudinary URL optimization

Always pipe image and video URLs through `@org/utils/cloudinary`'s
`optimizedImageUrl()` / `optimizedVideoUrl()`. They inject `f_auto,q_auto`
transforms, size constraints, and crop directives.

```tsx
import { optimizedImageUrl } from "@org/utils/cloudinary";

<Image src={optimizedImageUrl(asset.secure_url, { width: 1200 })} alt="..." />
```

### 8.6 Cache tags for surgical revalidation

```ts
// In sanity-queries
const { data } = await sanityFetch({
  query: PAGE_QUERY,
  params: { slug, channel, language },
  tags: ["pages", `page:${slug}`, "global"],
});
```

The Sanity → Vercel webhook then calls `revalidateTag("page:<slug>")` for
the changed document — one specific page, not the whole site.

### 8.7 What NOT to do

- Don't query Sanity from client components. Always from server/RSC.
- Don't `await client.fetch` directly in components — go through the cached
  `@org/sanity-queries` helpers.
- Don't ship Three.js / large libs in shared bundles. Dynamic import + Suspense.
- Don't commit videos to git (use Cloudinary).

---

## 9. Tailwind v4 + motion conventions

### 9.1 Tailwind v4 CSS-first config

```css
/* apps/primary-web/app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-primary: #ff8800;
  --color-brand-secondary: #afff40;
  --font-display: "Your Font Variable", sans-serif;
  --font-body: "Your Body Font", sans-serif;
}

/* Optional: bring back motion-safe escape hatch */
@layer base {
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after { transition-duration: 0.01ms !important; }
  }
}
```

`tailwind.config.ts` is essentially empty in v4 — most config moves to CSS
`@theme`. Each app has its own theme tokens. **No shared Tailwind config
across apps.** Visual deviation is the point.

### 9.2 Motion (Motion One via `motion`)

Use `motion/react` for the standard import:

```tsx
import { motion, AnimatePresence } from "motion/react";
```

> ⚠️ **Anti-pattern:** mixing `framer-motion` and `motion`. They were the
> same library, then forked, then Motion One absorbed framer-motion-react.
> **Pick `motion` only.** Source repo had `import { motion } from "framer-motion"`
> in one file — that worked locally because of node_modules leakage, broke
> on Vercel. Audit imports before pushing.

### 9.3 View transitions

```tsx
// next.config.ts
experimental: { viewTransition: true }
```

Use `next-view-transitions` for `<Link>` replacements that animate
between routes:

```tsx
import { Link } from "next-view-transitions";
```

Combine with a custom `useOptimizedTransitionRouter` hook (in
`@org/utils/hooks`) that wraps `useRouter` with a transition-aware push.

### 9.4 Motion-aware patterns

- `IntersectionObserver` via `useRobustInView` (with RAF fallback for safari).
- Stagger reveals with `motion`'s `staggerChildren` on variants.
- Always provide `prefers-reduced-motion` fallbacks. Animation is opt-in.

---

## 10. Deployment per site (Vercel)

### 10.1 One Vercel project per site

```
Vercel projects:
  acme-primary        → apps/primary-web/
  acme-secondary      → apps/secondary-web/
  ...
```

Each Vercel project's settings:

- **Root Directory**: `apps/<name>/`
- **Install Command**: `pnpm install --frozen-lockfile` (or leave default if you ship `vercel.json`)
- **Build Command**: `pnpm build`
- **Framework**: Next.js (auto-detected)
- **Node version**: 22+

### 10.2 `vercel.json` per app (belt-and-braces)

```jsonc
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "framework": "nextjs"
}
```

> 💡 **Improvement over source repo:** ship `vercel.json` in every app from
> day one. Auto-detection is unreliable when multiple lockfiles or unusual
> repo layouts confuse it.

### 10.3 Environment variables per site

For each Vercel project:

```
NEXT_PUBLIC_CHANNEL=primaryWeb          # the only per-site var that matters
NEXT_PUBLIC_SITE_URL=https://acme.com   # used for canonical URLs / sitemap

NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=...              # only on the one app that hosts /studio

# Optional: webhook secret
SANITY_REVALIDATE_SECRET=...
```

Brand-level config (logos, colors, descriptions) is **not** in env vars —
it's in `SITE_CONFIGS[channel]` in code.

### 10.4 First deploy checklist

```bash
# 1. Push your initial branch
git push -u origin main

# 2. In Vercel, import the repo, create a project pointed at apps/primary-web/
# 3. Set env vars listed above
# 4. Trigger first deploy

# 5. Verify:
#    - /              → homepage renders
#    - /studio        → Studio loads, schema is correct
#    - /sitemap.xml   → only primaryWeb pages
#    - /robots.txt    → 200, references your sitemap
```

> 🧪 **Verify before celebrating:** open the deploy URL in incognito,
> click around five pages, open Studio, edit a draft, save, confirm
> the change reflects (after revalidation).

---

## 11. Adding channel #2 and beyond

```bash
# Clone the first app's directory, give it a new name
cp -r apps/primary-web apps/secondary-web
# Then in apps/secondary-web/:
#   - update package.json "name" to @org/secondary-web
#   - replace primary brand assets, fonts, theme tokens
#   - swap components if you want visual deviation
#   - update sanity.config.ts if Studio differs (usually keep one Studio in the primary)

# Then:
pnpm install
pnpm --filter @org/secondary-web build

# Create a new Vercel project, root at apps/secondary-web/
# Set NEXT_PUBLIC_CHANNEL=secondaryWeb, other env vars
# Wire up the domain
```

Add the channel to `SITE_CONFIGS` in `@org/site-config`:

```ts
export const SITE_CONFIGS: Record<WebsiteChannel, SiteConfig> = {
  primaryWeb: { /* ... */ },
  secondaryWeb: {
    channel: "secondaryWeb",
    name: "Partner Co",
    // ... fill in
  },
};
```

Add the channel to the Sanity schemas' channel option lists:

```ts
// In page.ts, menu.ts, every per-channel document type:
defineField({ name: "channel", type: "string",
  options: { list: ["primaryWeb", "secondaryWeb"] } });
```

> 💡 **Improvement:** centralize the channel list. Source repo had it
> duplicated in `sanity.config.ts`, `structure.ts`, individual schema
> files, and the studio's initial-value templates. **One shared
> `channelOptions.ts` export** in `@org/sanity-schema/src/shared/` that
> every consumer imports.

---

## 12. Sanity workspaces — when and how

### 12.1 When you DON'T need workspaces yet

- 1–4 channels.
- Channels share most or all of their block types.
- One editor team supports all channels.

For these cases, **one Studio with one schema and a desk-structure
section per channel** is fine. That's what source repo runs.

### 12.2 When you DO need workspaces

- ≥5 channels, OR
- A channel has block types others must not see, OR
- You want editor permissions scoped per channel.

### 12.3 The shape of workspace adoption

```ts
// sanity.config.ts (single Studio, multiple workspaces)
import { defineConfig } from "sanity";

export default defineConfig([
  {
    name: "primary",
    title: "Primary",
    basePath: "/studio/primary",
    projectId, dataset,
    schema: {
      types: (prev, ctx) =>
        // primary's blocks + global types
        [...prev, ...primaryBlocks, ...globalTypes, pageType, menuType],
    },
    structure: primaryStructure,
  },
  {
    name: "secondary",
    title: "Secondary",
    basePath: "/studio/secondary",
    projectId, dataset,
    schema: {
      types: (prev, ctx) =>
        [...prev, ...secondaryBlocks, ...globalTypes, pageType, menuType],
    },
    structure: secondaryStructure,
  },
]);
```

Editors visit `/studio` → workspace dropdown → pick their channel →
clean, scoped UI.

**Data shape doesn't change.** This is purely a Studio config change.
The `page.content` field stays one array; each workspace just registers
a different `of:` block set. Migrating from "one workspace" to "many" is
risk-free at the data layer.

---

## 13. Webhooks and revalidation strategy

### 13.1 Webhook per channel (recommended at ≥2 sites)

In Sanity Manage → API → Webhooks, create one webhook **per Vercel
deployment**, each filtered to the channel that deployment serves:

```
Name:    Revalidate Primary
URL:     https://acme.com/api/revalidate
Filter:  channel == "primaryWeb"
Headers: x-sanity-signature: <secret>
```

```
Name:    Revalidate Secondary
URL:     https://partner.com/api/revalidate
Filter:  channel == "secondaryWeb"
```

### 13.2 The revalidate route

```ts
// apps/primary-web/app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { isValidSignature, body } = await parseBody(
    req,
    process.env.SANITY_REVALIDATE_SECRET!
  );
  if (!isValidSignature) return new NextResponse("Invalid signature", { status: 401 });

  // body has _type, _id, slug, channel — use them to revalidate precisely
  const tags = ["sanity"];
  if (body._type === "page" && body.slug) tags.push("pages", `page:${body.slug}`);
  if (body._type === "caseStudy") tags.push("cases");
  if (body._type === "menu") tags.push("global");
  tags.forEach(revalidateTag);

  return NextResponse.json({ revalidated: tags });
}
```

> 💡 **Improvement:** tag-based revalidation, not path-based. Source repo
> mixed both; tags are surgical, paths are easy to over-invalidate.

---

## 14. TypeGen workflow

### 14.1 `sanity-typegen.json` at repo root

```jsonc
{
  "path": "./packages/sanity-queries/src/**/*.ts",
  "schema": "./schema.json",
  "generates": "./packages/sanity-types/src/index.ts"
}
```

### 14.2 `sanity.cli.ts` (in primary app or repo root)

```ts
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});
```

### 14.3 Workflow

```bash
# Whenever schema or GROQ changes:
pnpm typegen

# Under the hood:
#   sanity schema extract → schema.json
#   sanity typegen generate → packages/sanity-types/src/index.ts

# Then commit the regenerated types alongside the schema/query change.
```

Add a CI check: if `schema.json` would change but the committed
`packages/sanity-types/src/index.ts` doesn't reflect it, fail the build.
Prevents the types from drifting silently.

> 💡 **Improvement:** wire TypeGen to the package directly. Source repo's
> output went to `types/sanity.types.ts` and we had to hand-edit when fields
> were added.

---

## 15. Migration discipline

When schema changes require moving data (renaming fields, restructuring
arrays, etc.), use `sanity migration` — never write ad-hoc scripts.

```ts
// migrations/<descriptive-name>/index.ts
import { defineMigration, at, setIfMissing, unset } from "sanity/migrate";

export default defineMigration({
  title: "Describe what this does",
  documentTypes: ["page"],
  filter: '!defined(newField) && defined(oldField)',
  migrate: {
    document(doc) {
      if (!doc.oldField || doc.newField) return; // idempotent
      return [at("newField", setIfMissing(doc.oldField))];
    },
  },
});
```

**Every migration ships with a RUNBOOK.md** in its folder. Document:

1. Prerequisites (e.g., "branch must be merged to main first")
2. Dry-run command
3. Real-run command
4. Verification checklist
5. Rollback procedure (typically a reverse migration that `unset`s the new field)

> ⚠️ **Anti-pattern:** running migrations before the code that reads the new
> field is deployed. Editors lose the ability to update live content during
> the window. Source repo nearly fell into this; the runbook saved us.

---

## 16. Anti-patterns / lessons learned

A consolidated list of things the source repo got wrong (or accidentally
right but at cost), so you don't repeat them.

### Schema
- ❌ **Per-channel content arrays** (`content1sp`, `contentMSM`, ...).
  → ✅ One `content` array, scope blocks at the workspace level.
- ❌ **Per-channel sub-fields on shared documents**
  (`connectedDataCarouselPromo1SP`, `...MSM`, `...StudioCO2`).
  → ✅ One field with channel-aware projection, or generic field with
  `channel`-filtered references.
- ❌ **Storing presentation decisions in schema** (heading levels h1/h2,
  alignment as enum that affects render). Schema models data. Components
  decide rendering.
- ❌ **Boolean fields for state that might grow** (`isPublished: bool`).
  → ✅ String list with options.
- ❌ **Deleting fields with production data** without the deprecation
  pattern (`deprecated + readOnly + hidden when undefined`).

### Repo hygiene
- ❌ Committing both `package-lock.json` and `pnpm-lock.yaml` — Vercel
  picks npm and `workspace:*` blows up.
- ❌ Committing video files to git (~700MB in source repo). Cloudinary.
- ❌ Committing Sanity dataset exports (.ndjson, .tgz). Production data
  in repo history forever.
- ❌ Committing `*.tsbuildinfo`. Already in .gitignore, sometimes still
  gets tracked. `git rm --cached`.

### Dependencies
- ❌ Importing transitive deps without declaring them. Works locally
  via parent-checkout leak, breaks on Vercel. **Audit imports vs.
  declared deps before every deploy.**
- ❌ Mixing `framer-motion` and `motion`. Pick one (`motion`).
- ❌ Workspace packages that don't declare `peerDependencies: { react: "^18 || ^19" }`.
  pnpm may complain.

### Code structure
- ❌ **Building monolithic switch statements for the PageBuilder.** Adopt
  the registry pattern from day one.
- ❌ **Sharing visual components across apps.** Tempting, becomes
  unmaintainable. Per-app components, period.
- ❌ **Hardcoded channel strings** ("1spWeb") scattered across page routes,
  API defaults, structured-data helpers. Channel resolution from one
  helper.

### Resolution surprises
- ❌ **Trusting local builds in a worktree.** If the parent checkout has
  `node_modules`, the worktree silently resolves through it. **Validation
  trick:** before pushing, temporarily rename the parent's `node_modules`
  and rebuild. Vercel-faithful test.

### Deployment
- ❌ **Running Sanity migrations before the new code is deployed.** Editor
  freeze. Always: code → deploy → migrate.
- ❌ **Schema deploys decoupled from code deploys.** Tracker the
  embedded-Studio state in your runbook.

---

## 17. Operating notes for an AI agent

If you (an AI agent) are setting this up for a new project, follow this
order. Verify after each phase.

### Phase A — Bootstrap

1. Confirm preconditions (section 0) with the human. Don't assume.
2. Create the workspace skeleton (section 2). Commit.
3. Set up Sanity project (section 3). Capture project id + dataset name.
4. Build packages in order: `site-config` → `sanity-types` (empty) →
   `sanity-schema` (minimal: just `page` doc) → `sanity-queries` (minimal:
   PAGE_QUERY only) → `pagebuilder-core` → `utils`.
5. After each package, `pnpm install` + `pnpm -r tsc --noEmit`. Commit.

### Phase B — First app, smallest possible site

6. Create `apps/primary-web/` with `app/layout.tsx`, `app/(site)/[locale]/page.tsx`,
   `middleware.ts`, `next.config.ts`. Render a "Hello world" homepage.
7. Wire `SiteWrapper`, channel resolution, GROQ fetch for one page.
8. Add ONE block type (e.g., `hero`) end-to-end: schema → query projection →
   TypeGen → block component → registry → render on homepage.
9. `pnpm build` (root or filtered). Iterate until green.

### Phase C — First deploy

10. Push to GitHub. Create Vercel project. Set env vars (section 10).
11. Deploy. Smoke test the deploy URL.
12. Set up Sanity webhook for revalidation.
13. Verify editing a page in Studio triggers a revalidate and the live
    site updates.

### Phase D — Iterate

14. Add block types one at a time. For each: schema → query → TypeGen →
    component → register → use on a page → verify.
15. Add global content types (cases, services, etc.) when needed.
16. Add internationalization plugin when you launch a second locale.

### Phase E — Second site

17. Lock down `SITE_CONFIGS` and channel option lists (section 11).
18. Spin up `apps/secondary-web/` per section 11.
19. New Vercel project, set `NEXT_PUBLIC_CHANNEL=secondaryWeb`.
20. Configure per-channel Sanity webhook.

### What to ask the human before each phase

- **Phase A**: section 0 answers, organization scope, channel ids.
- **Phase B**: which block types are "core" for the launch?
- **Phase C**: domain ready? Vercel team chosen?
- **Phase D**: design system locked? Cloudinary cloud name?
- **Phase E**: second channel's brand assets and content team identified?

### Heuristics for hard decisions

- "Should this go in shared packages or per-app?" → If it's UI, per-app.
  If it's data shape, contract, or pure logic, shared. **When in doubt,
  per-app first — extract later.**
- "Should I add this as an env var?" → If editors should change it without
  a redeploy, no — model in Sanity. If it's per-deployment build-time
  config, yes.
- "Should I declare this transitive dep?" → If you import it anywhere in
  this package or app, yes. Always.
- "Should we run the migration now?" → Only after the code that reads the
  new field is deployed to production. Always have a rollback migration.
- "Should we use one Sanity workspace or many?" → One until a channel needs
  to hide block types from another. Then many.

### Things this recipe doesn't cover (and you should add as the project grows)

- A/B testing / feature flags (consider GrowthBook or PostHog).
- Search (Algolia, MeiliSearch, or Sanity's embedded search).
- Forms backend if more than the contact form (Tally, Convertkit, etc.).
- Auth (if any app needs gated content).
- Personalization beyond channel/locale.

---

## Appendix — Source repo references

This recipe was distilled from work on the 1SP multi-site monorepo. Key
operational docs in that repo that you may want to mirror in yours:

- `docs/MULTI_SITE.md` — state-of-play / handoff doc
- `migrations/<name>/RUNBOOK.md` — per-migration runbook
- `packages/pagebuilder-core/README.md` — block contract usage

End of recipe.
