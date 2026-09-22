# Project operations and verification

Repository behavior reviewed 21 September 2026. This guide describes checks to perform; it does not certify current hosting, credentials, delivery or dataset contents. Start with [the project handoff](HANDOFF.md).

## Local startup and environment

Use the app commands in [README](../README.md). Root `.env` files do not automatically configure nested Next.js apps. Restart the relevant process after changing environment values.

Before debugging CMS output, confirm `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_CHANNEL`, intended language and perspective. Follow [local diagnostics](local-sanity-debugging.md), including the channel-specific doctor invocation. Confirm Studio and frontend address the same project/dataset/API version. Do not expose token values in logs or documentation.

The September migration/audit records concern `wu6i3y0h/production`. They do not prescribe every running app's environment. In particular, [deployment-tier validation](../packages/utils/src/deployment-tier.ts) couples `DEPLOYMENT_TIER=test` with `MONOREPO_TEST_PROJECT=true` and requires the configured `dev-dataset`, site identity, viewer token, test Studio URL and HTTPS Vercel origin. This is executable validation, not merely a historical rollout note. Do not silently remove it to make production-dataset previews work.

Vercel's “production” environment name can describe a test project's default branch. It is not sufficient evidence of launch status. Verify app-root configuration and actual provider settings separately.

## Routing differences

| App | Repository behavior | Source |
| --- | --- | --- |
| 1SP | Locale-free paths rewrite to `/en`; locale-looking prefixes redirect to clean paths with 301; optional host/channel cookie | [middleware](../middleware.ts) |
| FLZR | Unprefixed paths rewrite to `/en`; locale-looking prefixes pass through; aliases for about-us, jobs/career, references and earlier v2 pages | [middleware](../apps/flzr-web/middleware.ts) |
| MSM | Unprefixed paths rewrite to `/en`; locale-looking prefixes pass through | [middleware](../apps/msm-web/middleware.ts) |
| Renaissance | Unprefixed paths rewrite to `/en`; `/en` prefixes redirect to clean paths with 308; unsupported locale-looking prefixes redirect to `/` | [middleware](../apps/renaissance-web/middleware.ts) |

Passing through a locale-looking prefix in middleware does not establish that the locale is supported or that content exists. Check the downstream route and site-config. API/static exclusions also differ; preserve each app's behavior when updating routing. Verify canonical URLs, redirects, sitemap and robots on the actual target deployment.

## Draft preview session

1. Run Studio and the target app with matching CMS configuration and a configured viewer token.
2. Select that website's Presentation tool. [Studio config](../sanity.config.ts) defines four tools and origin environment overrides. Development defaults are ports 3000–3003; hosted defaults are separate preview origins.
3. Presentation uses the target app's `/api/draft-mode/enable` endpoint to establish Draft Mode. A URL containing `sanity-preview-perspective=drafts` alone does not establish that the session enabled successfully.
4. Verify the target document, channel, language and preview route through [Presentation resolvers](../sanity/presentation/resolve.ts). Check visual editing and draft content on the correct app origin.
5. Exit through that app's `/api/draft-mode/disable`, then verify the published view independently. Draft Mode cookies belong to the preview origin; testing another host or port may differ.

[Fetch configuration](../packages/sanity-queries/src/fetch-config.ts) defaults to published data outside Draft Mode and drafts inside it, with optional explicit perspective overrides. Draft Mode enables stega annotations and viewer-token use. Server reads disable the Sanity CDN; Next's tagged cache handles freshness. [The fetch wrapper](../packages/sanity-queries/src/fetch.ts) defaults to a 60-second revalidation interval, but callers may override it. [SanityLive](../packages/sanity-queries/src/live.ts) supplies live-event integration; inspect the target layout to confirm its mounting.

Stega belongs on visible editable copy. It can break equality checks for enum values, URLs and animation switches if those control values are not cleaned; MSM has [dedicated control cleaning](../apps/msm-web/lib/preview-controls.ts). A correct published view does not prove draft rendering is correct.

## Publication and freshness

Publishing is a Sanity document operation, not a Git commit. A case/service document can include shared fields and multiple website editions, so publication may affect more than one website. Inspect the complete draft diff before publishing a shared document.

Freshness has multiple paths: tagged server fetches, live events, app-local webhook endpoints and Studio's revalidation action. The [root webhook](../app/api/revalidate/route.ts) and app copies accept a signed Sanity webhook or a query-secret fallback. Inspect current code and actual webhook configuration for the target app; do not assume one endpoint invalidates the other apps' caches. Do not put secrets into diagnostic URLs or reports.

Relationship synchronization is a separate write operation. The Studio action is shown only when `NEXT_PUBLIC_ENABLE_RELATIONSHIP_SYNC=true`; the server route separately requires `RELATIONSHIP_SYNC_ENABLED=true` and `SANITY_SYNC_SECRET`. It can add and remove reciprocal references. Do not enable it as a generic cache repair or apply it to MSM's one-way Unit relationships without reviewing that model.

