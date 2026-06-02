# Multi-site platform — state of play

This doc is the **operational handoff** for the multi-site work: where things
are deployed, what's done, what's pending, and how to pick up.

For the broader roadmap and conceptual rationale, see
[`multisite-platform-plan.md`](./multisite-platform-plan.md).

For the Sanity migration that completes Phase 1A, see
[`../migrations/unify-page-content/RUNBOOK.md`](../migrations/unify-page-content/RUNBOOK.md).

---

## Current state (last update: dev deploy via PR #139)

| Surface | State |
|---|---|
| `main` branch | Old code — unaffected by this work. |
| `dev` branch | New code merged via PR #139. Vercel deployed dev successfully. |
| 1SP production deploy | Still on old `main` code. No visual change planned. |
| 1SP dev deploy | New code. Reads `page.content` via GROQ coalesce → falls back to `content1sp` → renders identically. |
| FLZR (`apps/flzr-web/`) | Code merged. Builds locally and on Vercel preview. **No production deploy** — no Vercel project pointed at it yet. |
| Sanity Studio | Embedded in 1SP app. dev's Studio has the new schema (Content + readOnly legacy). Production Studio still has the old schema. |
| Sanity dataset | **Untouched.** Migration not run. `page.content` is empty on every document. |

Everything done so far is invisible to the live 1SP site. The Sanity migration
is the only step that mutates dataset state, and it has not run yet.

---

## Phase status

| Phase | What | Status |
|---|---|---|
| **0** | Channel + brand env config, host resolver, slug filtering | ✅ Done |
| **1A** | Unify per-channel content arrays into one `content` field | ⚠️ Code shipped on dev. Migration not run. |
| **1B** | Same treatment for `caseStudy.connectedDataCarouselPromo*` fields | ❌ Not started |
| **2** | PageBuilder → registry pattern (`@1sp/pagebuilder-core`) | ⚠️ Plumbing exists, no PageBuilder migrated yet |
| **3** | Monorepo with shared packages | ✅ Done — six `@1sp/*` packages |
| **4** | Spin up FLZR as site #2 | ⚠️ Code merged, no Vercel project yet |
| **5** | Webhook fan-out + per-site ops | ❌ Not started |
| **6** | Add MSM, Studio CO2, other sites | ❌ Not started (deliberately — Phase 4 must prove first) |

---

## Immediate next steps (in order)

1. **Smoke-test the dev deploy.** Visit the dev URL and confirm:
   - Homepage renders, hero plays
   - A case study page renders
   - `/contact`, `/services`, a dynamic slug page render
   - `/studio` loads; pages show new empty `Content` field + legacy
     `Content 1SP (legacy — read only)` populated and read-only
   - `/sitemap.xml` is 1SP-only

2. **Wait 24–48h** on dev to let ISR revalidate and surface any latent issues.

3. **Open PR `dev` → `main`.** Diff is the same 14 commits as PR #139. No new code.

4. **Merge → Vercel auto-deploys main → 1SP production.** Smoke-test the live
   site immediately (same checklist). Vercel rollback is one click if needed.

5. **Run the Sanity migration** per
   [`migrations/unify-page-content/RUNBOOK.md`](../migrations/unify-page-content/RUNBOOK.md).
   This is the only irreversible step. Has a documented rollback path.

6. **Communicate to editors**: from now on, edit the **Content** field. The old
   per-channel fields are read-only and will be removed in a later release.

---

## Pending follow-ups (queued, not blocking the above)

### Tracked in the task list

See current tasks via `TaskList` in tooling. Each has a description and
dependencies.

### Larger items not yet broken into tasks

- **FLZR launch readiness**
  - Create a Vercel project pointing at `apps/flzr-web/`.
  - Set env vars: `NEXT_PUBLIC_CHANNEL=flizrWeb`, all `NEXT_PUBLIC_SANITY_*`.
  - Migrate FLZR's video assets to Cloudinary (the MP4s under
    `apps/flzr-web/public/video/` were deliberately excluded from the PR;
    referenced paths will 404 until videos move).
  - Wire up the FLZR domain.
  - Remove FLZR's cross-app imports of `@/components/CookiebotBanner`,
    `@/components/GoogleAnalyticsConsent`, `@/components/CookieDeclaration` —
    these should be FLZR's own components (per-app visual code rule).

- **TypeGen config**
  - The schema → types pipeline still writes to the old `types/sanity.types.ts`
    path. Add a `sanity-typegen.json` config that writes to
    `packages/sanity-types/src/index.ts`. Add a `pnpm typegen` script. Until
    this is done, manual edits to the generated file (see PR 2 of Phase 1A)
    will be overwritten on the next regen.

- **PageBuilder migration to `renderBlocks`**
  - Both `components/PageBuilder.tsx` and `apps/flzr-web/components/FlzrPageBuilder.tsx`
    are still ~525-line static switches. Migrate to
    `@1sp/pagebuilder-core`'s `renderBlocks(content, registry)` when each is
    next touched. The contract is documented in
    `packages/pagebuilder-core/README.md`.

- **Sanity workspaces (Phase 2-ish, when needed)**
  - Currently 1SP and FLZR share all 29 page-builder blocks and MSM/StudioCO2
    have no production content, so per-channel block whitelisting isn't
    needed yet. When a channel introduces blocks that genuinely shouldn't
    appear elsewhere, the right answer is `defineConfig([...])` with one
    workspace per channel, each registering its own block subset. See the
    discussion in `multisite-platform-plan.md`.

