# Project Memory — 1SP Multisite Frontend

> Verified against the repository and readable Sanity datasets on 2026-07-09.
> This is an operational memory for agents and maintainers, not a replacement
> for `AGENTS.md`. `AGENTS.md` defines policy; this file records current state,
> known drift, release gates, and the shortest reliable path back into the code.

## Read This First

- Current checkout: `multisite/flzr` at `0e8952d`, clean before this file was added.
- The branch is 62 commits ahead of `origin/main` and includes a large platform,
  framework, FLZR, and MSM change set. Treat integration as a release project,
  not as a routine feature merge.
- The root app is the live 1SP application. `apps/flzr-web` and `apps/msm-web`
  are separate Next.js apps for their Sanity channels.
- Shared data contracts and utilities live under `packages/*`; visual code is
  intentionally app-local, although too much server/data logic is currently
  copied between the three apps.
- Local root, FLZR, and MSM environments currently read `dev-dataset`.
- The production Sanity dataset is still legacy-only for page-builder content.
  Do not merge/deploy this branch to the 1SP production app until the unified
  content migration is sequenced with the code deployment.

## Critical Production Release Gate

As of 2026-07-09, direct dataset checks returned:

| Dataset | Pages | `content` | `content1sp` | `contentStudioFlizr` |
|---|---:|---:|---:|---:|
| `dev-dataset` | 29 | 29 | 0 | 0 |
| `production` | 21 | 0 | 14 | 7 |

The current branch schema and GROQ read unified `page.content[]` directly and
the legacy page fields have been removed from the branch schema. `origin/main`
still reads the legacy arrays, and the production dataset still contains those
legacy arrays only.

Consequence: merging the branch to `main` without the documented migration
sequence can blank 1SP and FLZR page-builder content. Before any production
merge, read `migrations/unify-page-content/RUNBOOK.md` fully, export production,
choose its Path A or Path B deliberately, and verify both the deployed code and
dataset after every transition. Do not infer that the migration is complete
from the current branch or from `dev-dataset`.

## Repository Shape

```text
app/                         Root 1SP Next.js app and embedded Sanity Studio
components/                  Root 1SP visual components and PageBuilder
lib/                         Root 1SP SEO, structured-data, and hero helpers
sanity/                      Studio structure, presentation, actions, plugins
apps/flzr-web/               FLZR Next.js app
apps/msm-web/                MSM Next.js app
packages/site-config/        Channel, brand, locale, host resolution
packages/sanity-schema/      Shared Sanity schema definitions
packages/sanity-queries/     Shared GROQ, clients, cached fetch layer
packages/sanity-types/       Hand-maintained content/menu types
packages/pagebuilder-core/   Unused registry/renderBlocks migration target
packages/utils/              Shared pure utilities and hooks
migrations/                  Sanity migrations and production runbooks
docs/                        Mixed operational, historical, and recipe docs
```

There is no `apps/1sp-web` yet. That is intentional: the production root app
must stay in place until the platform and new apps are proven.

## Runtime and Tooling

- Node: repository requires Node 22 (`.nvmrc`).
- Package manager: pnpm 10.7.0 via Corepack.
- Current branch: Next.js 16.2.10, React 19.2.7, Sanity 6.3.0,
  next-sanity 13.1.1, Tailwind CSS 4, Motion 12.
- `origin/main` is still on Next.js 15.5.7 and Sanity 4.12.0.
- No automated test framework is configured.
- ESLint is configured through `eslint.config.mjs`, but `pnpm lint` currently
  fails before linting with an ESLint 9/FlatCompat circular-config error.
- Builds mutate `next-env.d.ts`; restore generated churn after verification.
- In this environment, prefer `corepack pnpm ...` so the repository's pnpm
  version is used.

Useful commands:

```bash
corepack pnpm dev
corepack pnpm --filter @1sp/flzr-web dev
corepack pnpm --filter @1sp/msm-web dev

corepack pnpm build
corepack pnpm --filter @1sp/flzr-web build
corepack pnpm --filter @1sp/msm-web build

node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs
node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs --channel flizrWeb --language en
node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs --channel msmWeb --language en
```

