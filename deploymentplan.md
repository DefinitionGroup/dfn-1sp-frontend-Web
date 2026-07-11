# Monorepo Test Deployment Plan

Status: **Phase 2 baseline complete; three isolated `dev-dataset` test projects are Ready**

Last verified: **2026-07-11**

Repository: `DefinitionGroup/dfn-1sp-frontend-Web`

## 1. Objective

Deploy the current monorepo to three new, isolated Vercel test projects while:

- keeping the existing 1SP production project on `main`;
- keeping the Sanity `production` dataset untouched;
- using `dev-dataset` in all three test projects;
- preserving one GitHub repository and one pnpm monorepo;
- preventing an app-only change from building or deploying either unaffected app;
- producing deployable test releases only from `multisite/test`;
- exposing the generated Vercel URLs publicly but preventing search indexing;
- supporting the full current integration surface against `dev-dataset`;
- disabling production Google Analytics and Cookiebot on the test sites.

This plan does **not** authorize merging the monorepo branch into `main`, migrating the
Sanity `production` dataset, assigning real domains, or replacing the current live 1SP
deployment.

## 2. Approved decisions

| Decision | Approved strategy |
|---|---|
| Project topology | Three completely new Vercel test projects |
| Git repository | All three connect to the same GitHub repository after safe bootstrap |
| Test release branch | `multisite/test` |
| Existing production branch | `main`, unchanged |
| Sanity dataset | `dev-dataset` for all test projects |
| Test URLs | Generated `*.vercel.app` project URLs only |
| Custom domains and DNS | None during this phase |
| Feature-branch previews | Disabled at project level; branch guard remains defense-in-depth |
| Authoritative build controls | Preview Deployments disabled; `scripts/vercel-ignore.mjs` filters the allowed branch; native skipping disabled |
| Search indexing | `noindex, nofollow`, with header and robots defenses |
| Production tracking | Google Analytics and Cookiebot disabled |
| Vercel observability | Components are present; project features remain disabled pending explicit cost approval |
| Integration scope | Full test functionality against `dev-dataset` |
| Mutation-route hardening | Deferred; recorded as an accepted test-phase risk |
| Locale acceptance | 1SP EN, FLZR EN, MSM EN/DE; known content gaps are non-blocking |

## 3. Verified current repository state

The following was checked from the original `multisite/flzr` checkout and refreshed
after the first `multisite/test` rollout:

- The repo is a pnpm workspace containing the root 1SP app, `apps/msm-web`,
  `apps/flzr-web`, and shared `packages/*` workspaces.
- The deployed baseline is commit `5c9807270942c61405bdade3bb62495331aa41fe` on
  `multisite/test`.
- Local root, MSM, and FLZR environments resolve to Sanity project `wu6i3y0h`, API
  version `2025-09-16`, and `dev-dataset`.
- `pnpm build`, `pnpm --filter msm-web build`, and
  `pnpm --filter flzr-web build` all pass against the current local test environment.
- The builds emit warnings, including the Next.js middleware deprecation and existing
  Sanity/Portable Text warnings, but no build-stopping error.
- The latest GitHub status for `main` showed failed deployments for the existing
  `dfn-1sp-frontend-web` and `flzr-prototype` projects. This does not block creating
  isolated test projects, but it means the current live project must not be treated as
  a verified deployment template.
- GitHub currently reports `main` as unprotected.
- The Vercel CLI was authenticated against team `definition-groups-projects`. The
  existing projects and the three new projects were read back through the Vercel API;
  the original workspace's local production-project link was not changed.
- Three versioned `vercel.json` files and `scripts/vercel-ignore.mjs` already exist on
  the monorepo branch.
- `origin/main` does not contain the versioned Vercel guard/config files. A normal
  Import-and-Deploy flow could therefore start a default-branch deployment before the
  new guard exists. Section 7.5 defines a safe unconnected-project bootstrap instead.
- Existing deployment documentation is partly stale: it references branch names and
  dataset choices that do not match the approved strategy in this document.

The existing production project and `flzr-prototype` were audited before rollout. No
dashboard assumption in an older Markdown file was accepted without checking the live
project state.

## 4. Target architecture

| Site | New Vercel project | Root Directory | Production Branch | Channel | Dataset |
|---|---|---|---|---|---|
| 1SP test | `1sp-monorepo-test` | repository root | `multisite/test` | `1spWeb` | `dev-dataset` |
| MSM test | `msm-monorepo-test` | `apps/msm-web` | `multisite/test` | `msmWeb` | `dev-dataset` |
| FLZR test | `flzr-monorepo-test` | `apps/flzr-web` | `multisite/test` | `flizrWeb` | `dev-dataset` |

Vercel may adjust a project name when a slug is already occupied. The actual assigned
URL must be copied from Vercel after project creation and used everywhere this plan
refers to the generated URL.

The target model follows Vercel's documented monorepo pattern: import one Git
repository into a separate project for every deployable app and set a different Root
Directory for each project:

- <https://vercel.com/docs/monorepos>
- <https://vercel.com/docs/monorepos/monorepo-faq>

### 4.1 Existing projects remain separate

The following projects are outside the new test topology:

| Existing project | Required behavior |
|---|---|
| `dfn-1sp-frontend-web` | Continue serving 1SP production from `main` and `production` |
| `flzr-prototype` | Do not reuse; prevent duplicate builds from `multisite/test` |

Creating three new projects alone is insufficient: every Vercel project connected to
the repository sees Git pushes. The branch/build guard described below must also make
the existing projects ignore `multisite/test`.

## 5. Git and release model

### 5.1 Branches

```text
feature or working branches
        |
        | local review and pull request; no Vercel test preview
        v
multisite/test
        |
        | affected test project(s) deploy against dev-dataset
        v
three generated *.vercel.app test URLs

main
        |
        | existing production workflow only
        v
existing 1SP production project + Sanity production
```

`multisite/test` should be created from an intentionally selected and committed
monorepo revision. The current working tree contains unrelated user changes and an
untracked `MEMORY.md`; those files must not be swept into a deployment commit without
review.

