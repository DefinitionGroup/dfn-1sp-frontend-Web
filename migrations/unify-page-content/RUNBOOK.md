# Runbook — `unify-page-content` migration

> **Critical**: this migration involves both code deploy AND data writes, and
> the order is **interleaved** — not "code first then data" or "data first
> then code." Read this runbook fully before touching production.

> **Critical (attribute limit)**: Sanity datasets have a hard limit on the
> count of unique `(field path, datatype)` combinations across all documents:
> **2k on Free, 10k on Growth**. The migration temporarily duplicates content
> paths, pushing the dataset over the limit. **Editors cannot write any
> document type while the dataset is over the limit.** Plan a maintenance
> window or use the split-branch path below.

---

## What this migration does

For every `page` document, copies whichever per-channel content array holds
data (`content1sp`, `contentMSM`, `contentStudioCO2`, `contentStudioFlizr`)
into a single unified `content` field. Then unsets the legacy fields. The
result: one `content` field per page, no per-channel arrays.

Code-side, the move requires PRs 2–5 of Phase 1A:
- **PR 2**: GROQ uses `coalesce(content, content1sp, …)` to read either source
- **PR 3**: migration scripts (`run.mjs`, `cleanup-legacy.mjs`)
- **PR 4**: drops the coalesce, reads `content[]` directly
- **PR 5**: removes legacy field definitions from the schema

`origin/main` today has **only PR 1** (the additive schema change adding the
empty `content` field). PRs 2–5 live on `platform/multisite-monorepo`.

---

## Two paths

### Path A — Single merge with a brief editor blackout (faster, simpler)

Merge all of PR 2–5 in one go. Dataset goes over the attribute limit during
the deploy window; editors can't write for ~5–15 min; reads stay live.

### Path B — Split branches for zero editor blackout (more PRs, longer overall)

Ship PR 2 + PR 3 first (re-introduces the GROQ coalesce + migration scripts).
Migrate + cleanup data while the coalesce keeps reads working. Then ship
PR 4 + PR 5. Editor writes blocked only for the ~30 sec between `run.mjs`
and `cleanup-legacy.mjs`.

**Pick Path A** if you can schedule a short maintenance window and want fewer
PR cycles. **Pick Path B** if editor downtime is unacceptable or you'd
rather have each step revertible by code-only rollback.

The pre-flight checks (steps 0–2) are the same for both. The procedure
diverges from step 3.

---

## Pre-flight (both paths)

### 0. Confirm prerequisites

- `platform/multisite-monorepo` is up to date and pushed
- TypeScript passes: `pnpm exec tsc --noEmit`
- FLZR app builds: `pnpm --filter @1sp/flzr-web build`
- You have a `SANITY_API_WRITE_TOKEN` with permission to write `production`
- You have rollback access (Vercel "Redeploy previous" within reach)

### 1. Check the attribute count on `production`

```bash
curl -s -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  "https://wu6i3y0h.api.sanity.io/v1/data/stats/production" \
| python3 -m json.tool | grep -A3 fields
```

Reference values (from the dev-dataset dress rehearsal):

| Stage on dev-dataset    | Attribute count |
|-------------------------|-----------------|
| Before migration        | 1575            |
| After `run.mjs`         | 2352 (over)     |
| After `cleanup-legacy`  | 1453            |

If `production` is materially higher than 1575, the post-migration peak
will be proportionally higher — plan for a longer blackout.

### 2. Export `production`

**Mandatory.** This is the rollback snapshot of last resort.

```bash
mkdir -p migrations/unify-page-content/backups
NEXT_PUBLIC_SANITY_DATASET=production \
  npx sanity@latest dataset export production \
    ./migrations/unify-page-content/backups/production-$(date +%Y%m%d-%H%M).tar.gz
```

Verify the tarball is non-empty and on disk before proceeding.

### 2b. Sanity Studio schema redeploy (after step 2, before step 3 in either path)

The Sanity Studio at `/studio` is bundled inside the 1SP Next.js app. The
schema currently deployed to Sanity reflects whatever was in `origin/main`
at the last build — which has PR 1 but not PRs 2–5. The new schema will
reach Studio automatically when the Vercel deploy lands. **No manual
`sanity deploy` is needed.**

---

## Path A — single merge with brief editor blackout

### A3. Dry-run `run.mjs` against production

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=<token> \
  node migrations/unify-page-content/run.mjs
```

Review the planned changes:
- Roughly 1 page document per `page` in production
- Each one's `source field` matches its `channel`
- No documents already have `content` set (filter excludes them)

If anything looks wrong, stop and investigate.

### A4. Apply `run.mjs` against production

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=<token> \
  node migrations/unify-page-content/run.mjs --apply
```

> 🔴 **At this point production goes over the attribute limit.**
> Editor writes start failing dataset-wide. Read traffic to the live site
> continues to work — the deployed code still reads `content1sp[]` directly
> and that data is intact.

### A5. Merge `platform/multisite-monorepo` → `main`

Open the PR, get it reviewed, merge it. Vercel auto-deploys.

> The deploy takes ~5 min. During this window: editors blocked, reads served
> from the previous Vercel build (still reading `content1sp[]`, which is
> still populated — site renders normally).

### A6. Verify the new build is live

- Vercel deployment status shows "Ready"
- Visit `https://www.1sp.agency` → renders normally
- Spot-check 5 pages — they should render via `content[]` now (which has
  the migrated data)

### A7. Apply `cleanup-legacy.mjs`

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=<token> \
  node migrations/unify-page-content/cleanup-legacy.mjs --apply
