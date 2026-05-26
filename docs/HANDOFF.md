# Handoff — Phase 1A complete in branch, production migration pending

> **TL;DR** — Phase 1A (unify per-channel content arrays into a single `content`
> field) is **code-complete in branch `platform/multisite-monorepo`** and
> **proven against `dev-dataset`**. Production (the `production` Sanity dataset
> and the 1SP live site on `main`) is **completely untouched**. The next
> meaningful work is either (a) launching the FLZR prototype on Vercel against
> `dev-dataset`, or (b) running the production migration so this branch can
> ship to `main`.

---

## Where everything lives

| Thing | Location / value |
|---|---|
| **Working branch** | `platform/multisite-monorepo` |
| **Worktree path** | `/Users/martin/DEV/1SP-dfn-1sp-frontend/.claude/worktrees/serene-wozniak-b511bc` |
| **Remote** | `origin` → `DefinitionGroup/dfn-1sp-frontend-Web` |
| **Sanity project** | `wu6i3y0h` |
| **Sanity datasets** | `production` (untouched), `dev-dataset` (migrated copy of production) |
| **Local 1SP dev** | `pnpm dev` at repo root → port 3000, reads `dev-dataset` (via `.env.local`) |
| **Local FLZR dev** | `pnpm dev` inside `apps/flzr-web/` → port 3001, reads `dev-dataset` + channel `flizrWeb` |
| **1SP production** | `main` branch → Vercel auto-deploys → reads `production` dataset (still old code) |
| **1SP dev deploy** | `dev` branch → Vercel auto-deploys → has PRs 1-3 but still points at `production` dataset |
| **FLZR Vercel project** | **Not created yet** — see `docs/FLZR_DEPLOY.md` once made, or follow the guide in the prior session log |

---

## What is finished (in this branch)

### Phase 0 + Phase 3 — foundation (deployed to `dev`)

- pnpm monorepo with six shared packages under `packages/`:
  - `@1sp/site-config` — channel + brand config, host resolver
  - `@1sp/sanity-schema` — all Sanity schema definitions
  - `@1sp/sanity-queries` — GROQ, cached fetch, client, env
  - `@1sp/sanity-types` — TypeGen output + menu types
  - `@1sp/pagebuilder-core` — `BlockRegistry` + `renderBlocks` plumbing
  - `@1sp/utils` — `cn()`, Cloudinary helpers, hooks
- Channel hardcoding eliminated; resolved via `getChannel()` / `getChannelFromEnv()`
- FLZR app scaffolded at `apps/flzr-web/` (no Vercel deploy yet)
- Three Vercel CI build failures fixed (npm vs pnpm, transitive dep declarations, framer-motion → motion/react)

### Phase 1A — unified content field (committed to `dev` for PRs 1-3; PRs 4-5 still uncommitted in worktree)

