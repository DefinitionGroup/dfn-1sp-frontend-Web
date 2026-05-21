# RECIPE V5 — Multi-channel, Multi-language Sanity v5 + Vercel + Next.js Template, with Content Agent translation

> **What's new vs. `RECIPE.md`:**
> 1. Sanity Studio **v5** (auto-updates capability noted but not used — see decision below).
> 2. Latest stable **Next.js** (verify at execution time — see [section 0.1](#01-version-matrix-verify-before-starting)).
> 3. **Sanity Content Agent** as the AI translation tool, editor-driven from the Dashboard.
> 4. **AI Assist** and **experimental Agent Actions** explicitly excluded per the team's choice.
>
> If you've read `RECIPE.md`, much of this is the same. Differences are marked
> **🆕 v5** or **🌐 Translation**. Skim section 0 first regardless — the v5
> decisions ripple through everything.

---

## How to use this doc

This is an agentic recipe — written so an AI agent can follow it
step-by-step, verifying each phase before continuing. Humans can read
linearly. Drop into a fresh repo as `RECIPE.md` (or AGENTS.md / CLAUDE.MD)
and point the agent at it.

Conventions:
- **`@org/*`** — your private npm scope.
- **`primaryWeb`, `secondaryWeb`** — placeholder channel ids.
- **`💡 Improvement`** — choices that differ from the source repo where the
  source got it wrong.
- **`⚠️ Anti-pattern`** — traps to avoid.
- **`🆕 v5`** — Sanity v5-specific guidance.
- **`🌐 Translation`** — AI translation workflow / Content Agent.
- **`🧪 Verify`** — checkpoints.
- **`❓ DECISION REQUIRED`** — places where the recipe needs human input.
- **`⚠️ TRADE-OFF DECISION YOU SIGNED OFF ON`** — places where the team's
  pre-recipe choices have real consequences worth re-confirming on
  execution day.

---

## Table of contents

0. [Preconditions and decisions to make first](#0-preconditions-and-decisions)
1. [Architecture overview](#1-architecture-overview)
2. [Repo skeleton — pnpm workspace monorepo](#2-repo-skeleton)
3. [Sanity v5 project setup](#3-sanity-v5-project-setup)
4. [Shared packages](#4-shared-packages)
5. [The first channel app](#5-first-channel-app)
6. [Content modeling — page, global content, internationalization](#6-content-modeling)
7. [Page-builder system from day one](#7-page-builder-system-from-day-one)
8. [Performance patterns](#8-performance-patterns)
9. [Tailwind v4 + motion conventions](#9-tailwind-v4--motion-conventions)
10. [Deployment per site (Vercel)](#10-deployment-per-site)
11. [Adding channel #2 and beyond](#11-adding-channel-2)
12. [Sanity workspaces — when and how](#12-sanity-workspaces)
13. [Webhooks and revalidation strategy](#13-webhooks-and-revalidation)
14. [TypeGen workflow](#14-typegen-workflow)
15. [Migration discipline](#15-migration-discipline)
16. **🌐 [AI-assisted translation with Sanity Content Agent](#16-ai-assisted-translation-with-sanity-content-agent)**
17. [Anti-patterns / lessons learned](#17-anti-patterns--lessons-learned)
18. [Operating notes for an AI agent following this recipe](#18-operating-notes-for-an-ai-agent)
19. [Appendix — trade-offs you signed off on](#19-appendix--trade-offs-you-signed-off-on)

---

## 0. Preconditions and decisions

### 0.1 Version matrix — verify before starting

> 🧪 **Verify at execution time.** Versions move; the recipe pins approximate
> minimums but a human / agent should confirm what's actually current.

| Component | Minimum (this recipe assumes) | Source/verification |
|---|---|---|
| Node.js | **22 LTS** | Sanity v5 requires Node 20+; pick latest LTS. Run `node --version`. |
| pnpm | **10.x** | Workspaces + strict resolution. Latest stable. |
| Next.js | **15.x (current stable)** | At write time, 15.5.x was current. Check `npm view next dist-tags`. **Sanity Studio v5 is compatible with Next.js 15 with React 19**. |
| React / React DOM | **19.x** | Required by latest Next.js. Sanity v5 supports React 19 (see [Sanity React 19 doc](https://www.sanity.io/docs/help/react-19)). |
| Sanity | **5.1.0+** | 🆕 v5.1.0 is the minimum to connect to Content Agent. Confirm `npm view sanity dist-tags`. |
| `@sanity/client` | **7.x** | Required by Sanity v5. |
| `next-sanity` | **11.x** (latest matching Sanity 5) | Confirm `npm view next-sanity peerDependencies`. |
| Tailwind CSS | **4.x** | CSS-first config. |
| Motion | **12.x** | Use `motion/react` (not `framer-motion`). |

> ❓ **DECISION REQUIRED at execution time:** what's the actually-current
> Next.js minor? If Next 16 has shipped, validate Sanity v5's compatibility
> with it before proceeding.

### 0.2 Project decisions (lock down before any code)

| Decision | Why it matters | Default |
|---|---|---|
| **Channel ids** | Used as the discriminator in every Sanity document. Renaming later is painful. | `<brand>Web` form: `acmeWeb`, `partnerWeb`. |
| **Locales (BCP-47)** | Sanity + Next.js routing key off this. Adding later is fine, renaming is not. | `["en"]` to start. Add more when launching them. |
| **Locale URL strategy** | Default locale unprefixed; others prefixed. | `/about` (en), `/de/about`, `/fr/about`. Middleware handles. |
| **Studio host** | 🆕 v5 supports auto-updates, but ONLY for non-embedded studios. **You've chosen embedded.** | Embedded at `/studio` in the primary Next.js app. Manual `sanity` package bumps when desired. |
| **Dataset strategy** | One shared `production` or per-channel? | One shared dataset. Per-channel only if compliance demands hard isolation. |
| **Image/video hosting** | Sanity assets, Cloudinary, or both? | Cloudinary via `sanity-plugin-cloudinary`. Never commit binaries to git. |
| **Package manager** | One only, no mixing. | pnpm. |
| **AI translation tool** | 🌐 You've chosen **Content Agent** only. AI Assist excluded. Agent Actions excluded as experimental. | Content Agent (Dashboard, conversational). [Section 16](#16-ai-assisted-translation-with-sanity-content-agent). |
| **Translation trigger** | 🌐 Editor-initiated via Content Agent. No auto-draft pipeline (would require experimental APIs). | Editor opens Dashboard → asks Agent to translate selected docs → reviews drafts → publishes. |

### 0.3 Questions to ask the human first

1. npm scope (`@acme`, etc.).
2. First channel id and its production URL.
3. Locales for launch.
4. Sanity project id (from sanity.io/manage) and dataset name.
5. Sanity organization plan tier — **AI credits are billed** and Content Agent needs sufficient quota. Confirm billing is set up before relying on Content Agent in production. See [billing docs](https://www.sanity.io/docs/platform-management/how-ai-credits-work).
6. Cloudinary cloud name.
7. Vercel team / project ownership.
8. **Who has Sanity Dashboard access?** Content Agent lives in the Dashboard, not the Studio. Editors who'll trigger translations must have Dashboard access AND appropriate Sanity permissions.
9. **Source language for translation.** Most teams have one canonical source (usually `en`). All targets translate from it. If you have multiple source languages, translation matrices get messy fast — flag now.
10. **Translation cost guardrails.** Content Agent charges per-document-change. At N pages × M locales × frequent updates, this adds up. Decide on an internal usage policy.

---

## 1. Architecture overview

```
your-repo/
├── apps/
│   ├── primary-web/                    ← Next.js app for channel #1 + embedded Studio at /studio
│   ├── secondary-web/                  ← Next.js app for channel #2
│   └── ...
├── packages/
│   ├── site-config/                    ← @org/site-config
│   ├── sanity-schema/                  ← @org/sanity-schema
│   ├── sanity-queries/                 ← @org/sanity-queries
│   ├── sanity-types/                   ← @org/sanity-types (TypeGen output)
│   ├── pagebuilder-core/               ← @org/pagebuilder-core
│   └── utils/                          ← @org/utils
├── migrations/                         ← Sanity migrations
├── docs/                               ← Architecture, runbooks
├── pnpm-workspace.yaml
├── package.json
├── sanity-typegen.json                 ← TypeGen config
├── sanity.cli.ts                       ← Sanity CLI config
└── tsconfig.base.json
```

### Shared vs. per-app

- **Shared (`packages/*`)**: data shape (schemas, queries, types), pure
  utilities (`cn`, Cloudinary helpers, hooks), block-registry plumbing,
  channel/brand config.
- **Per-app (`apps/*`)**: all visual code — buttons, heroes, navs, footers,
  the PageBuilder registry, layout, fonts, theme, motion timings, API
  routes, sitemaps, robots.

### The core rule

> **Share data and contracts. Don't share UI.**
>
> Every site consumes the same Sanity schema and the same generated types.
> Every site has its own components, free to deviate visually. The block
> contract (props each `_type` receives) is shared; rendering is not.

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
  "engines": { "node": ">=22" },
  "scripts": {
    "dev:primary": "pnpm --filter @org/primary-web dev",
    "build:primary": "pnpm --filter @org/primary-web build",
    "lint": "pnpm -r lint",
    "typegen": "sanity schema extract && sanity typegen generate",
    "schema:deploy": "sanity schema deploy",
    "studio:deploy": "pnpm --filter @org/primary-web exec sanity deploy"
  }
}
```

> 💡 **Improvement over source repo:** declare `packageManager` and
> `engines.node` from day one. Saves Vercel auto-detection from defaulting
> to npm (which breaks `workspace:*` deps).

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

### 2.5 `.gitignore` essentials

```
node_modules/
.next/
.vercel/
.env
.env*.local
*.tsbuildinfo
EXPORT/
schema.json                  # generated by sanity schema extract
.DS_Store
```

> ⚠️ **Anti-pattern:** committing Sanity dataset exports, video binaries,
> mixed lockfiles, or production data dumps. Treat exports like database
> dumps — never in code repos.

### 2.6 Single lockfile rule

```bash
git ls-files | grep -E '(package-lock\.json|yarn\.lock)'
# Expected: nothing
```

---

## 3. Sanity v5 project setup

### 3.1 Create the Sanity project

In [sanity.io/manage](https://www.sanity.io/manage):

1. Create a new project; note the **project id**.
2. Create a `production` dataset (public or private — private requires
   token auth for queries).
3. (Recommended) Create a `development` dataset for safe schema iteration.
4. Under **API → CORS origins**, add `http://localhost:3000` and your
   eventual Vercel URLs.
5. Generate an API token: **API → Tokens → "Editor" role**. Save as
   `SANITY_API_WRITE_TOKEN`.
6. 🆕 v5 **Enable Sanity AI / billing**:
   - Visit **Settings → Plan & billing**. Confirm AI credits are
     provisioned for your plan. Content Agent and other AI features
     deduct credits per change.
   - Set a usage alert if your plan supports it.
7. 🆕 v5 **Confirm Dashboard access for editors** who'll use Content Agent.

### 3.2 `sanity.cli.ts` at repo root

> 🆕 **v5 specifics:** the config now uses a `deployment` object for
> auto-updates (which we're NOT using because embedded Studio), but we
> still declare the schema deploy target for Content Agent.

```ts
// sanity.cli.ts
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  // 🆕 v5: deployment block — auto-updates explicitly OFF for embedded studios
  deployment: {
    autoUpdates: false,
    // appId only needed if using auto-updates; we're not.
  },
});
```

> ⚠️ **TRADE-OFF DECISION YOU SIGNED OFF ON:** embedded Studio means
> manual upgrades when you want to bump the `sanity` package. Schedule a
> "Sanity bump" recurring task — maybe quarterly — so you don't fall too
> far behind. v5 doesn't make you fall behind quickly (auto-updates only
> handle minors/patches anyway), but a pinned major can rot.

### 3.3 `sanity-typegen.json` at repo root

```jsonc
{
  "path": "./packages/sanity-queries/src/**/*.ts",
  "schema": "./schema.json",
  "generates": "./packages/sanity-types/src/index.ts"
}
```

> 💡 **Improvement over source repo:** wire TypeGen to write directly into
> the package from day one. Don't accept the `types/sanity.types.ts`
> default location and then have to manually move it later.

### 3.4 Schema deployment (required for Content Agent)

🆕 v5 + 🌐 Translation: Content Agent and Agent Actions need an
**uploaded schema** to operate against. Even though we're not using Agent
Actions, **Content Agent does require schema deployment** to understand
your content shape.

```bash
# Run after every schema change:
npx sanity schema deploy
```

This is **separate from `sanity deploy`** (which deploys the Studio binary).
Schema deploy pushes the schema as JSON to Sanity's Content Lake for use
by AI tooling.

> ⚠️ **Anti-pattern:** running schema deploy from an inconsistent local
> state. If you have uncommitted schema changes locally, the deployed
> schema diverges from what's in main. Always: commit schema → push →
> `sanity schema deploy` → verify in [sanity.io/manage](https://sanity.io/manage)
> → only then merge code.

### 3.5 Env vars

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=...
SANITY_REVALIDATE_SECRET=...
```

---

## 4. Shared packages

Build the six packages in dependency order. Each one independently green
before moving on.

The structure is identical to v1 of this recipe (see `RECIPE.md` if you
have it). Below: only the deltas relative to v1 are spelled out.

### 4.1 `@org/site-config`

Identical to v1. Defines `SITE_CONFIGS`, `getChannel()`,
`getChannelFromEnv()`, `resolveChannelFromHost()`, `SITE_BRAND`.

Per-channel `SiteConfig` should include 🌐 a `translation` block:

```ts
export type SiteConfig = {
  // ... all fields from v1 ...
  translation: {
    // The canonical source language for this site
    sourceLocale: LocaleCode;
    // Locales that should be auto-suggested for translation
    targetLocales: LocaleCode[];
    // Optional: style guide used when prompting Content Agent for this channel
    styleGuide?: string;
  };
};
```

Example:

```ts
primaryWeb: {
  // ...
  defaultLocale: "en",
  locales: ["en", "de", "fr"],
  translation: {
    sourceLocale: "en",
    targetLocales: ["de", "fr"],
    styleGuide:
      "Acme uses a confident, technical, conversational tone. Avoid jargon. " +
      "Prefer active voice. Keep product names (Acme, AcmeOne, AcmeAir) untranslated.",
  },
},
```

The `styleGuide` is used in editor-facing instructions when they ask
Content Agent to translate (see [section 16](#16-ai-assisted-translation-with-sanity-content-agent)).

### 4.2 `@org/sanity-types`

🆕 v5: generated by TypeGen, written to
`packages/sanity-types/src/index.ts` (per the `sanity-typegen.json` config
from step 3.3). Run `pnpm typegen` whenever schema changes.

### 4.3 `@org/sanity-schema`

Identical to v1 in shape. 🌐 Adjustments for translation:

- Documents that should be translatable get registered with the
  `@sanity/document-internationalization` plugin (in `sanity.config.ts`).
- Every translatable document has a `language` field. Translations are
  **separate documents** (per the plugin's pattern), linked by the
  plugin's reference graph.
- Singletons (e.g., siteSettings) need per-locale variants.

> 💡 **Improvement over source repo:** be deliberate about which docs are
> translatable. Source repo translated cases, services, people. Generally
> that's right — but global content where the canonical source is editor-
> entered (e.g., a person's name) often doesn't need translation per se,
> just a tagline / bio. Mark fields, not whole docs, when you can.

### 4.4 `@org/sanity-queries`

Identical to v1.

### 4.5 `@org/pagebuilder-core`

Identical to v1. Ship from day one.

### 4.6 `@org/utils`

Identical to v1.

---

## 5. The first channel app

Folder structure identical to v1. Critical differences for v5:

### 5.1 `apps/primary-web/package.json` (versions updated)

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

    "next": "^15.5.0",                          // verify latest before pinning
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    "sanity": "^5.1.0",                         // 🆕 v5
    "@sanity/client": "^7.1.0",                 // 🆕 required by v5
    "@sanity/vision": "^5.x",                   // verify
    "next-sanity": "^11.x",                     // confirm v11+ supports Sanity v5
    "@sanity/image-url": "^1.x",
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

> 🧪 **Verify before installing:** run `npm view sanity peerDependencies` and
> `npm view next-sanity peerDependencies` to confirm version compatibility.
> Sanity v5 may have plugin compatibility caveats with older plugins.

### 5.2 `next.config.ts`, `middleware.ts`, page routes

Identical to v1. See `RECIPE.md` sections 5.2–5.4.

The only delta: 🌐 in `app/(site)/[locale]/[slug]/page.tsx`, when a
translation doesn't exist for a requested locale, fall back to the source
locale **with a banner** rather than 404. Pattern:

```tsx
const pageInRequestedLocale = await getPageBySlug(slug, channel, requestedLocale);
const page = pageInRequestedLocale
  ?? await getPageBySlug(slug, channel, sourceLocale);

if (!page) notFound();

return (
  <>
    {!pageInRequestedLocale && <TranslationPendingBanner locale={requestedLocale} />}
    <PageBuilder content={page.content as any[]} />
  </>
);
```

The banner reminds editors that this page hasn't been translated yet and
prompts them to do so (via Content Agent). 🆕 v5 + 🌐.

---

## 6. Content modeling

### 6.1 The page document — one unified `content` array

Identical to v1.

> ⚠️ **Anti-pattern from source repo:** per-channel content arrays. Do not.

### 6.2 Global content (shared across channels)

Identical to v1.

### 6.3 Localization with `@sanity/document-internationalization`

```ts
// In sanity.config.ts:
import { documentInternationalization } from "@sanity/document-internationalization";

plugins: [
  documentInternationalization({
    supportedLanguages: [
      { id: "en", title: "English" },
      { id: "de", title: "German" },
      { id: "fr", title: "French" },
    ],
    schemaTypes: [
      "page",
      "menu",
      "caseStudy",
      "person",
      "client",
      "unit",
      "services",
      "serviceGroup",
      "siteSettings",
    ],
    weakReferences: true,
  }),
  // ... other plugins
],
```

> 🌐 **Translation interplay:** the plugin creates per-locale documents
> linked by an internal reference graph. Content Agent and the legacy
> AI Assist plugin both understand this graph. Editors who ask "translate
> this page to German" get a German document created and linked to the
> English original.

### 6.4 The `language` field on translatable docs

Every translatable document type has a `language` field of type `string`:

```ts
defineField({
  name: "language",
  type: "string",
  readOnly: true,
  hidden: true,
  group: "settings",
  // Plugin populates this on document creation
}),
```

The plugin manages it. Don't expose it to editors.

### 6.5 Singleton patterns with locales (siteSettings, homepage)

🌐 Singletons that have language variants need **one document per locale**,
not one document with locale fields. The plugin's deduplication keeps them
linked. Querying for "the English homepage" uses:

```groq
*[_type == "page" && isHomepage == true && channel == $channel && language == $language][0]
```

### 6.6 Per-channel `siteSettings` document

Same as v1 — runtime-editable settings (contact email, social links, etc.)
live in Sanity. Brand-level (logos, colors, defaults) lives in
`SITE_CONFIGS` in code.

🌐 For multilingual sites, `siteSettings` is per-(channel × locale) — the
internationalization plugin handles the locale variants.

### 6.7 Common reusable types

Identical to v1.

---

## 7. Page-builder system from day one

Identical to v1. Use the registry pattern (`@org/pagebuilder-core`) from
the first block.

---

## 8. Performance patterns

Identical to v1. ISR, `cache()`, `DeferredVideo`, Cloudinary,
tag-based revalidation.

🆕 v5 note: Sanity v5's improved query performance (per release notes —
verify when execution-time-current) may slightly change what's hot path.
Don't optimize for v4 baselines.

---

## 9. Tailwind v4 + motion conventions

Identical to v1.

---

## 10. Deployment per site (Vercel)

Identical to v1, with one addition.

### 10.1 Vercel env vars for translation

In addition to the v1 vars:

```env
NEXT_PUBLIC_DEFAULT_LOCALE=en          # match channel's SITE_CONFIG.translation.sourceLocale
```

This is consumed by the fallback banner in section 5.2 — frontend knows
which locale is "canonical" and can word the banner accordingly ("This
page hasn't been translated to German yet — showing English content.").

---

## 11. Adding channel #2 and beyond

Identical to v1.

---

## 12. Sanity workspaces — when and how

Identical to v1.

🌐 **Workspaces and translation:** Content Agent works per-dataset, not
per-workspace. If you split editorial teams by workspace and they all share
one dataset, the Content Agent UI in the Dashboard is shared. Permission-
scoping is by Sanity role, not workspace.

---

## 13. Webhooks and revalidation strategy

Identical to v1.

🌐 **Translation interplay:** when Content Agent creates a new locale
draft, that's a write event. Sanity webhooks fire. If your revalidate
endpoint is filtered to `published == true`, drafts won't trigger
revalidation (correct behavior — translation drafts shouldn't go live
until editor publishes them).

---

## 14. TypeGen workflow

Identical to v1.

🆕 v5: the TypeGen tooling has been stable since Sanity v3, so v5 doesn't
change the workflow. But the schema deploy step (`sanity schema deploy`)
is now **required** if you use Content Agent, since the agent reads the
deployed schema to understand your content.

Updated `pnpm typegen` flow:

```bash
# Local development
pnpm typegen
# Under the hood:
#   sanity schema extract  → schema.json
#   sanity typegen generate → packages/sanity-types/src/index.ts

# Production (deploy schema to Content Lake)
pnpm schema:deploy        # → sanity schema deploy
```

Run `pnpm schema:deploy` whenever the schema changes meaningfully —
otherwise Content Agent works against a stale snapshot and may suggest
fields that no longer exist (or miss new ones).

---

## 15. Migration discipline

Identical to v1. Use `defineMigration`, document with RUNBOOK.md, dry-run
first.

---

## 16. AI-assisted translation with Sanity Content Agent

🌐 The new chapter. This is where v5 + the team's tooling choice diverge
sharply from the source repo.

### 16.1 What Content Agent is

Content Agent is a conversational AI assistant in the **Sanity Dashboard**
(not in Studio). Editors describe what they need in natural language:

- "Translate the homepage to German and French."
- "Find articles missing meta descriptions."
- "Generate keywords for all uncategorized cases."

The agent:

1. **Plans** the operation against your deployed schema.
2. **Searches** existing content (read-only — no cost beyond the search).
3. **Proposes** changes (creates pending edits, NOT direct mutations).
4. **Awaits human approval** before anything writes to documents.

Changes land as **drafts** (or into a content release, your choice).
Editors review each draft before publishing. **Nothing auto-publishes.**

### 16.2 Why this tool, not the others

Per the team's pre-recipe decisions:

| Tool | Why we picked it / didn't |
|---|---|
| ✅ **Content Agent** | Conversational, bulk-friendly, editor-controlled. Stable. Lives in Dashboard. |
| ❌ AI Assist | Editor-by-editor field-level help. Not the team's preferred workflow. |
| ❌ Agent Actions (Translate) | ⚠️ Experimental API. Not production-stable. Would have enabled auto-draft pipeline; we chose to wait. |

> ⚠️ **TRADE-OFF DECISION YOU SIGNED OFF ON:** no auto-translate-on-publish
> pipeline. Every translation is editor-initiated. This is slower but
> safer and uses only stable APIs.
>
> **Upgrade path when Agent Actions leaves experimental:** a Sanity
> Function watching for `_type == "page" && published == true && language == $sourceLocale`
> publish events, calling `client.agent.action.translate({...})` for each
> target locale, creating drafts. Editors review and publish. Section
> 19.3 has the future-state sketch.

### 16.3 Prerequisites

Before any translation work via Content Agent:

1. **Sanity Studio v5.1.0+** (see [section 0.1](#01-version-matrix-verify-before-starting)).
   `pnpm add sanity@^5.1.0` in the primary app. Run `pnpm dev`, visit
   `/studio` once — this connects your Studio to Content Agent.
2. **Schema deployed** via `npx sanity schema deploy`. Re-run after every
   schema change.
3. **Dashboard access** for editors. Confirm via sanity.io/manage → Members.
4. **AI credits / billing** active. Each change consumes credits. See the
   [AI credits doc](https://www.sanity.io/docs/platform-management/how-ai-credits-work).
5. **Document internationalization plugin** configured for all
   translatable types (see [section 6.3](#63-localization-with-sanitydocument-internationalization)).

### 16.4 Editor workflow — translation

The end-to-end workflow editors follow:

```
1. Editor finishes the source-language (e.g. English) document.
   Publishes it (or saves draft — Content Agent works on either).

2. Editor opens the Sanity Dashboard (not Studio).
   Clicks the ✨ Content Agent icon in the side menu.

3. Editor selects context — usually the document(s) to translate.
   Either:
     a. Navigates to a document in Studio first; context auto-detects.
     b. Asks: "Find pages published in the last week without German translations."

4. Editor prompts the agent:
   "Translate this page to German. Use a confident, technical tone.
    Keep product names (Acme, AcmeOne) untranslated."

5. Agent plans. Editor sees proposed changes in the "Changes" tab:
     - New draft document of type `page`, language=`de`, linked to source
     - All translatable fields populated with German translations

6. Editor reviews each proposed change. Three options:
     a. Confirm all → drafts created
     b. Confirm into a content release → drafts grouped, publish together
     c. Discard

7. Editor opens the German draft in Studio. Polishes (humans are still
   better at nuance). Publishes when ready.
```

### 16.5 Per-channel style guides — keep translations consistent

For brand voice consistency, define a `styleGuide` per channel in
`SITE_CONFIGS` (see [section 4.1](#41-orgsite-config)). Editors are
encouraged to include the style guide in every Content Agent prompt.

> 💡 **Improvement worth doing immediately:** add a per-channel
> "Translation guidelines" document in the Studio (singleton) that
> contains the style guide as readable text. Editors paste it into
> Content Agent prompts. As guidelines evolve, the singleton updates
> without code changes.
>
> Schema sketch:
>
> ```ts
> defineType({
>   name: "translationGuidelines",
>   type: "document",
>   fields: [
>     defineField({ name: "channel", type: "string", readOnly: true /* singleton */ }),
>     defineField({ name: "styleGuide", type: "text", title: "Style guide" }),
>     defineField({ name: "glossary", type: "array", of: [
>       defineArrayMember({ type: "object", fields: [
>         defineField({ name: "term", type: "string" }),
>         defineField({ name: "translations", type: "object", fields: [
>           defineField({ name: "de", type: "string" }),
>           defineField({ name: "fr", type: "string" }),
>         ]}),
>         defineField({ name: "doNotTranslate", type: "boolean" }),
>       ]}),
>     ]}),
>   ],
> })
> ```
>
> Editors paste the styleGuide text into prompts: "Translate using these
> guidelines: [paste]". Content Agent applies them.

### 16.6 Bulk translation pattern

When launching a new locale, editors typically translate everything in
one pass. Workflow:

```
1. Dashboard → Content Agent → "Find all published pages in channel=primaryWeb
   that don't have a German translation yet."
2. Agent returns N results. Editor reviews list, deselects any they don't
   want translated.
3. Editor asks: "Create German translations for these pages, using the
   style guide [paste]. Don't translate product names: Acme, AcmeOne."
4. Agent plans all N translations. Editor sees them in Changes tab.
5. Editor commits to a content release (so all N publish together when
   ready).
6. Editor reviews each, polishes, publishes the release.
```

### 16.7 Translation memory / consistency across documents

🌐 **Important caveat:** Content Agent translates each document
independently. There's no built-in translation memory across documents —
"productTitle" might translate slightly differently across N pages. For
brand consistency:

- Use the **glossary** pattern (section 16.5) — gives editors and the
  agent a per-term canonical translation.
- For high-frequency terms, define them as **`reference` fields** to a
  central glossary document instead of inline strings. The glossary
  document is translated once; references resolve to its locale variant.
- Encourage editors to re-prompt with "Use the same translation for
  'Solutions' as in the German page about cases" when consistency matters.

> ⚠️ **Anti-pattern:** running Content Agent translation across 100+
> documents without a style guide. Translations drift; brand voice
> fractures. Always prompt with the guidelines.

### 16.8 What Content Agent CAN'T do

Per Sanity's docs:

- **No deletion.** Editors must delete drafts manually.
- **No publish.** Final publish is a human step.
- **No rollback within the agent.** Use Studio document history.
- **No Canvas / Media Library.** Studio content only.
- **No filesystem access.** Can read uploaded files (PDF, TXT, etc.) but
  not your local filesystem.

This is good architecture — humans gate every write. Build workflows
around the constraints, not against them.

### 16.9 Cost considerations

Per Sanity's [AI billing docs](https://www.sanity.io/docs/platform-management/how-ai-credits-work):

- **Searches are cheap** (one search costs the same whether it returns
  10 or 10,000 results).
- **Changes are per-document.** Translating 100 pages = 100 changes worth
  of credits.
- **Test before scaling.** Translate 3 documents, review the output,
  then commit to the full batch.

> 💡 **Improvement:** add a usage policy doc at `docs/AI_USAGE.md`. State
> who can trigger bulk operations, what review process applies, and
> monthly credit budget. Source repo had no such doc; teams making bulk
> AI calls can rack up surprise bills.

### 16.10 Studio-side integration (UI affordance for editors)

Even though Content Agent lives in the Dashboard, editors will be in
Studio most of the time. Add a button in your Studio's document toolbar
that links them to Dashboard with the current document as context.

```ts
// In sanity.config.ts:
import { defineConfig } from "sanity";
import { TranslateIcon } from "@sanity/icons";

export default defineConfig({
  // ...
  document: {
    actions: (prev, ctx) => {
      if (["page", "caseStudy"].includes(ctx.schemaType)) {
        return [
          ...prev,
          {
            label: "Translate (via Content Agent)",
            icon: TranslateIcon,
            onHandle: ({ id }) => {
              // Open Dashboard with this document as context
              window.open(
                `https://www.sanity.io/manage/project/${projectId}/dashboard?doc=${id}`,
                "_blank"
              );
            },
          },
        ];
      }
      return prev;
    },
  },
});
```

> ⚠️ **TRADE-OFF DECISION YOU SIGNED OFF ON:** this UI link is the only
> way editors transition Studio → Dashboard. If editors are confused
> about where to go for translation work, your onboarding doc must
> spell it out: "Translation happens in Dashboard, not Studio. Use the
> Translate button on any document."

### 16.11 Monitoring translation quality

🌐 No tool replaces human review. To track quality:

1. **Editor's responsibility**: review every draft before publishing.
2. **Periodic audit**: spot-check published translations quarterly. Use
   Content Agent itself: "Find pages where the German version was last
   edited >3 months before the English version." This identifies stale
   translations.
3. **External review** (if budget allows): native-speaker review of
   high-traffic pages. Content Agent + native review > Content Agent
   alone.

### 16.12 What if Content Agent makes a mistake?

- **Before commit**: editor discards the change. No cost beyond the
  search (changes that don't get committed don't consume credits beyond
  the planning step).
- **After commit (draft created)**: editor edits the draft in Studio.
  No cost.
- **After publish**: edit the published doc in Studio. Document history
  preserves prior versions. Rollback via "Restore from history."

> ⚠️ **Anti-pattern:** auto-publishing Content Agent drafts via Studio
> automation. Don't. Human review at publish is the entire point.

---

## 17. Anti-patterns / lessons learned

### Schema
- ❌ Per-channel content arrays (`content1sp`, `contentMSM`, ...). One
  `content` array, scope at the workspace level when needed.
- ❌ Per-channel sub-fields on shared documents. One field, channel-aware
  projection.
- ❌ Storing presentation in schema (heading levels, alignment-as-enum).
  Schema is data. Components render.
- ❌ Boolean for state that might grow. Use string list with options.
- ❌ Deleting fields with production data without the deprecation pattern.

### Repo hygiene
- ❌ Committing `package-lock.json` and `pnpm-lock.yaml` together.
- ❌ Committing videos to git. Cloudinary.
- ❌ Committing Sanity dataset exports. Production data in history forever.
- ❌ Committing `*.tsbuildinfo`.

### Dependencies
- ❌ Importing transitive deps without declaring them. Pnpm's isolated
  layout enforces this strictly. Works locally via parent-checkout leak,
  breaks on Vercel.
- ❌ Mixing `framer-motion` and `motion`. Pick `motion`.
- ❌ Workspace packages without `peerDependencies: { react: "^18 || ^19" }`.

### Code structure
- ❌ Monolithic switch for PageBuilder. Use the registry from day one.
- ❌ Sharing visual components across apps. Per-app, period.
- ❌ Hardcoded channel strings.

### Resolution surprises
- ❌ Trusting local builds in a worktree without hiding the parent's
  `node_modules`. Source repo built green locally three times in a row,
  failed three times on Vercel for undeclared transitive deps.

### Deployment
- ❌ Running Sanity migrations before code is deployed. Editor freeze.
- ❌ Schema deploys decoupled from code deploys.

### 🆕 v5 / 🌐 Translation specific
- ❌ **Auto-publishing Content Agent drafts.** Human review is the safety
  feature; don't automate around it.
- ❌ **Bulk translating without a style guide.** Voice drifts across documents.
- ❌ **Forgetting to redeploy the schema after schema changes.** Content
  Agent operates on the deployed schema. Stale schema = stale suggestions.
- ❌ **Treating Content Agent as a replacement for human review.** It's
  an accelerant, not a substitute. Native-speaker review of high-traffic
  pages still matters.
- ❌ **Mixing AI Assist and Content Agent without a policy.** Editors
  get confused about which tool to use. Pick one primary (Content Agent
  in this recipe) and stick to it.
- ❌ **Skipping the embedded-vs-standalone Studio decision.** Embedded
  Studios cannot use auto-updates; the choice has lifelong consequences
  for upgrade discipline.

---

## 18. Operating notes for an AI agent

If you (an AI agent) are setting this up for a new project, follow this
order. Verify after each phase.

### Phase A — Bootstrap

1. Confirm preconditions ([section 0.3](#03-questions-to-ask-the-human-first))
   with the human. Don't assume.
2. **🆕 Verify versions** — run `npm view sanity dist-tags`,
   `npm view next dist-tags`. Confirm Sanity v5+, Next.js latest stable,
   Node 22+. Adjust the version pins in package.json templates if needed.
3. Create the workspace skeleton ([section 2](#2-repo-skeleton)). Commit.
4. Set up Sanity project ([section 3](#3-sanity-v5-project-setup)),
   including:
   - 🆕 Confirm AI credits / billing enabled.
   - 🆕 Confirm Dashboard access for editorial team.
5. Build packages in order: `site-config` → `sanity-types` (empty) →
   `sanity-schema` (minimal) → `sanity-queries` (minimal) →
   `pagebuilder-core` → `utils`. After each, `pnpm install` +
   `pnpm -r tsc --noEmit`.

### Phase B — First app, smallest possible site

6. Create `apps/primary-web/` per [section 5](#5-first-channel-app).
   Render "Hello world" homepage.
7. Wire `SiteWrapper`, channel resolution, GROQ fetch for one page.
8. Add ONE block type end-to-end: schema → query projection → TypeGen →
   block component → registry → render on homepage.
9. `pnpm build`. Iterate until green.

### Phase C — Studio + Content Agent setup

10. Configure embedded Studio at `/studio` in primary app.
11. Run `pnpm schema:deploy` — uploads schema to Content Lake.
12. Visit `/studio` once locally to connect Studio v5.1.0+ to Content
    Agent.
13. Confirm with the human: Dashboard side panel shows the ✨ icon, and
    they can chat with the agent against your project.
14. 🌐 Verify Content Agent can find documents by asking it: "How many
    page documents exist in this project?" Expected: a real number.

### Phase D — First deploy

15. Push to GitHub. Create Vercel project per [section 10](#10-deployment-per-site).
16. Set env vars.
17. Deploy. Smoke test the deploy URL.
18. Set up Sanity webhook for revalidation ([section 13](#13-webhooks-and-revalidation)).
19. Editing a page in Studio → revalidate fires → live site updates.

### Phase E — First translation flow

20. Add `documentInternationalization` plugin to Studio.
21. Configure `SITE_CONFIGS[primary].translation` in `@org/site-config`.
22. Add the Studio toolbar action for "Translate via Content Agent"
    ([section 16.10](#1610-studio-side-integration-ui-affordance-for-editors)).
23. Walk the human through one full translation:
    - Create an English page.
    - Click "Translate via Content Agent" → opens Dashboard.
    - Ask agent to translate to a target locale.
    - Review the draft.
    - Publish.
    - Visit the frontend at `/de/...` (or whatever the target locale's
      URL is) and confirm it renders.

### Phase F — Iterate

24. Add block types one at a time. For each: schema → query → TypeGen →
    component → register → use → verify on frontend.
25. Add global content types when needed.
26. Add second locale; repeat phase E for that locale.

### Phase G — Second site

27. Lock down `SITE_CONFIGS` and channel option lists ([section 11](#11-adding-channel-2)).
28. `cp -r apps/primary-web apps/secondary-web`; adjust per section 11.
29. New Vercel project, set `NEXT_PUBLIC_CHANNEL=secondaryWeb`.
30. Per-channel Sanity webhook.

### What to ask the human before each phase

- **Phase A**: section 0.3 answers. Versions. npm scope. Channel ids.
- **Phase B**: which block types are launch-critical?
- **Phase C**: AI credits provisioned? Dashboard access confirmed for
  who specifically?
- **Phase D**: domain ready? Vercel team chosen?
- **Phase E**: target locales for launch? Style guide drafted?
- **Phase F**: design system locked? Cloudinary cloud configured?
- **Phase G**: brand assets for second channel? Editorial team for it?

### Heuristics for hard decisions

- **"Shared or per-app?"** UI is per-app. Data shape, contracts, pure
  logic are shared. When in doubt, per-app first.
- **"Env var or Sanity?"** If editors should change it without redeploy,
  Sanity. If it's build-time per-deployment, env var.
- **"Declare this transitive dep?"** Always yes if you import it.
- **"Run the migration now?"** Only after code that reads the new field
  is deployed.
- **"One workspace or many?"** One until a channel needs blocks hidden
  from others.
- 🌐 **"Have Content Agent translate, or pay a human?"** Content Agent
  for first pass. Human for high-traffic pages, legal copy, anything
  brand-critical. Both: use Content Agent for the draft, then human
  review.
- 🌐 **"Auto-translate on publish?"** Not without taking the experimental-
  API risk. Section 19.3 sketches the upgrade path.

### Things this recipe doesn't cover

- A/B testing / feature flags.
- Search beyond Sanity's embedded.
- Auth.
- Personalization beyond channel/locale.
- Real-time collaborative editing.
- Translation memory across projects.

---

## 19. Appendix — trade-offs you signed off on

### 19.1 Embedded Studio (no auto-updates)

You chose to embed Studio at `/studio` in the primary Next.js app rather
than deploy a standalone Studio with auto-updates.

**What you gave up:** Sanity's auto-updates feature. The `sanity` package
is updated manually via `pnpm upgrade sanity`. New minor/patch versions
don't reach editors until you deploy.

**Mitigation:**
- Schedule a recurring "Sanity bump" task. Quarterly is reasonable.
- Subscribe to the Sanity changelog RSS or join their Slack to catch
  breaking changes early.
- Read release notes before bumping.

**When to reconsider:** if editorial team complains about Studio bugs
that are already fixed upstream, or if you want to leverage newer Sanity
features quickly. The migration path is: extract the Studio into its own
`apps/studio/` directory, deploy via `sanity deploy` to `your.sanity.studio`,
enable `deployment.autoUpdates: true`. The embedded `/studio` can remain
as a Presentation-tool preview entry point even after the move.

### 19.2 Content Agent only (no AI Assist, no Agent Actions)

You chose Content Agent as the sole AI tool. AI Assist and Agent Actions
are excluded.

**What you gave up:**
- **AI Assist's inline ✨ buttons.** Editors who prefer per-field, in-the-
  document assistance won't have that affordance.
- **Agent Actions' programmatic translation.** No automated translation
  pipelines.

**Mitigation:**
- The Studio toolbar action ([section 16.10](#1610-studio-side-integration-ui-affordance-for-editors))
  routes editors to Dashboard when they need translation. Document this
  in onboarding.
- For automation needs, editors can manually trigger Content Agent for
  bulk operations.

**When to reconsider:**
- If editors strongly prefer field-level AI help → add AI Assist; it's
  stable and the two tools coexist.
- If translation volume grows past what editors can manually trigger →
  reconsider Agent Actions when it leaves experimental.

### 19.3 No auto-translate-on-publish pipeline

You chose editor-initiated translation only. No Sanity Function or
webhook auto-creates translation drafts when a source-language doc is
published.

**What you gave up:** time-to-translation latency. With auto-trigger,
German draft exists ~30 seconds after English publish. With editor-
triggered, it exists when an editor decides to do it (minutes, hours,
days).

**Future upgrade path (when Agent Actions Translate leaves experimental):**

```ts
// Sketch — DO NOT USE YET, Agent Actions is experimental
// .sanity/functions/auto-translate.ts
import { defineFunction } from "@sanity/functions";

export default defineFunction({
  trigger: { event: "create" /* or update */, filter: '_type == "page" && language == "en" && _id in path("drafts.**") == false' },
  handler: async (ctx, event) => {
    const targetLocales = ["de", "fr"];
    for (const target of targetLocales) {
      await ctx.client.agent.action.translate({
        schemaId: ctx.schemaId,
        documentId: event.documentId,
        targetDocument: { operation: "create" },
        fromLanguage: { id: "en", title: "English" },
        toLanguage: { id: target, title: targetLanguageName(target) },
        styleGuide: SITE_BRAND.translation.styleGuide,
      });
    }
  },
});
```

This is a future commit. Don't implement until Sanity removes the
experimental marker from Agent Actions Translate. Track:
[Sanity changelog](https://www.sanity.io/docs/changelog).

### 19.4 Version pins not fully locked

This recipe assumes Sanity v5.1.0+ and Next.js 15.x but doesn't fully pin
exact versions — they're moving targets. **Verify at execution time:**

```bash
npm view sanity dist-tags          # confirm v5+ is on latest
npm view next dist-tags            # what's the current Next.js?
npm view @sanity/client dist-tags  # should be v7+
npm view next-sanity dist-tags     # confirm compat with Sanity v5
```

If any of these have moved significantly, re-evaluate the recipe before
proceeding. The architecture remains sound; just confirm package
versions.

---

## Appendix — source repo references

This recipe was distilled from work on a multi-site monorepo (Sanity 4.12,
Next.js 15.5, React 19, Tailwind 4, motion 12). The v5 + Content Agent
guidance was grounded by reading the live Sanity docs at recipe-writing
time. Verify all version-dependent claims at execution time.

Key operational docs in the source repo:
- `docs/MULTI_SITE.md` — state-of-play
- `migrations/<name>/RUNBOOK.md` — per-migration runbook
- `packages/pagebuilder-core/README.md` — block contract usage
- `RECIPE.md` — the v1 recipe (no v5, no Content Agent)

End of recipe.
