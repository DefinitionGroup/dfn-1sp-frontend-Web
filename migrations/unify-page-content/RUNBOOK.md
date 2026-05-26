# Runbook — `unify-page-content` migration

> **Critical**: do not run this migration until all prerequisites are met.
> Running it early won't break anything (legacy fields stay intact), but it
> will create an editor freeze: legacy fields are `readOnly` but main may
> not yet read the new `content` field.

> **Critical (attribute limit)**: this migration is a two-step process
> (`run.mjs` → `cleanup-legacy.mjs`). Skipping the cleanup step pushes the
> dataset over Sanity's hard attribute limit (2k on Free, 10k on Growth)
> and **blocks all writes to any document type** until cleanup runs.
> See [§ Attribute limit](#attribute-limit-context-from-dev-dataset-dress-rehearsal) below.

---

## Prerequisites (in order)

### 1. Merge `platform/multisite-monorepo` to `main`

This is the moment main starts reading `page.content` (via the GROQ
coalesce added in Phase 1A PR 2). Until this happens, the live 1SP site
is rendering from `page.content1sp` directly and ignores any new field.

### 2. Verify Vercel auto-deploy of main is live

- Visit `https://www.1sp.agency` (or your production URL) and confirm
  pages still render normally. They should — the coalesce falls back to
  the legacy field while `content` is empty.
- Check Vercel deployment status is "Ready" on the main branch.

### 3. Deploy the new schema to Sanity Studio

Sanity Studio is bundled inside the app at `/studio`. The schema deploy
happens via `sanity deploy` (or via the Studio host UI).

```bash
# From the repo root, with main checked out:
pnpm install
npx sanity deploy
```

This pushes the schema state (including the new `content` field on
`page` and the `readOnly` flags on `content1sp` / `contentMSM` /
`contentStudioCO2` / `contentStudioFlizr`) to the Sanity backend.

**Verify**: open `/studio`, navigate to any existing 1SP page document.
You should see:
- A new `Content` field at the top of the Content group (empty)
- The legacy `Content 1SP` field below, marked `read only`, still
  showing the original data

If editors are mid-flight on a page edit when this deploys, they may
need to refresh Studio to pick up the new schema.

### 4. Pre-flight check — current attribute count

Confirm the dataset has enough headroom for the migration's temporary
duplication. The migration roughly doubles the per-channel content paths.

```bash
curl -s -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  "https://<projectId>.api.sanity.io/v1/data/stats/<dataset>" \
| python3 -m json.tool | grep -A3 fields
```

Compare against the dress-rehearsal numbers on `dev-dataset`:

| Stage                  | Attribute count |
|------------------------|-----------------|
| Before migration       | 1575            |
| After `run.mjs`        | 2352            |
| After `cleanup-legacy` | 1453            |

If production is significantly higher than dev-dataset was, expect the
post-migration peak to be proportionally higher. **Run the dataset export
in step 5 before touching anything.**

### 5. Export the dataset (mandatory before production runs)

```bash
NEXT_PUBLIC_SANITY_DATASET=production npx sanity dataset export production \
  ./migrations/unify-page-content/backups/production-$(date +%Y%m%d-%H%M).tar.gz
```

This is the rollback path of last resort. Do not skip it on production.

### 6. Dry-run the migration

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=... \
node migrations/unify-page-content/run.mjs
```

(Defaults to dry run.) Review the planned changes:
- Documents that will be modified (should be all `page` documents with
  data in any legacy `content<Channel>` field and no `content` yet)
- Source field per document matches the document's `channel`
- Block counts look sensible

If anything looks wrong, stop and investigate.

### 7. Run the migration for real

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=... \
node migrations/unify-page-content/run.mjs --apply
```

This writes to the production dataset. Each page document gets its
`content` field populated from whichever legacy field corresponds to
its `channel`.

> **At this point the dataset is over the attribute limit.** Editor writes
> to any document type will fail with `Total attribute/datatype count
> exceeds limit`. **Proceed immediately to step 8.**

### 8. Run the cleanup IMMEDIATELY

There is no human review step between 7 and 8. The cleanup unsets the
legacy fields whose data is now safely in `content`, dropping the
attribute count back below the limit.

```bash
# Dry run first (verifies the same 21-ish docs are detected):
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=... \
node migrations/unify-page-content/cleanup-legacy.mjs

# Apply:
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=... \
node migrations/unify-page-content/cleanup-legacy.mjs --apply
```

After this completes, re-run the stats curl from step 4. Attribute count
should be **lower than the original baseline** because the legacy fields'
paths are now empty.

### 9. Verify

- **Stats**: attribute count is under 2000.
- **Frontend**: visit several 1SP pages — homepage, a case study, a
  content page, contact, services. All should render identically to
  before. (Main now reads `content` from the migration. The coalesce
  still works as a fallback even if any individual page failed to migrate.)
- **Studio**: open the same pages. The `Content` field is now populated.
  The legacy `Content 1SP` field is no longer visible (empty + readOnly
  → hidden by Studio).
- **Webhooks**: the migration + cleanup triggered two waves of Sanity
  revalidate webhooks per document. Expect a brief spike of Vercel
  revalidations. Each re-renders the same HTML and is harmless.

### 10. Communicate to editors

Once verified, send a short note to anyone who edits content:

> The page editor now has a single **Content** field. The old per-channel
> fields are no longer present. Edit Content from now on.

---

## Attribute limit (context from dev-dataset dress rehearsal)

Sanity datasets have a hard limit on the count of unique
`(field path, datatype)` combinations across all documents. The limit
depends on your plan: **2k on Free, 10k on Growth**. The count is
based on actual content, not schema definitions — a path only counts
when at least one document has data at that path.

When we ran `run.mjs` on `dev-dataset`, the attribute count jumped
from 1575 to 2352 (the migration duplicates all per-channel block-type
paths under `content`). 2352 is over the 2000 limit, which immediately
froze writes to every document type — not just pages.

Running `cleanup-legacy.mjs` removed the legacy fields' data, dropping
the count to 1453. (Lower than the original 1575 because the cleanup
also removed paths from blocks types that weren't being used under the
unified `content` field.)

**Operational implication**: between step 7 and the completion of step
8, your dataset is over the limit. Editors will see write errors. Plan
a low-traffic window if possible, and have the cleanup command queued
up to run immediately. Typical end-to-end timing for ~20 pages: < 90
seconds.

---

## Rollback

### If something goes wrong AFTER `run.mjs` but BEFORE `cleanup-legacy.mjs`

The legacy data is still intact. Stop, do not run cleanup. To revert:

```bash
NEXT_PUBLIC_SANITY_DATASET=production \
SANITY_API_WRITE_TOKEN=... \
node migrations/unify-page-content/rollback.mjs --apply
```

(Write this script if needed — it just unsets `content` on the affected
docs. The legacy fields are still populated, so GROQ coalesce keeps
rendering pages normally.)

### If something goes wrong AFTER `cleanup-legacy.mjs`

The legacy field data is gone from the dataset. Recovery requires
restoring from the dataset export taken in step 5:

```bash
NEXT_PUBLIC_SANITY_DATASET=production npx sanity dataset import \
  ./migrations/unify-page-content/backups/production-YYYYMMDD-HHMM.tar.gz \
  production --replace
```

> **`--replace` is destructive — it overwrites the entire dataset.**
> Use with extreme caution. If only a few documents are problematic,
> patch them individually instead.

### Code rollback

Revert this branch (or the specific PRs) and redeploy. The GROQ coalesce
gracefully handles documents that have `content` set; pages render
normally. No urgent code revert is needed unless the new code itself
has a regression.

---

## Why this isn't part of the PR auto-merge

Sanity migrations mutate dataset state. They can't be undone by reverting
a code commit (the data is already changed). This makes them a deploy-
time operation, controlled manually by a human, separate from code
merges.

Schema deploys (`sanity deploy`) work the same way: they update Sanity's
record of valid document shapes, which affects how all Studio sessions
behave. They should be coordinated with code deploys, not buried in CI.