```

This unsets the legacy fields. Now safe — the deployed code reads `content[]`.

### A8. Verify

- Re-run the attribute stats curl from step 1 → should be **under 2000**
- Live 1SP site renders fine
- Studio at `/studio` shows only the unified `Content` field
- Editors can write again — test by editing a draft

### A9. Editor comms

> The page editor now has a single **Content** field. The old per-channel
> fields are gone. Edit Content from now on.

---

## Path B — split branches, zero editor blackout

### B3. Create a PR 2+3 branch

Cherry-pick or extract the PR 2 (coalesce + consumer updates) and PR 3
(migration scripts) commits from `platform/multisite-monorepo` onto a new
branch off `main`. The result: `main` reads `content` first, falls back to
legacy fields. Site behavior unchanged.

```bash
git checkout -b phase-1a-prs-2-3 main
git cherry-pick <PR 2 commit(s)>
git cherry-pick <PR 3 commit(s)>
git push origin phase-1a-prs-2-3
```

### B4. Merge the PR 2+3 branch → `main`

Vercel auto-deploys. Live 1SP now reads `content[]` first, falls back to
`content1sp[]`. Both work; site behavior is unchanged because `content[]`
is still empty.

### B5. Dry-run + apply `run.mjs` against production

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=<token> \
  node migrations/unify-page-content/run.mjs --apply
```

> 🟡 Dataset over the attribute limit. Editors blocked. Read traffic still
> works (now reading `content[]` directly via the coalesce — that's the
> migrated data).

### B6. Apply `cleanup-legacy.mjs` IMMEDIATELY

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=<token> \
  node migrations/unify-page-content/cleanup-legacy.mjs --apply
```

Window between B5 and B6: ~30 sec. Editors briefly blocked.

### B7. Merge the PR 4+5 branch → `main`

PR 4 removes the coalesce, PR 5 removes legacy field definitions. Vercel
auto-deploys. Live site continues working (reads `content[]` directly; no
data dependency on legacy fields).

### B8. Verify + comms

Same as A8 + A9.

---

## Rollback

Failure modes and their respective rollback procedures:

### Failed during step 4 / B5 (`run.mjs`)

If `run.mjs` fails partway, it's idempotent — just re-run. If you decide to
abandon the migration entirely BEFORE `cleanup-legacy.mjs` has touched
anything, use `rollback.mjs`:

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=<token> \
  node migrations/unify-page-content/rollback.mjs --apply
```

This unsets `content` on docs where legacy fields are still populated.
Safe because the legacy data is the fallback.

> `rollback.mjs` refuses to touch docs whose only data is in `content[]`
> (i.e. docs where `cleanup-legacy.mjs` has already run). Those require
> dataset import — see below.

### Failed during step 6 / step 7 (`cleanup-legacy.mjs`)

If `cleanup-legacy.mjs` fails partway:
- Some pages have legacy data, some don't
- The deployed code reads `content[]`, which is fully populated → pages render
- Just re-run `cleanup-legacy.mjs --apply` to finish the job

If you decide to abandon AFTER cleanup has run, legacy data is gone.
Recovery requires the dataset export from step 2:

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
  npx sanity@latest dataset import \
  ./migrations/unify-page-content/backups/production-YYYYMMDD-HHMM.tar.gz \
  production --replace
```

> ⚠️ **`--replace` is destructive — it overwrites the entire dataset.**
> Use with extreme caution. If only a few documents are problematic, patch
> them individually instead.

### Code rollback (any time)

Vercel: redeploy the previous build. The previous build reads `content1sp[]`
directly. If `cleanup-legacy.mjs` hasn't run yet, legacy data is intact and
the rollback is clean. If it has run, you need a dataset import in
addition to the code rollback.

---

## Attribute limit (background)

Sanity datasets have a hard limit on the count of unique `(field path,
datatype)` combinations across all documents. The count is based on actual
content, not schema definitions — a path only counts when at least one
document has data at that path. Removing a path requires unsetting that
field on every document that has it.

The migration in this folder duplicates per-channel block paths under both
`content` and the legacy fields. On the project where this RUNBOOK was
written, dev-dataset jumped from 1575 to 2352 attributes during migration
(over the 2000 limit) and dropped to 1453 after cleanup.

While the dataset is over the limit, Sanity rejects all write operations
on all document types with `Total attribute/datatype count exceeds limit`.
Read traffic is unaffected.

To monitor:

```bash
curl -s -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  "https://<projectId>.api.sanity.io/v1/data/stats/<dataset>" \
| python3 -c "import json,sys; d=json.load(sys.stdin); f=d['fields']['count']; \
  print(f'fields: {f[\"value\"]} / {f[\"limit\"]}  ({\"UNDER\" if f[\"value\"] < f[\"limit\"] else \"OVER\"})')"
```

---

## Files in this folder

| File | Purpose |
|---|---|
| `run.mjs` | Migrates legacy → `content` (idempotent, `--apply` to write) |
| `cleanup-legacy.mjs` | Unsets legacy fields after migration (idempotent, `--apply` to write) |
| `rollback.mjs` | Undoes `run.mjs` if cleanup hasn't run yet (idempotent, `--apply` to write) |
| `index.ts` | Sanity-CLI-style migration (kept for reference; CLI is broken locally due to yargs/ESM, use `run.mjs` instead) |
| `RUNBOOK.md` | This file |
| `backups/` | Dataset tarballs (created by step 2, gitignored) |

---

*Last updated: this runbook reflects the state of branch
`platform/multisite-monorepo` with PRs 1–5 of Phase 1A bundled. If the
branch shape changes (PR split, additional PRs), update the path tables
above.*