The root `package.json` has FLZR convenience scripts but no `dev:msm`,
`build:msm`, or `start:msm` scripts. The MSM README currently advertises those
missing commands; use pnpm filters until the scripts or README are corrected.

## Apps and Channel Model

`packages/site-config/src/index.ts` is the code source of truth for channels:

| Channel | App | Locales in config | Current state |
|---|---|---|---|
| `1spWeb` | root | `en` | Live production baseline; Studio is embedded here |
| `flizrWeb` | `apps/flzr-web` | `en`, `de`, `pl` | Distinct visual app, but launch configuration/content is incomplete |
| `msmWeb` | `apps/msm-web` | `en`, `de` | Distinct dark-first app; content and launch work remain |
| `studioco2Web` | none | `en`, `de` in site config | Channel/schema support only; no frontend app |

Pages and menus are website-specific (`channel` is a string). Cases, services,
people, clients, and units are shared documents assigned to one or more sites
(`channel` is an array). Shared-content GROQ must use membership checks and a
language predicate.

Active channel resolution:

1. `NEXT_PUBLIC_CHANNEL` pins a deployment.
2. A `channel` cookie may be set from a host map.
3. Fallback is `1spWeb`.

Use `getChannel()` for request-scoped server work and `getChannelFromEnv()` for
build-time/static work. Do not read the env var directly in feature code.

Channel/locale lists are still duplicated. `SITE_CONFIGS.studioco2Web` lists
EN/DE, while `sanity.config.ts` and `sanity/structure.ts` expose Studio CO2 as
EN only. FLZR route files also hardcode `en/de/pl` instead of reading site
config. Reconcile these before adding content or an app for another locale.

## Sanity Data Snapshot

The checked local env values are project `wu6i3y0h`, dataset `dev-dataset`, API
version `2025-09-16`. Counts below are a snapshot, not permanent truth.

| Scope | Pages | Homepages | Menus | Published cases | Services | People | Clients | Units |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1SP EN | 13 | 1 | 2 | 14 | 9 | 26 | 10 | 0 |
| FLZR EN | 7 | 1 | 1 | 2 | 4 | 7 | 3 | 0 |
| FLZR DE | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| MSM EN | 4 | 1 | 1 | 4 | 3 | 9 | 0 | 0 |
| MSM DE | 4 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |

FLZR statically emits EN/DE/PL route shells even though only EN has content in
the checked dataset. MSM has EN/DE pages, but meaningful shared content is EN
only. Validate the active dataset before changing routing for an empty page.

## Page Builder Reality

- All page documents now use one unified `content[]` array in this branch.
- Root, FLZR, and MSM each have their own large static-switch PageBuilder:
  `components/PageBuilder.tsx`, `FlzrPageBuilder.tsx`, `MsmPageBuilder.tsx`.
- `@1sp/pagebuilder-core` exists but no app uses `renderBlocks()` yet.
- The three PageBuilders are about 533/554/554 lines and repeat dispatch and
  server-block wiring.
- Visual divergence is intentional. Repeated channel filtering, selection
  mode, pagination, and data-fetching logic is not; recent fixes had to be
  applied three times.
- Prefer extracting non-visual block controllers/query contracts first. Keep
  app-local render components and styling independent.
- The current `pagebuilder-core` registry contract passes `{data}` while many
  existing components expect spread block props plus `language`/`channel`.
  Migration is not a mechanical switch replacement; define an adapter or a
  context contract before converting a builder.
- Sanity types are hand-maintained. TypeGen is not configured, and comments in
  `packages/sanity-types/src/index.ts` that imply a transitional generator are
  stale. Schema/query/type drift is therefore a real maintenance risk.

## Verified Query and Isolation Gaps

The July channel audit fixes for case/service galleries and selection modes are
present in all three apps. The following gaps remain:

