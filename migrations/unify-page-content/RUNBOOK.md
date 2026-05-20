# Runbook — `unify-page-content` migration

> **Critical**: do not run this migration until all prerequisites are met.
> Running it early won't break anything (legacy fields stay intact), but it
> will create an editor freeze: legacy fields are `readOnly` but main may
> not yet read the new `content` field.

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

### 4. Dry-run the migration

```bash
# From the repo root:
npx sanity migration run unify-page-content
```

By default this is a dry-run. Review the planned changes:
- Documents that will be modified (should be all `page` documents with
  data in any legacy `content<Channel>` field)
- The shape of the writes (`at("content", setIfMissing(<legacy-data>))`)
- No documents should already have `content` set (filter excludes them)

If anything looks wrong, stop and investigate.

### 5. Run the migration for real

```bash
npx sanity migration run unify-page-content --no-dry-run
```

This writes to the production dataset. Each page document gets its
`content` field populated from whichever legacy field corresponds to
its `channel`.

### 6. Verify

- **Frontend**: visit several 1SP pages — homepage, a case study, a
  content page, contact, services. All should render identically to
  before. (Main now reads `content` from the migration, via the coalesce
  this still works even if any individual page failed to migrate.)
- **Studio**: open the same pages. The `Content` field is now populated.
  The legacy `Content 1SP` field still has its data but is read-only.
- **Webhooks**: the migration triggers Sanity's revalidate webhook
  per-document. Expect a brief spike of Vercel revalidations. Each
  re-renders the same HTML and is harmless.

### 7. Communicate to editors

Once verified, send a short note to anyone who edits content:

> The page editor now has a single **Content** field. The old per-channel
> fields (Content 1SP, etc.) are read-only and will be removed in a
> later release. Edit Content from now on.

## Rollback

If the migration produces something unexpected, both data and code are
safe to revert:

### Data rollback

Write a reverse migration that unsets `content` on the affected pages:

```ts
// migrations/rollback-unify-page-content/index.ts
import { defineMigration, at, unset } from "sanity/migrate";

export default defineMigration({
  title: "Rollback Phase 1A migration",
  documentTypes: ["page"],
  filter: 'defined(content)',
  migrate: {
    document() {
      return at("content", unset());
    },
  },
});
```

Then `npx sanity migration run rollback-unify-page-content --no-dry-run`.

The legacy fields are untouched, so the live site keeps rendering from
them via the GROQ coalesce.

### Code rollback

Revert this branch (or the specific PRs) and redeploy. The legacy fields
are still in the schema and still queried, so 1SP renders normally.

## Why the legacy fields are still in the schema

Two reasons:

1. **Safety net for the migration**: if any page document has anomalous
   data and the migration skips it, the legacy field still holds the
   original content and the GROQ coalesce keeps rendering it.
2. **Backward compatibility**: other deployments (preview environments,
   feature branches, third parties hitting the Sanity API) that haven't
   updated to read `page.content` continue to work.

The legacy fields are removed entirely in Phase 1A PR 5, after a stable
period (e.g., the next quarter) confirms nothing depends on them.

## Why this isn't part of the PR auto-merge

Sanity migrations mutate dataset state. They can't be undone by reverting
a code commit (the data is already changed). This makes them a deploy-
time operation, controlled manually by a human, separate from code
merges.

Schema deploys (`sanity deploy`) work the same way: they update Sanity's
record of valid document shapes, which affects how all Studio sessions
behave. They should be coordinated with code deploys, not buried in CI.