- **Webhook fan-out (Phase 5)**
  - Single Sanity → Vercel webhook today. At ≥3 sites, configure per-channel
    Sanity webhooks (filtered by `channel == "X"`) pointing at each
    deployment's `/api/revalidate`. Until then, all deployments revalidate on
    any content change — wasteful but harmless.

---

## The contract (operational reference)

### Channels

Known channel values (defined in
[`packages/site-config/src/index.ts`](../packages/site-config/src/index.ts)
as `WebsiteChannel`):

| Channel | Brand |
|---|---|
| `1spWeb` | 1SP Agency |
| `msmWeb` | MSM |
| `studioco2Web` | Studio CO2 |
| `flizrWeb` | FLZR |

Add new channels in `SITE_CONFIGS` first — TypeScript everywhere else keys
off this list.

### Resolving the active channel

Resolution order:

1. `NEXT_PUBLIC_CHANNEL` env var — primary, pins a deployment to a channel.
2. `channel` cookie — set by middleware via host mapping, or manually for dev.
3. `DEFAULT_CHANNEL` (`1spWeb`) — fallback.

### Which helper to use

| Context | Helper | Module |
|---|---|---|
| Server component, route handler | `await getChannel()` | `@1sp/site-config/server` |
| `generateStaticParams`, build-time, edge, middleware | `getChannelFromEnv()` | `@1sp/site-config` |
| Middleware host-based mapping | `resolveChannelFromHost(host)` | `@1sp/site-config` |

**Never** read `process.env.NEXT_PUBLIC_CHANNEL` directly in feature code.

### Per-deployment env vars

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_CHANNEL` | Pin deployment to a channel | unset → falls through to cookie / `1spWeb` |
| `NEXT_PUBLIC_HOST_CHANNEL_MAP` | Comma-separated `host:channel` for multi-host deployments | empty (middleware = pass-through) |
| Sanity env vars (`NEXT_PUBLIC_SANITY_*`) | Standard Sanity wiring | configured per Vercel project |

Brand-level configuration (name, SEO defaults, logo paths, GA ID, etc.) lives
in `SITE_CONFIGS[channel]` in
[`packages/site-config/src/index.ts`](../packages/site-config/src/index.ts) —
**not** in env vars. To change brand metadata for an existing site, edit that
file. To add a new site, add a new entry to `SITE_CONFIGS`.

### Shared packages

```
packages/
├── site-config/         @1sp/site-config         channel + brand config + middleware host resolver
├── sanity-types/        @1sp/sanity-types        TypeGen output + menu types
├── sanity-schema/       @1sp/sanity-schema       all defineType/defineField schemas
├── sanity-queries/      @1sp/sanity-queries      GROQ + cached fetch + client + env
├── pagebuilder-core/    @1sp/pagebuilder-core    BlockRegistry type + renderBlocks plumbing
└── utils/               @1sp/utils               cn, Cloudinary helpers, hooks
```

Rules:
- **Share data and contracts. Don't share UI.**
- Schema, queries, types, pure utils → packages.
- Buttons, Heroes, Navs, PageBuilders, anything visual → per-app.
- Each app declares its own dependencies (don't rely on root hoisting).
- When a package adds a new import, declare it in that package's
  `package.json`. Pnpm's isolated layout will catch the omission at build time.

### Rules for new code

1. Never hardcode a channel string. Use `getChannel()` / `getChannelFromEnv()`.
2. Never hardcode brand strings. Use `SITE_BRAND` (active deployment) or
   `getSiteConfig(channel)` (per-channel lookup).
3. Filter Sanity queries by channel using the existing `$channel` parameter
   pattern.
4. `generateStaticParams` must call `getChannelFromEnv()` so each site only
   pre-renders its own pages.
5. API routes that accept a `channel` parameter should default to
   `getChannelFromEnv()`, not a literal.
6. Visual components are per-app. Data + utilities can be shared via packages.

---

## Known debt (intentional)

- **Per-channel content arrays on `page.ts`** still exist alongside the new
  unified `content` field. Removed in Phase 1A PR 4/PR 5 after migration runs.
- **GROQ projection duplication.** The deep content body is duplicated for
  `content` and `content1sp` projections in both `PAGE_QUERY` and
  `HOME_PAGE_QUERY`. Cleanup-via-shared-constant is queued for after the
  legacy fields are removed.
- **Inline `optimizedImageUrl` copy** in `packages/sanity-queries/src/image.ts`
  duplicates the canonical implementation in `@1sp/utils/cloudinary`. Was
  necessary to avoid a circular dep during package extraction; cleanup is
  trivial when convenient.
- **`apps/flzr-web` cross-app reach** into root `@/components/*` for a few
  cookie/analytics components. Should become FLZR's own.
- **`docs/MULTI_SITE.md`** (this file) and `docs/multisite-platform-plan.md`
  cover overlapping ground. Both exist intentionally: this one is
  operational state, the other is forward-looking vision. Merge them only if
  one becomes clearly stale.

---

## How to pick up later

1. Read this file top to bottom.
2. Read `migrations/unify-page-content/RUNBOOK.md` if you're about to run the
   migration.
3. Read `multisite-platform-plan.md` if you're planning the next major step.
4. `TaskList` in tooling shows the current task graph with dependencies.
5. The branch `platform/multisite-monorepo` on origin holds all the work
   that's been merged to dev. The PR history is preserved.
