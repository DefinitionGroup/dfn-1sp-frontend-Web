# Deployment verification

Use this guide to establish the target and evidence for a release. It does not declare any provider project currently deployed or authorize a deployment.

## Sources to check

- App-root `vercel.json` files define repository-side build and ignore commands.
- [scripts/vercel-ignore.mjs](../scripts/vercel-ignore.mjs) defines the checked-out branch/path filtering behavior.
- [site-config](../packages/site-config/src/index.ts) defines channels, locales and domain defaults.
- The Vercel project settings define the actual connected branch, app root, environment values and domains. Verify them live for the release being performed.
- [The July test deployment plan](archived/platform/test-deployment-plan-2026-07.md) retains its original scope and acceptance record. Its three-project topology and `dev-dataset` assumptions are historical, not a current environment inventory.

## Release sequence

1. Identify the requested app/channel, exact commit, provider project, domain and dataset. Confirm release authorization for that scope.
2. Compare actual provider settings with repository configuration. Check the app root, source access outside that root, build/install commands, branch filters and environment values without exposing tokens.
3. Verify compatible schema/query/runtime behavior for the intended data. Run the app build and relevant checks; shared changes also need existing 1SP verification.
4. If content migration is involved, use its own reviewed backup, dry-run, revision guards, compatibility sequence and rollback plan. A Git push does not publish CMS drafts, and CMS publication does not deploy frontend code.
5. Production sites cache published Sanity content for up to a day ([cache policy](../packages/sanity-queries/src/cache-policy.ts)) and rely on the `revalidate-sites` Sanity Function to refresh them on publish. Before a production release, confirm the site is listed in [its targets](../functions/revalidate-sites/fan-out.ts) with the right dataset, its secret is set on the function, and `sanity functions logs revalidate-sites` shows `sent (HTTP 200)` for it. See [Revalidating live sites](#revalidating-live-sites). Beta, test and preview deployments fall back to a one-hour timer; `SANITY_REVALIDATE_SECONDS` overrides either.
6. Deploy within the requested scope. Verify the provider's resulting commit and deployment status independently of the local build and remote Git ref.
7. Check real routes, media, draft preview where applicable, sitemap, robots, canonical URLs, locale routing and tracking. Preserve preview non-indexing and production release boundaries.
8. Record the checked project, commit, dataset, time, verification and unresolved limitations in a dated record.

## Revalidating live sites

One Sanity Function, `revalidate-sites`, replaces a webhook per site. On every published create, update or delete it posts the changed document to each live site's `/api/revalidate`, signed like a Sanity webhook, so the sites' existing handlers verify and process it unchanged. It only calls sites whose dataset changed. Both targets are listed with `production`: MSM already reads it, and live 1SP moves there with the [dataset switch](#switching-live-1sp-to-production). Until then the older "Revalidate Test" webhook (dataset `*`) keeps refreshing live 1SP from `dev-dataset`, so keep it until the switch is done. Source: [functions/revalidate-sites](../functions/revalidate-sites/), configuration: [sanity.blueprint.ts](../sanity.blueprint.ts), tests: `pnpm test:revalidate-sites`.

Run these from the repository root (they change the Sanity project, so confirm the scope first):

1. Once per project: `pnpm exec sanity blueprints init --stack-name production --project-id wu6i3y0h`. It creates the remote Stack and the git-ignored `.sanity/blueprint.config.json`; keep the existing `sanity.blueprint.ts` if it asks.
2. Deploy or update the function: `pnpm exec sanity blueprints plan`, then `pnpm exec sanity blueprints deploy`.
3. Give the function each site's secret, the value of that Vercel project's `SANITY_REVALIDATE_SECRET`: `pnpm exec sanity functions env add revalidate-sites REVALIDATE_SECRET_MSM <secret>`. A target without its secret is skipped and logged. If the value is unknown, set a new one on the Vercel project and the function, then redeploy the site.
4. Publish a document and check `pnpm exec sanity functions logs revalidate-sites`.
5. When a site launches, add it to `TARGETS`, deploy, and set its secret. Once a site shows `sent`, delete any older webhook that still posts to it.

A deployed function cannot be disabled in Manage. Before a bulk import into `production` or `dev-dataset`, run `pnpm exec sanity functions env add revalidate-sites REVALIDATE_SITES_PAUSED true`, then remove it with `pnpm exec sanity functions env remove revalidate-sites REVALIDATE_SITES_PAUSED` afterwards.

## Switching live 1SP to production

Decided 15 October 2026: live 1SP (`dfn-1sp-frontend-web`, www.1sp.agency) moves from `dev-dataset` to `production` in the same release that merges `multiseite/stage` into `main`. Switching the dataset on the old `main` alone is ruled out: its Studio at `/studio` lacks the stage schema, so editors would see the newer fields as unknown and could delete MSM, FLZR and Renaissance data. Audit evidence: [the 15 October record](records/project/1sp-production-dataset-switch-2026-10-15.md).

`NEXT_PUBLIC_SANITY_DATASET` on `dfn-1sp-frontend-web` is one variable for Production, Preview and Development, and its value is compiled into each build. Changing it switches every branch preview built afterwards and does nothing to deployments that already exist.

### Done before the release

- [x] Both datasets compared: all 131 published 1SP documents exist in `production`. The pages `1sp-monorepo-test` renders from `production` match the 23 live sitemap URLs.
- [x] The only live edit made after `production` was branched (*Reviews that Work Harder*, block order, 24 September) copied to `production`.
- [x] `NEXT_PUBLIC_SANITY_STUDIO_URL` on `dfn-1sp-frontend-web`: Production and Preview now `https://www.1sp.agency/studio` (was `http://localhost:3000/studio`), Development unchanged. Takes effect with the next build.
- [x] [`revalidate-sites`](../functions/revalidate-sites/fan-out.ts) lists 1SP with `production`.

### Release day

1. Announce a Studio freeze: nobody edits at www.1sp.agency/studio (it still writes `dev-dataset`) until step 7.
2. Run `pnpm check:1sp-dataset-switch`. It must exit 0. A listed live edit has to be repeated in `production` first; then run it again.
3. Back up both datasets: `pnpm exec sanity dataset export dev-dataset EXPORT/dev-dataset-before-1sp-switch-<date>.tar.gz` and the same for `production`.
4. Confirm the stage merge is ready: the open issues in [the handoff](HANDOFF.md#side-effects-and-open-issues-found-4-october) are resolved or accepted, and the stage builds pass.
5. Set `NEXT_PUBLIC_SANITY_DATASET` to `production` on `dfn-1sp-frontend-web` (Settings → Environment Variables, or `vercel api /v9/projects/prj_DN0h0QPF3eZ75cEFRy4NqCqHkBgU/env/qO1vApA9PhI37zCo?teamId=team_FaChp5CAM5cGPbHkDEvHTLrF -X PATCH` with `{"value":"production"}`). Do this immediately before step 6: a redeploy of the old `main` in between would run its old Studio on `production`.
6. Merge `multiseite/stage` into `main`. Check that the resulting production deployment builds the merge commit.
7. Verify on www.1sp.agency:
   - the 23 sitemap URLs render as on `1sp-monorepo-test.vercel.app`;
   - `/studio` shows dataset `production` and the stage schema without unknown-field warnings;
   - a test publish in `production` refreshes the page within seconds (`pnpm exec sanity hook logs` shows 200 from "Revalidate Test");
   - a contact-form test submission arrives as a `contactSubmission` in `production`;
   - jobs, Draft Mode and Presentation open `https://www.1sp.agency/studio`.
8. End the Studio freeze and tell editors that www.1sp.agency/studio now edits `production`.

### After the release

- Point `NEXT_PUBLIC_SANITY_STUDIO_URL` on `dfn-msm2026-prod` (Production) at `https://www.1sp.agency/studio` and redeploy `msm/production`. It still names the deleted `1sp-beta` project, so MSM's Studio links return 404.
- Deploy `revalidate-sites` with both secrets ([Revalidating live sites](#revalidating-live-sites)). Once both sites show `sent`, delete the "Revalidate Test" webhook.
- Keep `dev-dataset` as a read-only archive; do not delete it. It holds one contact submission (28 September) that is not in `production`.
- Update the dataset roles in [operations](PROJECT_OPERATIONS.md) and [the handoff](HANDOFF.md).

**Rollback:** use Vercel Instant Rollback to the last pre-merge production deployment. Its build has `dev-dataset` compiled in, so code and dataset return together. Then set the variable back to `dev-dataset` so the next build does not switch again. Edits made in `production` after the switch are not in `dev-dataset`.

## Current documentation boundaries

Renaissance's configuration includes a preview URL and no production domain. MSM's configured production URL is not proof that the current app has been released there. September content publication records are evidence of dataset changes, not public frontend deployment.

No hosting settings were inspected or changed during the 2026-09-20 documentation reorganization. Establish fresh provider evidence before using an older release record operationally.