- `SMART_PEOPLE_QUERY` requires `smartPeoplePromo1SP == true` for every channel
  and has no language predicate. FLZR/MSM smart people cannot have an honest
  per-channel selection model and may mix languages.
- `getSmartUnits`, `SMART_UNITS_QUERY`, `SMART_UNITS_GLOBE_QUERY`, and
  `getUnitLogoGridUnits` do not accept/filter by channel.
- Manual `selectedUnits[]` and `selectedClients[]` projections are not filtered
  by the active channel; auto clients are filtered.
- `GLOBAL_DATA_QUERY.hasServices` checks language but not channel. Nav service
  availability can be true because another site has services in that language.
- `getAllServices()` remains intentionally unscoped. New multisite code should
  use `getAllServicesForChannel()` unless preserving a known legacy behavior.
- Revalidation routes are copied per app and do not gate on webhook channel.
  This causes broad/wasteful invalidation rather than a data leak.

## Launch and SEO Gaps

- `lib/structured-data.tsx` hardcodes `SITE_NAME = "1SP Agency"` and the 1SP
  description. FLZR and MSM import this root file through the cross-app `@/*`
  alias, so their JSON-LD currently identifies them as 1SP.
- Multi-language metadata only sets a relative canonical such as `/contact`.
  DE/PL routes do not emit locale-aware canonicals or `alternates.languages`.
  Fix this before indexing FLZR or multilingual MSM.
- FLZR site config still has placeholder SEO, no production domain, and 1SP
  logo paths. MSM has a production domain and logo but placeholder SEO copy.
- `apps/flzr-web/.env.example` does not include
  `NEXT_PUBLIC_CHANNEL=flizrWeb`; an unpinned deployment falls back to 1SP.
- FLZR/MSM still import root cookie, analytics, visual-editing, structured-data,
  and hero helpers through `@/*`. Their tsconfigs explicitly point `@/*` at
  the repo root and `externalDir` is enabled. Builds pass, but the apps are not
  operationally independent yet.
- Both app-local footers still expose fallback copy such as "Independent ...
  website shell" / "Channels pending" when CMS footer data is absent.
- `apps/msm-web/app/(site)/[locale]/mosaic-button-test/page.tsx` is a public
  test route and should not ship unintentionally.
- Vercel project/branch state lives in the dashboard and was not verified by
  this code audit. Repo config has three `vercel.json` files plus
  `scripts/vercel-ignore.mjs`; docs disagree on watched branch names.

## Build and Engineering Health

Verified on 2026-07-09:

- Root 1SP production build: passes.
- FLZR production build: passes.
- MSM production build: passes.
- ESLint: fails during config loading; no files are linted.

Build warnings worth tracking:

- Next.js 16 deprecates the `middleware.ts` convention in favor of `proxy`.
- `@sanity/image-url` default export is deprecated.
- Root static generation reports unsupported Portable Text type
  `paragraphLine`; affected content can render incompletely.
- Node emits `module.register()` and build-time `localStorage` warnings.

No test suite exists. A green build is useful but does not prove channel
isolation, visual behavior, canonical/hreflang output, webhook freshness, or
CMS selection-mode semantics. Smoke-test each app separately when touching
shared packages or routes.

## Performance Plan Status

`PERFORMANCE_PLAN.md` is a February 2026 snapshot and must not be treated as a
current benchmark after the Next 16/Turbopack upgrade.

- The custom `splitChunks` override has already been removed.
- Tabler, Lucide, and React Icons are no longer direct app dependencies.
- Phosphor is used widely in both the Studio schema and UI; the old "four icons"
  claim is no longer true.
- `styled-components` has no direct source imports, but Sanity packages also
  use it as a dependency/peer. Reassess before removing it mechanically.
- `data/globe.json` is still a 417,234-byte static import in all three globe
  component copies.
- All PageBuilder dynamic imports still use `ssr: true`, including globe paths.
- Re-baseline bundle size and Web Vitals before assigning savings estimates.

## Documentation Reliability Map

Read documents by purpose and freshness:

| Document | Use it for | Reliability now |
|---|---|---|
| `AGENTS.md` | Non-breaking rules, multisite ownership, verification policy | Valid policy; not a status report |
| `MEMORY.md` | Current operational orientation and release gates | Current as of date above |
| `docs/AUDIT-2026-07-channel-cache-mode.md` | Recent isolation/cache incident and applied fixes | Current; follow-ups remain |
| `migrations/unify-page-content/RUNBOOK.md` | Production migration safety | Critical procedure; branch names/state text is dated |
| `docs/MSM_LAUNCH.md` | MSM launch checklist and brand inputs | Partly current; data counts/design status are stale |
| `docs/multisite-platform-plan.md` | Original architecture intent | Good vision; phase status is obsolete |
| `TODO.MD` | Early FLZR scope and January feature history | Stale as an active task list |
| `docs/HANDOFF.md` | Prior worktree handoff and migration history | Historical; "uncommitted" and branch claims are stale |
| `docs/MULTI_SITE.md` | Earlier state-of-play | Historical; incorrectly says MSM is not started |
| `docs/VERCEL_DEPLOYMENT.md` | Three-project repo-side build model | Newer deployment intent; dashboard state unverified |
| `docs/VERCEL_DEPLOYMENTS.md` | Older two-project deployment explanation | Superseded by singular file above |
| `CLAUDE.md` | Some conventions and code map | Mixed; still says Next 15, `content1sp`, old query paths |
| `GEMINI.md`, `README.md` | Historical/basic setup | Too stale/boilerplate for architecture decisions |
| `docs/PAGEBUILDER_COMPONENT_GUIDE.md` | Conceptual block workflow | Paths, type imports, and `content1sp` steps need updating |
| `docs/CLEANUP-COMPONENTS.md`, `docs/UNUSED.md` | January cleanup snapshot | Re-run usage analysis before deleting anything |
| `PERFORMANCE_PLAN.md` | Historical performance hypotheses | Re-baseline before acting |
| `RECIPE.md`, `docs/RECIPE.md` | Generic multisite lessons | Templates, not project state |
| `RECIPE-V5.md` | Historical Sanity v5 recipe | Obsolete for this branch, which uses Sanity 6 |

Narrow feature documents such as `docs/MSM_NAV_GLASS.md`,
`docs/CONTACT_FORM.md`, and `docs/SANITY_NULL_HANDLING.md` remain useful when
working in those exact areas, but verify their file paths against the app being
changed.

## Recommended Work Order

1. Protect production: choose and rehearse the unified-content release path;
   never merge first and improvise the dataset migration afterward.
2. Restore engineering feedback: fix ESLint config, add minimal tests for
   channel-scoped queries and manual/auto selection behavior.
3. Finish channel isolation: smart people, units, clients, and nav service
   availability.
4. Remove cross-brand SEO leakage: make structured data site-config driven,
   then implement locale-aware canonical/hreflang behavior.
5. Complete launch configuration/content: FLZR env pin/domain/SEO/locales;
   MSM SEO/footer/DE content; remove test/fallback surfaces.
6. Reduce repeated logic: extract shared non-visual page-builder controllers
   and route/SEO helpers while keeping the three design systems app-local.
7. Configure TypeGen or establish another generated contract workflow.
8. Re-baseline performance on Next 16 and then address globe JSON, heavy client
   modules, and per-route bundles based on measurements.
9. Update or archive stale docs so there is one operational status document,
   one roadmap, and one migration runbook rather than several competing truths.

## Working Rules That Still Matter

- Preserve live 1SP behavior unless a task explicitly changes it.
- Diagnose Sanity env/dataset before changing code for missing content.
- Scope every global-content read by active channel and language.
- Keep pages/menus site-specific and shared documents assigned by channel.
- Share contracts and pure logic; keep visual components per app.
- Declare imports in the package/app that uses them; do not rely on hoisting.
- Validate root, FLZR, and MSM separately after shared-package changes.
- Do not trust a historical handoff's deployment or dataset claim without a
  fresh Git, env, dataset, and dashboard check.