Recommended GitHub controls for `multisite/test`:

- require pull requests;
- require the three local/CI build checks when shared packages change;
- prevent force pushes;
- allow deployment only after the relevant smoke checklist passes;
- do not change GitHub's default branch from `main`.

### 5.2 Vercel environment terminology

Vercel will call deployments from `multisite/test` **Production deployments** inside
each new test project because it is that project's Production Branch. They are still
organizationally test deployments: they have test project names, generated test URLs,
`DEPLOYMENT_TIER=test`, and `dev-dataset`.

Changing a Production Branch is a per-project setting and does not change another
project connected to the same repository:

- <https://vercel.com/docs/git#production-branch>

## 6. Build and deployment isolation

### 6.1 Required trigger matrix

| Changed path | 1SP test | MSM test | FLZR test |
|---|---:|---:|---:|
| Root 1SP application code | Build | Skip | Skip |
| `apps/msm-web/**` | Skip | Build | Skip |
| `apps/flzr-web/**` | Skip | Skip | Build |
| Root-shared directories and common workspace packages | Build | Build | Build |
| `packages/sanity-schema/**` | Build | Skip | Skip |
| Any other current/future `packages/**` change | Conservatively build | Conservatively build | Conservatively build |
| Root lockfile/workspace/toolchain configuration | Conservatively build | Conservatively build | Conservatively build |
| Documentation-only change | Skip | Skip | Skip |
| Any branch other than `multisite/test` in a new test project | Skip | Skip | Skip |

An app-only change must not create a new deployable URL for either unaffected app.
A change to a shared dependency is allowed to fan out because all consumers need to be
validated against the new shared code.

The matrix describes a normal Git push after each project has one successful baseline
deployment and Git can read the previous successful SHA. The filter intentionally
builds the allowed project on its first deployment, an empty diff/forced redeploy, or
an unreadable diff. Vercel uses a shallow checkout for the ignored-build step, so a
lane with enough consecutive canceled commits can lose the older base SHA and trigger
one conservative extra build. This fail-open behavior prevents a false skip; it means
the guarantee is “no unaffected build when a usable diff exists,” not an unconditional
zero-build promise.

### 6.2 Authoritative mechanism: explicit path and branch guard

Use Vercel's project-level **Disable Preview Deployments** control as the primary guard
against feature-branch deployments. Use `scripts/vercel-ignore.mjs` as the authoritative
path filter for the one allowed branch. Disable Vercel's native **Skip deployments when
there are no changes to the Root Directory or its dependencies** setting on the three
new projects.

This correction is required because MSM and FLZR currently extend the root TypeScript
configuration and directly compile/import root `components/`, `data/`, `hooks/`,
`lib/`, `sanity/`, `types/`, and `utils/`. Those dependencies are outside the nested
apps' declared workspace-package graph. Native skipping only understands declared
workspace dependencies and could incorrectly skip MSM or FLZR before `ignoreCommand`
gets a chance to classify a root shared-file change.

The explicit script therefore treats those root directories, the common workspace
packages, root `package.json`/`tsconfig.json`, and the lock/workspace/toolchain files as
shared inputs. `packages/sanity-schema` remains 1SP-only.

This is deliberately conservative and prioritizes correct deployments over quota
efficiency. Re-enable native skipping only after root-shared code is moved into
explicit workspace packages or the nested app TypeScript/import boundaries are
narrowed and verified.

Reference for Vercel's dependency-graph requirements:

- <https://vercel.com/docs/monorepos#skipping-unaffected-projects>

### 6.3 Branch and project isolation

Add the server-only environment values below to the **Production and Preview**
environments of the three new projects only:

```text
MONOREPO_TEST_PROJECT=true
MONOREPO_TEST_SITE=1sp | msm | flzr
```

Project-level preview disabling is required because an old branch may not contain the
new versioned `vercel.json` or ignore script. Keep a project-level Ignored Build Step as
a second branch gate; its exact per-project commands are in section 7.5. On
`multisite/test`, the versioned command performs path classification. On an older or
unknown branch, the project-level command exits before trying to load a repository
script.

The script should apply this decision order:

1. Read `VERCEL_GIT_COMMIT_REF` and `MONOREPO_TEST_PROJECT`.
2. If `MONOREPO_TEST_PROJECT=true` and the branch is not `multisite/test`, skip.
3. If the branch is `multisite/test` and `MONOREPO_TEST_PROJECT` is not `true`, skip.
   This makes the existing production and prototype projects ignore the test branch.
4. For the remaining allowed project/branch combination, evaluate the site-specific
   changed-path rules implemented in the script.
5. When no previous successful deployment SHA exists, build the initial allowed
   deployment instead of comparing only `HEAD^`.
6. Continue to fail open on an unreadable Git diff for an allowed production build,
   but log the reason visibly.

Enable **Automatically expose System Environment Variables** in all five connected
Vercel projects so `VERCEL_GIT_COMMIT_REF`, `VERCEL_GIT_PREVIOUS_SHA`, and
`VERCEL_PROJECT_ID` are available to the guard.

Before enabling that setting on either existing project, confirm it already has an
explicit correct `NEXT_PUBLIC_SITE_URL`. Otherwise `packages/utils/src/site-url.ts`
could begin using `VERCEL_PROJECT_PRODUCTION_URL` and change production canonicals as a
side effect.

Important Vercel behavior:

- `ignoreCommand` cancellation happens after Vercel creates a candidate deployment,
  is shown as `Canceled — Ignored Build Step`, counts as a full deployment, and occupies
  a concurrent build slot while it runs;
- the canceled candidate does not compile the Next.js application and produces no
  usable deployment URL;
- native skipping would be more quota-efficient, but is unsafe until the hidden root
  dependencies are represented in the workspace graph;
- manual redeploys must keep **Use project's Ignore Build Step** enabled. Unchecking it
  bypasses the branch/path guard and is prohibited for this test topology.

References:

- <https://vercel.com/docs/project-configuration/vercel-json#ignorecommand>
- <https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel>
- <https://vercel.com/docs/environment-variables/system-environment-variables>
- <https://vercel.com/docs/limits>

