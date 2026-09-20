# Deployment verification

Use this guide to establish the target and evidence for a release. It does not declare any provider project currently deployed or authorize a deployment.

## Sources to check

- App-root `vercel.json` files define repository-side build and ignore commands.
- [scripts/vercel-ignore.mjs](../scripts/vercel-ignore.mjs) defines the checked-out branch/path filtering behavior.
- [site-config](../packages/site-config/src/index.ts) defines channels, locales and domain defaults.
- The Vercel project settings define the actual connected branch, app root, environment values and domains. Verify them live for the release being performed.
- [The July test deployment plan](../deploymentplan.md) retains its original scope and acceptance record. Its three-project topology and `dev-dataset` assumptions are historical, not a current environment inventory.

## Release sequence

1. Identify the requested app/channel, exact commit, provider project, domain and dataset. Confirm release authorization for that scope.
2. Compare actual provider settings with repository configuration. Check the app root, source access outside that root, build/install commands, branch filters and environment values without exposing tokens.
3. Verify compatible schema/query/runtime behavior for the intended data. Run the app build and relevant checks; shared changes also need existing 1SP verification.
4. If content migration is involved, use its own reviewed backup, dry-run, revision guards, compatibility sequence and rollback plan. A Git push does not publish CMS drafts, and CMS publication does not deploy frontend code.
5. Deploy within the requested scope. Verify the provider's resulting commit and deployment status independently of the local build and remote Git ref.
6. Check real routes, media, draft preview where applicable, sitemap, robots, canonical URLs, locale routing and tracking. Preserve preview non-indexing and production release boundaries.
7. Record the checked project, commit, dataset, time, verification and unresolved limitations in a dated record.

## Current documentation boundaries

Renaissance's configuration includes a preview URL and no production domain. MSM's configured production URL is not proof that the current app has been released there. September content publication records are evidence of dataset changes, not public frontend deployment.

No hosting settings were inspected or changed during the 2026-09-20 documentation reorganization. Establish fresh provider evidence before using an older release record operationally.