## Backups and data changes

Use [dated records](records/README.md) for the provenance of requested exports such as `renaissancecontent-finish` and `msmcontent-migration`. Confirm files still exist and belong to the intended dataset before relying on them. Local temporary audit JSON extracts are not recovery backups.

The repository's `backup:sanity-documents` script requires an explicit absolute `--output=` path. [Its implementation](../scripts/backup-sanity-documents.ts) reads raw documents, writes NDJSON plus a manifest/checksum and validates the gzip archive. It is a **document-level archive**: Sanity/Cloudinary asset binaries are not bundled. The archive folder retains a Renaissance-oriented name even though the query exports the configured dataset. Record scope accurately; use a suitable full export when asset recovery is required.

For an authorized migration:

1. Verify app/channel/language, dataset, published and draft IDs, source copy and current revisions.
2. Create and inspect a scoped recovery backup; establish how to restore affected documents without overwriting unrelated later edits.
3. Prepare a dry-run diff with field destinations, reference ordering, expected counts and revision guards.
4. Apply only the reviewed scope. Stop and re-plan on changed revisions.
5. Re-query exact affected values and references. Verify both published and draft perspectives where relevant, app output and unaffected shared consumers.
6. Record backup provenance, results, exceptions and any separate publication/deployment step.

Completed page-content unification and Cloudinary Stages 1/2 are historical operations, not scripts to rerun for onboarding. The [archived unification runbook](archived/migrations/unify-page-content-runbook.md) is recovery history. Stage 3+ in the [data structure recipe](SANITY_DATA_STRUCTURE_RECIPE.md) remains deferred. Live Content Lake stats are the quota authority; exported path estimates and old counts are not current capacity measurements.

## Forms, jobs and tracking

- Contact routes store submissions in Sanity using a server write token. The channel is taken from server configuration, with language checked against that site's locales. Validation, a honeypot, field limits, a Content-Length check and process-local rate limiting exist. These do not establish email delivery or a distributed abuse-control service. See [contact guide](CONTACT_FORM.md).
- Personio routes support configured recruiting authentication, normalization and XML fallback, with process-local caching. Check credentials, feed selection, language, empty/error states and application links on the target app. Presence of the endpoint does not prove a working integration.
- Cookiebot, consent-aware analytics and Vercel analytics require both repository configuration and runtime verification. Test tier suppresses production indexing/tracking through shared guards; Renaissance has additional app-specific preview boundaries. Verify before/after-consent requests rather than inferring consent behavior from rendered markup.

## Verification by change

Run focused checks first and affected builds when code changes warrant them. Commands below are from repository root; refer to [package scripts](../package.json) for current names.

| Change | Useful checks | Completion evidence |
| --- | --- | --- |
| Documentation | Local-link validation, path/inventory review, `git diff --check` | Working pointers, dated claims, preserved archive; app builds unnecessary for docs-only edits |
| Preview/resolvers | `pnpm test:presentation` | Correct app/channel document locations plus browser draft/published checks |
| Deployment guards/request boundaries | `pnpm test:deployment` | Target environment accepted/rejected correctly; actual provider and routes separately checked |
| Shared case/service queries or editions | Focused `scripts/case-website-content.test.ts`, service tests and affected apps | Correct channel/language, inheritance, deliberate empty values, ordering and SEO |
| Studio Globals filtering | `pnpm exec tsx --test scripts/globals-browser.test.ts` | Selected channel/language, unassigned scope, creation defaults and edit navigation |
| Cloudinary storage | `pnpm exec tsx --test scripts/cloudinary-storage.test.ts` | Compact stored payload with preserved media rendering; live quota checked separately |
| CTA contract | `pnpm test:cta-contract` | Correct internal/external targets and labels; keyboard/touch browser checks |
| Renaissance structure/carousel/results | Relevant `scripts/renaissance-*.test.ts`, `pnpm build:renaissance` | CMS and fallback, locale-free routes, counters, reduced motion, desktop/mobile |
| MSM motion/carousel | Focused checks and `pnpm --filter @1sp/msm-web build` | Block-by-block in-view timing, autoplay pause/resume, elastic drag/wheel settling, focus and reduced motion |
| FLZR content/layout | Focused FLZR checks and `pnpm build:flzr` | Page/modal paths, category filters, localized routing and both conversion journeys |
| Shared runtime/schema changes | Affected builds plus `pnpm build` | Existing 1SP behavior preserved; at least one affected page/case/service/person flow |

A build does not verify editorial approval, CMS publication, browser motion, remote Git state or hosting. For a release, record those evidence layers independently using [deployment verification](DEPLOYMENT.md). This documentation review did not run application builds, mutate datasets, publish content or recheck hosted services.