If the requirement changes from "no build and no usable deployment" to "no candidate
deployment record at all," Vercel Git integration plus an ignored build is not enough.
That stricter model would require disconnecting the test projects from automatic Git
deployments and using path-filtered GitHub Actions or deploy hooks. That extra CI model
is intentionally not selected for this phase.

### 6.4 Probe the matrix before accepting it

First establish one Ready `multisite/test` baseline in each new project. Then use
harmless, temporary non-Markdown probe files or the first real changes in each scope
and inspect all five connected project statuses:

1. FLZR-only change: only `flzr-monorepo-test` reaches Ready.
2. MSM-only change: only `msm-monorepo-test` reaches Ready.
3. Root 1SP change: only `1sp-monorepo-test` reaches Ready.
4. Root shared component/lib change: all three test projects reach Ready.
5. `packages/sanity-schema`-only change: only 1SP reaches Ready.
6. Common workspace package change: all three consumers reach Ready.
7. Documentation-only change: all projects cancel before compilation.
8. Feature-branch change: the three new test projects do not create usable previews.
9. `multisite/test` push: existing `dfn-1sp-frontend-web` and `flzr-prototype` do not
   compile or create a usable preview.
10. First deployment without `VERCEL_GIT_PREVIOUS_SHA`: the allowed project builds.
11. Move or rename a root-shared file into one app: all former consumers build because
    the ignore script classifies both the removed and added paths.

Record the deployment IDs, commit SHA, outcome, and reason for every probe. Do not
assume a green aggregate GitHub status proves the matrix; inspect each project.

## 7. Vercel build settings

### 7.1 Common settings

| Setting | Value |
|---|---|
| Git repository | `DefinitionGroup/dfn-1sp-frontend-Web` |
| Framework | Next.js |
| Node.js | `22.x`, matching `.nvmrc` |
| Production Branch | `multisite/test` |
| System environment variables | Automatically expose: enabled |
| Preview Deployments | **Disabled** |
| Skip unaffected projects | **Disabled for this test phase** |
| Production deployment protection | None; the three test URLs are public by decision |
| Ignored Build Step | Permanent project-level branch wrapper from section 7.5 |
| Custom domains | None |

### 7.2 1SP test project

| Setting | Value |
|---|---|
| Project | `1sp-monorepo-test` |
| Root Directory | repository root |
| Include files outside Root Directory | Not applicable |
| Install | `pnpm install --frozen-lockfile` |
| Build | `pnpm build` |
| Output | Next.js default `.next` |
| Config | `/vercel.json` |

### 7.3 MSM test project

| Setting | Value |
|---|---|
| Project | `msm-monorepo-test` |
| Root Directory | `apps/msm-web` |
| Include files outside Root Directory | **Enabled** |
| Install | `cd ../.. && pnpm install --frozen-lockfile` |
| Build | `cd ../.. && pnpm --filter msm-web build` |
| Output | `.next` relative to `apps/msm-web` |
| Config | `/apps/msm-web/vercel.json` |

### 7.4 FLZR test project

| Setting | Value |
|---|---|
| Project | `flzr-monorepo-test` |
| Root Directory | `apps/flzr-web` |
| Include files outside Root Directory | **Enabled** |
| Install | `cd ../.. && pnpm install --frozen-lockfile` |
| Build | `cd ../.. && pnpm --filter flzr-web build` |
| Output | `.next` relative to `apps/flzr-web` |
| Config | `/apps/flzr-web/vercel.json` |

The outside-root option is required for the app projects to access the root lockfile
and shared `packages/*` workspaces. Vercel documents this requirement here:

- <https://vercel.com/docs/monorepos/monorepo-faq#can-i-share-source-files-between-projects-are-shared-packages-supported>

Use the full scoped package names (`@1sp/msm-web` and `@1sp/flzr-web`) in a later
cleanup if desired, but the current filters were verified to resolve and build.

### 7.5 Safe project bootstrap without a default-`main` deployment

Do **not** use the normal dashboard Import-and-Deploy button for these projects. The
documented import flow does not expose Production Branch selection before Deploy, and
Vercel's public create/update project API does not document an atomic
`productionBranch` input. Because `origin/main` lacks this branch guard, the safest
supported flow is:

1. Push the reviewed `multisite/test` branch first.
2. Create each Vercel project **without** a Git repository connection, using the Vercel
   API/CLI or a blank project flow. Set its project name, Root Directory, install/build
   commands, Node version, `previewDeploymentsDisabled=true`, and
   `enableAffectedProjectsDeployments=false`.
3. Before connecting Git, enable system variables and add only the non-secret
   Production and Preview test identity/configuration, including the exact generated project URL,
   `DEPLOYMENT_TIER=test`, `MONOREPO_TEST_PROJECT=true`, the matching
   `MONOREPO_TEST_SITE`, `dev-dataset`, project ID, and channel. Do not add viewer,
   write, revalidation, or external integration secrets before Git is connected and the
   Production Branch is verified.
4. Configure this permanent project-level Ignored Build Step:

| Project | Project-level command |
|---|---|
| 1SP | `if [ "$VERCEL_GIT_COMMIT_REF" != "multisite/test" ]; then exit 0; fi; node scripts/vercel-ignore.mjs 1sp` |
| MSM | `if [ "$VERCEL_GIT_COMMIT_REF" != "multisite/test" ]; then exit 0; fi; node ../../scripts/vercel-ignore.mjs msm` |
| FLZR | `if [ "$VERCEL_GIT_COMMIT_REF" != "multisite/test" ]; then exit 0; fi; node ../../scripts/vercel-ignore.mjs flzr` |

5. In an isolated temporary checkout/worktree, explicitly `vercel link` to the new
   blank project, decline any prompt to connect Git automatically, and verify the linked
   project ID. The current workspace link points to the existing production project and
   must not be reused. Then deliberately connect the prepared blank project with
   `vercel git connect`; do not start from the GitHub Import-and-Deploy screen.