- **PR 1 (in `dev`)** — schema: new unified `content` field + legacy fields marked `readOnly + deprecated`
- **PR 2 (in `dev`)** — GROQ: `coalesce(content, content1sp, contentStudioFlizr, contentMSM, contentStudioCO2)`; ~20 consumers updated to read `page.content`
- **PR 3 (in `dev`)** — migration script: `migrations/unify-page-content/run.mjs` (and the `index.ts` for the official Sanity CLI, which doesn't work locally due to a yargs ESM bug)
- **PR 4 (uncommitted in worktree)** — removed coalesce + duplicated projections from `groq.ts` (−919 lines). Reads `content[]` directly.
- **PR 5 (uncommitted in worktree)** — removed legacy field definitions from `sanity-schema/src/page.ts` (−118 lines) and `sanity-types/src/index.ts` (−6 lines). Studio no longer shows the legacy fields.

### Dev-dataset migration — executed and verified

- `dev-dataset` was created as a copy of `production` (manually by user via Sanity dashboard)
- `run.mjs --apply` ran: 21 pages migrated (15 × `1spWeb` from `content1sp`, 6 × `flizrWeb` from `contentStudioFlizr`)
- `cleanup-legacy.mjs --apply` ran: 21 pages unset their legacy fields
- Sanity attribute count: **1453 / 2000** (was 2352 between migration and cleanup — over the 2000 limit, fixed by cleanup)
- Idempotency confirmed: re-running `run.mjs` finds 0 work

### Local environment files

- Root `.env`, `.env.local` → `NEXT_PUBLIC_SANITY_DATASET=dev-dataset`
- `apps/flzr-web/.env`, `apps/flzr-web/.env.local` → `dev-dataset` + `NEXT_PUBLIC_CHANNEL=flizrWeb`

### Docs added

- `docs/MULTI_SITE.md` — operational handoff for the multi-site platform
- `docs/RECIPE.md` — generic blueprint for new multi-site projects
- `migrations/unify-page-content/RUNBOOK.md` — production migration procedure with attribute-limit context
- `apps/flzr-web/vercel.json` (uncommitted) — monorepo build config for FLZR Vercel project

---

## What is NOT finished

### Immediate (sitting on the desk)

1. **Commit and push the PR 4+5 work and `apps/flzr-web/vercel.json`.**
   The worktree has these unstaged. Until pushed, Vercel cannot see them:
   ```
    M packages/sanity-queries/src/groq.ts        (PR 4 — −919 lines)
    M packages/sanity-schema/src/page.ts          (PR 5 — −118 lines)
    M packages/sanity-types/src/index.ts          (PR 5 — −6 lines)
    M apps/flzr-web/app/globals.css               (lint/editor — review before committing)
    M apps/flzr-web/components/FlzrSiteWrapper.tsx (lint/editor — review before committing)
    M migrations/unify-page-content/cleanup-legacy.mjs (typo fix `brings®` → `brings`)
   ?? apps/flzr-web/vercel.json                   (new — required for FLZR Vercel deploy)
   ```

2. **Launch FLZR prototype on Vercel** (user said yes to this).
   Follow the step-by-step in the prior session message ("FLZR Prototype Deployment Guide") or summarize:
   - New Vercel project, import same Git repo
   - Root Directory = `apps/flzr-web`
   - Production Branch = `platform/multisite-monorepo`
   - Enable "Include source files outside of the Root Directory"
   - Env vars: `NEXT_PUBLIC_CHANNEL=flizrWeb` + `NEXT_PUBLIC_SANITY_DATASET=dev-dataset` + Sanity tokens + Cloudinary
   - Known caveat: hero video will 404 (MP4s excluded from repo, migrate to Cloudinary later)

### Gated path to production (must run in this order)

3. **Export `production` dataset** as the rollback snapshot:
   ```bash
   npx sanity@latest dataset export production \
     ./migrations/unify-page-content/backups/production-$(date +%Y%m%d-%H%M).tar.gz
   ```

4. **Run the migration on production** — back-to-back, no human pause between:
   ```bash
   NEXT_PUBLIC_SANITY_DATASET=production \
   SANITY_API_WRITE_TOKEN=<see .env.local> \
     node migrations/unify-page-content/run.mjs --apply

   NEXT_PUBLIC_SANITY_DATASET=production \
   SANITY_API_WRITE_TOKEN=<see .env.local> \
     node migrations/unify-page-content/cleanup-legacy.mjs --apply
   ```
   The dataset crosses the 2000-attribute limit briefly between these two commands. **Editors cannot write anything during that window.** Production sits at 1575 attributes today; expect a peak of ~2350 then back down to ~1450.

5. **Smoke-test `production` dataset**:
   - `curl .../v1/data/stats/production` → confirm under 2000
   - Visit live 1SP site → pages render (still via coalesce in deployed code)

6. **Merge `platform/multisite-monorepo` → `dev` → `main`**:
   - PR `platform/multisite-monorepo` → `dev` (or just push if you're on dev directly)
   - Wait/smoke-test dev Vercel deploy
   - PR `dev` → `main`
   - Merge → Vercel auto-deploys 1SP production with PRs 1-5

7. **Editor comms**: tell editors the legacy `Content 1SP` field is gone, edit the unified `Content` field from now on.

### Queued tech debt (none blocking)

| Item | Notes |
|---|---|
| **Phase 1B — unify `caseStudy.connectedDataCarouselPromo*`** | Same pattern as Phase 1A. Smaller surface area. |
| **TypeGen config** | Output still goes to old `types/sanity.types.ts`. Should write to `packages/sanity-types/src/index.ts`. Hand-edits get overwritten on next regen. |
| **PageBuilder → registry pattern** | Both `components/PageBuilder.tsx` (1SP) and `apps/flzr-web/components/FlzrPageBuilder.tsx` are still ~525-line static switches. Migrate to `@1sp/pagebuilder-core`'s `renderBlocks` when next touched. |
| **FLZR videos → Cloudinary** | `/video/atf.mp4` referenced in 3 FLZR components but the MP4s aren't in the repo. Hero video stays blank on the prototype. |
| **FLZR cross-app imports** | `apps/flzr-web/app/layout.tsx` and a few others still reach into `@/components/CookiebotBanner`, `@/components/GoogleAnalyticsConsent`, `@/components/StegaErrorHandler`, etc. Should become FLZR-owned components. Build works due to `experimental.externalDir: true` but it's brittle. |
| **Per-channel Sanity webhooks** | At ≥3 sites, set up filtered webhooks. Currently all deployments revalidate on any content change — wasteful but harmless. |
| **Sanity workspaces for per-channel block whitelisting** | Only needed when a channel introduces blocks others shouldn't see. Not yet. |

---

## Critical context (things you'd miss if you only read code)

### The attribute-limit landmine

Sanity datasets have a hard limit on unique `(field path, datatype)` combinations:
**2k on Free, 10k on Growth**. The migration **doubles content paths** (puts
the same data under `content` while legacy paths still exist), which on this
project pushes past the limit. **Cleanup must run immediately after migration,
with no human review between them.** This was discovered on `dev-dataset` and
is now documented in `migrations/unify-page-content/RUNBOOK.md` §
"Attribute limit."

### The Sanity CLI yargs bug

`pnpm sanity migration run …` and `npx sanity migration …` both fail with
`require is not defined in ES module scope` because `yargs@17.7.2` (a
transitive dep of Sanity) has `"type": "module"` but ships CJS code in
`yargs/yargs`. **Workaround: use the standalone `node migrations/.../run.mjs`
scripts.** Don't waste time trying to get the official CLI to work.

### `hidden` is not supported on `defineArrayMember`

Sanity's type def `ArrayOfEntry<T> = Omit<T, 'name' | 'hidden'>` explicitly
removes `hidden`. So per-channel block whitelisting on the unified `content`
array can't use `hidden` predicates. The escape hatch is Sanity workspaces:
`defineConfig([workspaceA, workspaceB])` with each registering its own block
subset. Queued for when actually needed.

### pnpm isolation reveals dep declarations

Local builds resolved transitive deps via the parent repo's `node_modules`
(Node walks upward) — masking package.json omissions that **only fail on
Vercel's clean checkout**. Three CI failures hit this. **When adding a new
import inside `packages/*`, declare it in *that package's* `package.json`,
not just the root.** Otherwise Vercel will catch it for you.

### Env vars do not propagate across the monorepo

`apps/flzr-web/` has its own `.env.local` separate from root. **Editing root
`.env.local` does NOT affect the FLZR app.** Both files were updated to
point at `dev-dataset` for this prototyping phase. When the FLZR Vercel
project is created, set the env vars there too.

### Branch + Vercel state

| Branch | Vercel deploys to | Reads dataset |
|---|---|---|
| `main` | 1SP production | `production` |
| `dev` | 1SP dev | `production` |
| `platform/multisite-monorepo` | (no auto-deploy yet) | — |

Once the FLZR Vercel project is created and tracks
`platform/multisite-monorepo`, that branch will auto-deploy whenever pushed.
Be aware: the 1SP dev/prod Vercel projects are also watching the repo. They
won't deploy from `platform/multisite-monorepo` (they only watch `dev`/`main`),
but if you accidentally merge into `dev` without intending to, it will go live.

---

## How to resume work

### Tomorrow (or whenever)

```bash
# 1. Activate the worktree
cd /Users/martin/DEV/1SP-dfn-1sp-frontend/.claude/worktrees/serene-wozniak-b511bc

# 2. Pull latest (in case dev has moved)
git fetch origin

# 3. Read this file top to bottom
cat docs/HANDOFF.md

# 4. Confirm dataset state
curl -s -H "Authorization: Bearer $SANITY_TOKEN" \
  "https://wu6i3y0h.api.sanity.io/v1/data/stats/dev-dataset" | python3 -m json.tool

# 5. Start dev
pnpm dev                              # 1SP on :3000
cd apps/flzr-web && pnpm dev          # FLZR on :3001 (separate terminal)

# 6. Sanity Studio
open http://localhost:3000/studio
```

### To pick up where I left off (FLZR prototype deploy)

1. Read the "FLZR Prototype Deployment Guide" in the prior session message
2. Commit and push the staged work first (PR 4 + PR 5 + `apps/flzr-web/vercel.json`)
3. Then create the Vercel project per the guide

### To pick up production migration

1. Read `migrations/unify-page-content/RUNBOOK.md` end to end
2. Run the dataset export (step 5 of the runbook)
3. Run `run.mjs` + `cleanup-legacy.mjs` against `production` back-to-back
4. Smoke-test
5. Then open `dev` → `main` PR

---

## Files to read first if you have 15 minutes

1. **This file** (`docs/HANDOFF.md`) — orientation
2. **`docs/MULTI_SITE.md`** — operational state of the multi-site platform
3. **`migrations/unify-page-content/RUNBOOK.md`** — production migration steps with all the gotchas
4. **`docs/RECIPE.md`** — the generic playbook (useful if applying these patterns elsewhere)

## Files to read first if you have an hour

5. **`packages/site-config/src/index.ts`** — how channel resolution works
6. **`packages/sanity-queries/src/groq.ts`** — the now-simplified queries (PRs 4+5 applied)
7. **`migrations/unify-page-content/run.mjs`** + **`cleanup-legacy.mjs`** — the actual migration logic

---

*This handoff document is a snapshot. Update it if the state diverges
materially. The companion docs (`MULTI_SITE.md`, `RECIPE.md`, `RUNBOOK.md`)
are the source of truth for their respective domains.*