6. Immediately set Settings → Environments → Production → Branch Tracking to
   `multisite/test` and verify it saved.
7. Inspect any candidate created during connection. A default-branch candidate may
   stop as `Canceled — Ignored Build Step` or fail before install because that branch
   lacks the configured Root Directory. Either is safe. It must never run the install/
   application build or reach Ready.
8. If `dev-dataset` is not publicly readable, add one dedicated read-only viewer token
   as a Sensitive **Production-only** value now that the branch is verified. Do not add
   any write-capable or external credential yet.
9. Trigger the first intentional `multisite/test` deployment, then record its Ready
   deployment as the baseline for the path-filter probes.

The project-level wrapper is intentionally retained after bootstrap as a fallback for
branches without their own override. A branch-level `vercel.json` can override the
dashboard command, so project-level Preview Deployments disabling remains the primary
old/feature-branch control. On `multisite/test`, the checked-in override has the same
branch guard and then performs site-specific path classification.

Vercel does not document whether `vercel git connect` can enqueue a default-branch
candidate before the Production Branch setting is changed. The permanent wrapper
closes that race where no branch override supersedes it. If a default-branch candidate
runs install/application build or becomes Ready, delete and recreate the still-
unpublished test project.

Operational note from the 2026-07-11 bootstrap: Vercel CLI `50.38.1` did not expose a
production-branch option. The projects were connected with `vercel git connect`, then
the branch was set through the same dashboard endpoint used by Vercel's Terraform
provider: `PATCH /v9/projects/{projectId}/branch` with
`{"branch":"multisite/test"}`. This endpoint is not part of Vercel's supported public
REST contract and may change. It is a bootstrap implementation detail, not a required
ongoing deployment dependency. Each project's `link.productionBranch` was read back
as `multisite/test`, and all three deployment lists were still empty before the first
intentional baseline was created.

References:

- <https://vercel.com/docs/git>
- <https://vercel.com/docs/cli/git>
- <https://vercel.com/docs/rest-api/projects/create-a-new-project>
- <https://vercel.com/docs/rest-api/projects/update-an-existing-project>
- <https://vercel.com/docs/project-configuration/project-settings>

## 8. Environment variables

Configure variables independently in each test project. Do not copy an existing
project's complete environment wholesale.

### 8.1 Required public/build variables

| Variable | 1SP test | MSM test | FLZR test |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `wu6i3y0h` | `wu6i3y0h` | `wu6i3y0h` |
| `NEXT_PUBLIC_SANITY_DATASET` | `dev-dataset` | `dev-dataset` | `dev-dataset` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-09-16` | `2025-09-16` | `2025-09-16` |
| `NEXT_PUBLIC_CHANNEL` | `1spWeb` | `msmWeb` | `flizrWeb` |
| `NEXT_PUBLIC_SITE_URL` | actual 1SP test URL | actual MSM test URL | actual FLZR test URL |
| `DEPLOYMENT_TIER` | `test` | `test` | `test` |
| `MONOREPO_TEST_PROJECT` | `true` | `true` | `true` |
| `MONOREPO_TEST_SITE` | `1sp` | `msm` | `flzr` |

Set these for both Production and Preview environments. Preview values are needed even
though feature previews are skipped because the ignore guard itself needs the project
identity during candidate preview processing.

Do not use `https://1sp.agency` or `https://www.msm.digital` as
`NEXT_PUBLIC_SITE_URL` in a test project. Explicit URLs prevent the fallback in
`packages/utils/src/site-url.ts` from generating production-domain canonicals,
sitemaps, JSON-LD, or Open Graph URLs.

The shared deployment helper fails the build when a marked test project does not use
exactly Sanity project `wu6i3y0h`, dataset `dev-dataset`, the site/channel mapping in
this table, and an origin-only `https://*.vercel.app` URL. When Vercel exposes
`VERCEL_PROJECT_PRODUCTION_URL`, the configured public URL must match it exactly. This
is a hard boundary: an accidental `production` dataset value cannot create a Ready test
deployment. Each app's `next.config.ts` also supplies its expected site identity, so an
MSM build cannot pass with an otherwise self-consistent 1SP or FLZR configuration.

### 8.2 Full integration variables

The approved scope requires the following where used:

| Variable group | Requirement |
|---|---|
| `SANITY_VIEWER_TOKEN` | Test/draft viewer token for `dev-dataset` workflows |
| `SANITY_API_WRITE_TOKEN` | Dedicated test write token; never embed in client code |
| `SANITY_REVALIDATE_SECRET` | Unique high-entropy value per test project/webhook |
| Personio credentials | Prefer test or read-only credentials; set only variables used by the configured route mode |
| `DEVMODE` | Leave unset or `false` in Vercel |

Relevant Personio variables currently referenced by the apps include:

```text
PERSONIO_RECRUITING_TOKEN
PERSONIO_TOKEN
PERSONIO_ACCESS_TOKEN
PERSONIO_CLIENT_ID
PERSONIO_CLIENT_SECRET
PERSONIO_ACCOUNT_SLUG
PERSONIO_XML_FEED_URL
PERSONIO_APPLICATION_BASE_URL
PERSONIO_APPLICATION_URL_TEMPLATE
PERSONIO_JOBS_CACHE_SECONDS
```

Audit which Personio mode is actually selected before creating secrets. Do not populate
every alias with the same credential unnecessarily.

If the initial baseline cannot read a private `dev-dataset`, a dedicated read-only
viewer token may be added **Production-only** after Git connection and Production Branch
verification. Add write-capable, revalidation, and external integration secrets only to
the **Production** environment after the first Ready baseline has been verified as
`dev-dataset`, noindex, and tracking-free and after the `dev-dataset` snapshot exists.
Preview Deployments are disabled, so do not grant secrets to Preview unless a later,
documented use case is explicitly approved. Then redeploy and run the accepted-risk
integration tests.

Mark server-side tokens and secrets as Sensitive in Vercel. Environment changes require
a fresh deployment before they take effect:

- <https://vercel.com/docs/environment-variables>

### 8.3 Variables intentionally absent

Do not set:

- `NEXT_PUBLIC_MSM_GOOGLE_MEASUREMENT_ID`;
- `NEXT_PUBLIC_FLZR_GOOGLE_MEASUREMENT_ID`;
- `NEXT_PUBLIC_HOST_CHANNEL_MAP`;
- production-only GA, GTM, or Cookiebot overrides;
- any Sanity `production` dataset value.

The root 1SP GA ID is currently hardcoded in site config, so leaving an environment
variable unset is not sufficient. The code guard in the next section is required.

## 9. Public test-site SEO and tracking guard

The initial audit found these blockers:

- root metadata declares `robots.index=true` and `robots.follow=true`;
- MSM and FLZR do the same;
- all three `robots.ts` files allow crawling;
- 1SP has a production Google Analytics ID in `SITE_CONFIGS`;
- all three layouts load the production Cookiebot configuration.

Phase 1 now addresses them locally with one shared test-deployment guard based on
`DEPLOYMENT_TIER=test`; deployed behavior still needs Phase 5 verification.

Required behavior in test tier:

1. Metadata returns `index: false`, `follow: false`, `noarchive: true`, and
   `nosnippet: true` where supported.
2. `robots.txt` disallows `/` and does not advertise a sitemap for crawling.
3. Every response receives an
   `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` header.
4. Canonical, sitemap, JSON-LD, and Open Graph origins use the exact test project's
   `NEXT_PUBLIC_SITE_URL`.
5. `GoogleAnalyticsConsent` is not mounted.
6. `CookiebotBanner` is not mounted.
7. Vercel Analytics and Speed Insights remain mounted because their data is scoped to
   each new Vercel project.

This must be implemented as shared logic or a shared helper so the three apps cannot
drift into different indexing behavior.

Acceptance checks for every URL:

```text
GET /robots.txt                    -> Disallow: /
GET /                              -> X-Robots-Tag includes noindex and nofollow
rendered metadata                  -> robots noindex,nofollow
canonical and OG URLs              -> generated test URL, never a production domain
network requests after consent     -> no Cookiebot and no Google Analytics requests
Vercel project analytics           -> enabled only in the matching test project
```

`noindex` is a crawler directive, not access control. The sites remain publicly
reachable to anyone who has or discovers the URL.

## 10. Sanity configuration

### 10.1 Dataset boundary

All three projects must use `dev-dataset` in both public build variables and every
server-side Sanity client. The shared deployment helper rejects a marked test build
unless `NEXT_PUBLIC_SANITY_DATASET` is exactly `dev-dataset`; logs, generated content,
and a controlled write test provide additional runtime evidence that no alternate
client bypassed that build-time boundary.

Before every rollout, run:

```bash
pnpm doctor:sanity
node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs --channel 1spWeb --language en
node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs --channel flizrWeb --language en
node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs --channel msmWeb --language en
node --env-file=.env --env-file=.env.local scripts/sanity-doctor.mjs --channel msmWeb --language de
```

### 10.2 Exact CORS origins

After Vercel assigns the final three URLs, add each exact origin to Sanity project
`wu6i3y0h` under API/CORS settings.

Because the approved test scope includes Studio/draft workflows, enable credentials
only for the exact origins that require authenticated browser access. Never add a
credentialed wildcard such as `https://*.vercel.app`; Sanity explicitly warns that it
would trust unrelated sites hosted on the same platform:

- <https://www.sanity.io/docs/content-lake/cors>
- <https://www.sanity.io/docs/studio/embedding-sanity-studio>

### 10.3 Revalidation webhooks

Create three separate signed webhooks against `dev-dataset`:

| Webhook | Destination | Filter intent |
|---|---|---|
| 1SP test | `https://<1sp-test>/api/revalidate` | 1SP-assigned pages, menus, and global content |
| MSM test | `https://<msm-test>/api/revalidate` | MSM-assigned pages, menus, and global content |
| FLZR test | `https://<flzr-test>/api/revalidate` | FLZR-assigned pages, menus, and global content |

Each webhook should:

- target only `dev-dataset`;
- use the matching project's `SANITY_REVALIDATE_SECRET`;
- exclude draft document IDs;
- handle scalar page/menu `channel` values and array-based global content assignment;
- trigger every site to which shared global content is explicitly assigned;
- be tested by changing one document for each channel and observing cache freshness.

Content changes should revalidate content; they should not rebuild the Next.js app.

## 11. Known content scope

The content state is sufficient for infrastructure testing but not for a multilingual
launch.

| Site/locale | Test acceptance |
|---|---|
| 1SP EN | Supported |
| 1SP DE | Not part of this test scope; no complete DE homepage/menu |
| FLZR EN | Supported |
| FLZR DE | Known missing content; non-blocking |
| FLZR PL | Known missing content; non-blocking |
| MSM EN | Supported |
| MSM DE | Pages/homepage/menu exist; missing DE cases/services/people is non-blocking |

Do not interpret generated FLZR DE/PL routes or a successful build as proof that those
locales contain launch-ready data.

### 11.1 Known SEO limitations outside this infrastructure test

The shared structured-data module still hardcodes 1SP organization identity and a 1SP
fallback description. MSM and FLZR compile that shared module, so their current JSON-LD
can identify the site as 1SP even when its URL correctly uses the MSM or FLZR test
origin. In addition, MSM and FLZR locale routes currently emit locale-free canonicals;
for example, an MSM `/de` page can canonicalize to `/` instead of a locale-specific
URL. Complete `hreflang` alternates are not yet emitted.

These are accepted as visible test-phase defects only because every test response is
`noindex, nofollow`. They are blockers for any indexable domain or production cutover.
Before that later phase, structured data must read the active site configuration and
canonical/alternate metadata must match the supported locale strategy.

## 12. Full integration testing and accepted risk

The user approved full functionality on public test URLs and deferred route hardening.
This is acceptable only because the deployment is pinned to `dev-dataset`; it is not an
acceptable production configuration.

### 12.1 Current exposure

| Surface | Current behavior | Test-phase risk |
|---|---|---|
| `/api/contact` | Public POST writes a `contactSubmission` using the server write token | Spam and write/API usage |
| `/api/sync-relationships` | Public POST accepts document ID/type and runs relationship reconciliation | Unauthorized write activity and relationship churn |
| `/api/revalidate` | Supports signed webhook verification and a secret fallback | Secret leakage or unnecessary invalidations if misconfigured |
| `/api/draft-mode/enable` | Uses the server viewer token | Draft exposure if preview authorization/CORS is misconfigured |
| Personio jobs | Server route can call configured upstream credentials | Credential misuse, upstream rate usage, or accidental live-data dependency |

The relationship-sync endpoint does not expose the Sanity token, but it acts as an
unauthenticated public trigger for the server-held token. It also trusts the caller's
`documentType` instead of verifying it against the fetched document's `_type`, and its
writes are not restricted by the deployment's website channel. Because all three test
sites share `dev-dataset`, a relationship change initiated through one project can
affect content rendered by the others.

### 12.2 Controls required during the accepted-risk test phase

Even though endpoint hardening is deferred:

- create a separate robot token for each test project rather than copying the current
  production token;
- if the Sanity plan supports Custom Access Control, restrict each token to
  `dev-dataset` with the least capable dataset-scoped role;
- otherwise record that built-in write roles can cover every dataset in the Sanity
  project. In that case the build-time dataset guard limits normal application use, but
  a stolen token could still reach `production`; short lifetime, monitoring, and prompt
  revocation become mandatory residual-risk controls;
- never use a `NEXT_PUBLIC_*` name for a secret;
- keep a dataset export/backup before enabling the write token;
- inspect Sanity mutation history and Vercel logs during the test;
- delete test contact submissions after validation;
- rotate/revoke test credentials when this phase ends;
- do not reuse these credentials for a production deployment.

Verify the available role model before enabling public writes:

- <https://www.sanity.io/docs/user-guides/roles>
- <https://www.sanity.io/docs/content-lake/roles-concepts>

### 12.3 Mandatory future hardening before production

Before any real domain or `production` dataset rollout:

- rate-limit and add bot protection to contact submissions;
- require a server-only secret or signed authorization for relationship sync;
- verify `document._type === documentType` before sync;
- add audit logging for mutation triggers;
- require signed Sanity webhooks and remove weaker query-secret fallback if feasible;
- verify draft-mode authorization end to end;
- use production-specific least-privilege credentials.

These tasks are documented but intentionally do not block the approved test deployment.

## 13. Rollout sequence

### Phase 0 — protect the baseline

- [x] Confirm the current live 1SP URL still serves successfully.
- [x] Capture the current production deployment ID and rollback target.
- [x] Inspect the latest `main` Vercel failures separately; do not fix them as a side
      effect of this test-project rollout.
- [x] Confirm the existing 1SP project still tracks `main` and uses `production`.
- [x] Inspect `flzr-prototype` and record its branch, root, and environment settings.
- [x] On both existing projects, confirm the actual Root Directory and that the
      `multisite/test` copy of its `vercel.json` resolves to the branch guard.
- [x] Confirm `MONOREPO_TEST_PROJECT` is absent from both existing projects.
- [x] Before exposing system variables on either existing project, set/verify its
      explicit correct `NEXT_PUBLIC_SITE_URL`; then verify the Git-ref variables are
      available to the ignore command.
- [x] Verify the Vercel plan permits five projects on one repository and has enough
      deployment/concurrency capacity for ignored candidates plus intended builds.
- [x] Verify whether the Sanity plan supports dataset-scoped Custom Access Control;
      record the broader-token residual risk if it does not.
- [x] Export or otherwise snapshot `dev-dataset` before enabling public writes.

Phase 0 evidence: `https://www.1sp.agency` returned HTTP 200. The live rollback target
remained deployment `dpl_BL3KnMQf1zqhJDSVGYrtoh1LJ7f4` from 2026-05-14 while the
five latest `main` production attempts were in Error. The existing projects rejected
the `multisite/test` push through their Ignored Build Step, so neither compiled the
new monorepo baseline. The team is on Pro with one concurrent build slot; the three
test projects therefore use Standard build machines and were deployed serially.

### Phase 1 — prepare repository controls

- [x] Review and commit the intended monorepo revision; preserve unrelated working-tree
      changes.
- [x] Create and push `multisite/test` from the selected monorepo revision.
- [x] Add branch/project gating and shared-root dependency classification to
      `scripts/vercel-ignore.mjs`.
- [x] Add automated path-classification tests for the Vercel ignore script.
- [x] Implement the shared `DEPLOYMENT_TIER=test` indexing/tracking guard plus
      fail-closed dataset, project, site/channel, and generated-URL validation.
- [x] Update `.env.example` files to document `dev-dataset` test deployment values
      without committing secrets.
- [x] Clearly supersede stale Vercel deployment documentation.
- [x] Run all three builds, runtime SEO checks, deployment-guard tests, and dataset
      doctor checks.
- [x] Push `multisite/test`.

### Phase 2 — create the three projects

For each project, follow section 7.5 in order:

- [x] Create a blank, unconnected Vercel project; do not click Import-and-Deploy.
- [x] Set the approved project name and Root Directory before Git connection.
- [x] Set Node.js `22.x`.
- [x] For MSM/FLZR, enable outside-root source inclusion.
- [x] Disable Preview Deployments and native affected-project skipping.
- [x] Configure the permanent project-level branch wrapper.
- [x] Enable system environment variables.
- [x] Add `MONOREPO_TEST_PROJECT=true` and the matching `MONOREPO_TEST_SITE` to
      Production and Preview.
- [x] Add all required Sanity/channel/test-tier variables.
- [x] Do not add viewer, write, revalidation, or external integration secrets before
      Git connection and branch verification.
- [x] Leave custom domains empty.
- [x] Link the isolated local checkout to the new project, verify its project ID, and
      run `vercel git connect`.
- [x] Set Production Branch to `multisite/test` immediately after Git connection.
- [x] Confirm Git connection created no default-`main` candidate. If a future bootstrap
      creates one, it must cancel before install; otherwise delete and recreate the
      unpublished project.
- [x] Confirm the baseline does not need an authenticated read token; no token was added.
- [x] Create and record one Ready `multisite/test` baseline deployment per project.

Baseline release record (2026-07-11):

| Site | Project ID | Exact public URL | Ready deployment | SHA |
|---|---|---|---|---|
| 1SP | `prj_aGGAUdjJbb5Bmhip2tOIARP0lvkR` | `https://1sp-monorepo-test.vercel.app` | `dpl_6dDDEHQkiWkRiibfdJQdzxuehofG` | `5c9807270942c61405bdade3bb62495331aa41fe` |
| MSM | `prj_cfopf3J47m4cvxoepDSy24AmHZZK` | `https://msm-monorepo-test.vercel.app` | `dpl_FQTTnQKNLm5YLBjBirSe2TXkVVTy` | `5c9807270942c61405bdade3bb62495331aa41fe` |
| FLZR | `prj_p9sSCkEnWfan6uw2mMWQyhCpS64b` | `https://flzr-monorepo-test.vercel.app` | `dpl_EVDzBxnRHwdKrgAhWxokM2nvRNN9` | `5c9807270942c61405bdade3bb62495331aa41fe` |

All three exact URLs returned HTTP 200, emitted the strict `X-Robots-Tag`, served
`robots.txt` with `Disallow: /`, rendered strict robots and Googlebot metadata, used
the exact project URL as canonical, and contained no Google Analytics, Google Tag
Manager, or Cookiebot marker in the initial HTML.

The `dev-dataset` pre-rollout snapshot is
`/private/tmp/1sp-dev-dataset-pre-vercel-2026-07-11.tar.gz` with SHA-256
`400171076c205a8ff2909e4f94b74d352ace9b32754f2b9b0da3d268748c2852`. It is a local
operational artifact and must be copied to controlled durable storage before enabling
public mutation testing.

### Phase 3 — apply exact URLs and Sanity wiring

- [x] Reconfirm each actual generated Vercel URL and its
      `VERCEL_PROJECT_PRODUCTION_URL` value.
- [x] Confirm the corresponding `NEXT_PUBLIC_SITE_URL` is an exact match; redeploy only
      if it changed.
- [x] Verify the baseline is `dev-dataset`, noindex, and free of production tracking;
      confirm the `dev-dataset` snapshot exists.
- [ ] Add the approved viewer, write, revalidation, and external integration secrets as
      Sensitive **Production-only** variables, then redeploy for full integration
      testing.
- [ ] Add the exact origins to Sanity CORS; no platform wildcard.
- [ ] Create three signed, channel-aware `dev-dataset` revalidation webhooks.
- [ ] Confirm Studio/draft access only where intended.

### Phase 4 — prove deployment isolation

- [ ] Run the trigger probes from section 6.4, including the rename/move case.
- [ ] Confirm unaffected projects show custom `Canceled`, not Ready.
- [ ] Confirm no existing project compiles `multisite/test`.
- [ ] Confirm feature branches create no usable test preview.
- [ ] Save dashboard evidence for the release record.

### Phase 5 — application smoke test

For every test project:

- [ ] Homepage and representative page return 200.
- [ ] Representative case, service, and person/global-content flow is channel-correct.
- [ ] No content from another channel leaks into navigation, sitemap, or listings.
- [ ] `robots.txt`, metadata, and `X-Robots-Tag` block indexing.
- [ ] Canonical, OG, sitemap, and JSON-LD origins use only the generated test URL.
- [ ] No Google Analytics or Cookiebot request is emitted.
- [ ] Vercel Analytics and Speed Insights report only to the matching test project.
- [ ] Contact form creates a labeled test submission in `dev-dataset`.
- [ ] Draft mode renders an intentional draft and can be disabled again.
- [ ] A signed Sanity webhook refreshes changed content without rebuilding the app.
- [ ] Relationship sync is tested on disposable/known documents and mutation results are
      reviewed.
- [ ] Personio jobs and application links use the intended credential/mode.

Additional locale checks:

- [ ] 1SP EN.
- [ ] FLZR EN; DE/PL recorded as known missing content.
- [ ] MSM EN and DE; missing DE shared content recorded as known.

### Phase 6 — accept and operate

- [ ] Record the deployed SHA for all three projects.
- [ ] Record final project IDs, URLs, Root Directories, branch, and environment owners.
- [ ] Document how to rotate test credentials.
- [ ] Document how to pause deployments by changing the branch guard or disconnecting Git.
- [ ] Monitor Vercel build usage, function errors, Sanity mutations, and form spam.

## 14. Failure handling and rollback

### 14.1 App deployment failure

1. Do not change `main` or the existing production domain.
2. Inspect only the failed test project's build log.
3. Verify Root Directory, outside-root inclusion, pnpm version, Node version, and env.
4. Re-run the exact local build command.
5. Revert the failing commit on `multisite/test` or redeploy the last Ready test
   deployment while keeping **Use project's Ignore Build Step** enabled.

### 14.2 Wrong dataset or channel

1. Immediately disable the affected test deployment or remove its public alias.
2. Correct `NEXT_PUBLIC_SANITY_DATASET` or `NEXT_PUBLIC_CHANNEL`.
3. Redeploy; Vercel environment changes do not modify previous deployments.
4. Verify page/menu/global-content scope with `sanity-doctor` and live URLs.
5. Rotate a write token if it may have been used against the wrong dataset.

### 14.3 Accidental indexing or tracking

1. Disable the public test deployment.
2. Correct metadata, robots, header, canonical, GA, and Cookiebot guards.
3. Redeploy and verify with raw HTTP plus rendered HTML/network inspection.
4. If indexed, request removal in the relevant search console after the noindex fix is
   live.

### 14.4 Dev-dataset mutation problem

1. Remove/revoke the test write token from all three projects.
2. Disable the affected API route if necessary.
3. Inspect mutation history and restore from the pre-test export/snapshot.
4. Rotate credentials before resuming.

### 14.5 Excess or duplicate builds

1. Inspect all five connected project statuses for the same SHA.
2. Verify native unaffected-project skipping is disabled for the three test projects.
3. Verify `MONOREPO_TEST_PROJECT=true` exists in both Production and Preview only on the
   three new projects.
4. Verify system environment variables are exposed.
5. Inspect `VERCEL_GIT_COMMIT_REF`, `VERCEL_GIT_PREVIOUS_SHA`, and ignore-script logs.
6. Pause Git deployment on the misbehaving test project until the matrix is corrected.

## 15. Known risks and problems found

| Risk/problem | Severity | Plan response |
|---|---:|---|
| Latest `main` Vercel statuses failed | High for current release health | Investigate separately; do not couple to test rollout |
| Production still uses legacy page-builder arrays | Critical for a future main merge | Keep `production` untouched; no main merge in this plan |
| Existing Vercel projects also watch the repo | High for duplicate builds | Branch/project guard makes them ignore `multisite/test` |
| Normal Import-and-Deploy can start from default `main`, which lacks the guard | High for bootstrap isolation | Create unconnected projects, preconfigure the project-level wrapper/env, then connect Git |
| Old branches may lack the versioned guard and test-tier SEO code | High for preview isolation | Disable Preview Deployments at project level and retain the dashboard branch wrapper |
| Nested apps compile/import undeclared root-shared directories | High for automatic change detection | Disable native skip; explicit shared-path filter and probes |
| Ignored candidates count as full deployments and occupy concurrency | Medium | Check plan limits; accepted correctness tradeoff until dependencies become explicit packages |
| First/forced/unreadable diffs deliberately rebuild an allowed project | Medium for occasional extra builds | Establish baselines, monitor logs, accept conservative fail-open behavior |
| Test sites were indexable before Phase 1 | High | Resolved locally with shared metadata/header/robots guard; verify after deployment |
| 1SP production GA ID is hardcoded | High for analytics quality | Locally gated off for test tier; verify after deployment |
| Production Cookiebot config was mounted in all apps | Medium | Locally gated off for test tier; verify after deployment |
| Provisional FLZR/test URLs can be wrong before Vercel assigns the final slug | High for canonical correctness | Build rejects non-Vercel/custom/mismatched origins; verify exact generated URL |
| Example environment values could invite production-dataset mistakes | Medium configuration trap | Test examples/docs updated and marked projects fail closed unless dataset is `dev-dataset` |
| Public contact endpoint is unthrottled | High accepted test risk | Test-only token, monitoring, cleanup; harden before production |
| Relationship-sync route is unauthenticated and not channel-scoped | High accepted test risk | Backup/monitor/revoke; mandatory auth/type validation before production |
| Built-in Sanity write tokens may cover `production` as well as `dev-dataset` | High credential risk | Prefer dataset-scoped custom role; otherwise use separate short-lived tokens, monitoring, and revocation |
| 1SP sitemap now filters cases by `1spWeb` | Medium for a future main merge | Correct for test isolation; verify every production case assignment before any main merge |
| Three apps duplicate substantial code | Medium maintenance risk | Do not refactor during deployment rollout; track separately |
| FLZR DE/PL and MSM DE content gaps | Low for infrastructure test | Explicit non-blocking content limitations |
| MSM/FLZR JSON-LD still uses hardcoded 1SP identity | Medium for public noindex test; high for future SEO | Record as accepted test defect; make structured data site-aware before any indexable rollout |
| MSM/FLZR locale routes use locale-free canonicals and lack complete `hreflang` | Medium for public noindex test; high for future SEO | Keep test sites noindex; define and implement the locale SEO contract before production |
| Feature previews are disabled by decision | Operational tradeoff | Require local/CI validation before merge to `multisite/test` |
| Dashboard UI was logged out, while CLI/API authentication worked | Low operational limitation | Live settings were read back through authenticated CLI/API; use dashboard login only for UI-only controls |
| Enabling Speed Insights on Pro has a per-project monthly base fee | Medium cost risk | Keep disabled until the owner explicitly approves the current Vercel charge for all three projects |

## 16. Explicit non-goals and future production cutover

This plan stops after the three `dev-dataset` test projects are stable.

It does not perform or approve:

- the unified-content migration on Sanity `production`;
- cleanup of legacy `content1sp` or `contentStudioFlizr` fields;
- a merge of `multisite/test` or the current monorepo branch into `main`;
- changing MSM/FLZR test projects to real production domains;
- repointing any project from `dev-dataset` to `production`;
- route-security hardening implementation;
- moving the root 1SP app into `apps/1sp-web`;
- refactoring duplicated application code.

It also does not approve indexable MSM/FLZR SEO while their structured-data branding,
locale canonicals, and alternate-language metadata remain unresolved.

A later production plan needs a new approval round covering dataset migration order,
editor write blackout, production branch alignment, domains, SEO/indexing, analytics,
tracking consent, webhook replacement, credential rotation, and rollback.

## 17. Definition of done

The test deployment strategy is complete only when:

- three new Vercel projects exist and point to the approved Root Directories;
- all three use `multisite/test`, `dev-dataset`, and the correct channel;
- `main`, the existing live project, and Sanity `production` are unchanged;
- after a Ready baseline and with a readable diff, a site-only commit builds and deploys
  only that site;
- root-shared/common-package changes conservatively build all three, while
  `packages/sanity-schema/**` builds only 1SP;
- first/forced/unreadable-diff builds are recorded as intentional fail-open exceptions;
- project-level Preview Deployments are disabled and feature branches create no usable
  test preview;
- existing projects do not build `multisite/test`;
- public test URLs are noindex/nofollow and use test canonicals;
- production GA and Cookiebot are absent;
- Vercel Analytics and Speed Insights remain project-scoped and functional;
- full integration smoke tests pass against `dev-dataset`;
- known locale gaps and accepted mutation-route risk are documented;
- known MSM/FLZR structured-data and locale-SEO defects are documented as future
  production blockers;
- rollback evidence and environment ownership are recorded.
