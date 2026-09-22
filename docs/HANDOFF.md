# Whole-project handoff

Reviewed 21 September 2026 against the local checkout. This is the entry point for the **entire 1SP multisite platform**, not only service consolidation. Use [the documentation index](README.md) for task-specific guides, [the feature map](PROJECT_FEATURES.md) for implementation locations, and [operations](PROJECT_OPERATIONS.md) for previews, data changes and verification.

## Establish the current state

1. Read [AGENTS.md](../AGENTS.md), this handoff and the target app's design guide when changing its frontend.
2. Inspect `git status`, branch and HEAD. At review: `multiseite/stage`, commit `e31b074917e01e011d567c94766244e2a2a34b04`, with substantial uncommitted code, schema and documentation changes. The code inspection in these documents includes those local changes; a checkout of that commit alone will differ.
3. Identify the app, channel, language, dataset and published/draft perspective. Verify environment and content with [local Sanity diagnostics](local-sanity-debugging.md) before diagnosing missing content.
4. Find the relevant renderer, schema, query and current editing owner using [the feature map](PROJECT_FEATURES.md). Read dated records only for evidence and rationale.
5. Before publishing or releasing, establish the requested scope and current provider state using [deployment verification](DEPLOYMENT.md). Old approvals recorded in archived runbooks are historical.

Orientation is complete when the target environment, current worktree, content ownership and affected consumers are known. No application, dataset, schema, hosting or Git publication was changed by this documentation task.

## Platform at a glance

| Website | Runtime | Local port | Channel | Configured locales |
| --- | --- | --- | --- | --- |
| 1SP and embedded Sanity Studio | Root Next.js app | 3000 | `1spWeb` | EN |
| FLZR | `apps/flzr-web` | 3001 | `flizrWeb` | EN, DE, PL |
| MSM | `apps/msm-web` | 3002 | `msmWeb` | EN, DE |
| Renaissance | `apps/renaissance-web` | 3003 | `renaissanceWeb` | EN |
| Studio CO2 | Configuration only; no independent app | — | `studioco2Web` | EN, DE |

Configured locales do not establish translated content completeness. Commands are maintained in [the root README](../README.md); versions in [package.json](../package.json), [the lockfile](../pnpm-lock.yaml) and [.nvmrc](../.nvmrc). Current stack: pnpm workspace, Next.js App Router, React, Sanity, Motion React and Cloudinary, with Three.js/R3F features in parts of the frontend.

The root 1SP app is the established production baseline. Preserve its routing, SEO and deployment behavior when changing shared code. Each newer app owns its shell, routing, theme, page composition and renderer. Shared packages own site configuration, schema, queries, types and utilities. Some app components/API implementations are copied or still depend on root modules; independent app roots do not imply complete code isolation.

## Content and editorial ownership

**Keep Globals.** Cases, services, people, clients and global units are reusable identities, filtered by channel and language. Assignment makes an item available to a website; it does not create a separate copy. Pages, menus and settings belong to a website. MSM's `msmUnit` is a separate site-owned model, not the global `unit` type.

- Pages store blocks in unified `content[]`. App-specific builders render those blocks. The Studio helper text mentioning legacy per-channel page arrays is stale; those fields are no longer the current page schema.
- Cases retain root and website-edition `casesPageBuilder[]`. A later storage change is deferred. Website editions support intentional copy/media/body differences while retaining the shared case identity.
- Case edition “Start from shared content” creates a snapshot, not ongoing synchronization. “Use shared content” removes custom overrides. Custom body/media replace the corresponding shared selection, including intentional empty selections. Publishing the document publishes **all its editions**.
- Services have different consumers across the sites. [Service content](SERVICE_CONTENT.md) is the editing contract; [the service consolidation handoff](SERVICE_CONTENT_HANDOFF.md) is the proposed work queue. A service reference does not automatically replace page-builder narrative copy.
- Renaissance client collections, portrait and award compositions have site-owned contracts. Do not move or delete Globals merely because one site needs its own display identity; see [shared content](../apps/renaissance-web/docs/shared-content.md).
- Translation uses separate language documents with translation metadata. Configured languages and translation guidelines are implemented foundations; automatic translation/provider rollout is not established by those fields.

Approved rewrite copy takes editorial precedence for the scoped migrations. Preserve source mappings and intentional differences. Do not globally overwrite shared fields to resolve a single website's copy discrepancy.

## Site-specific behavior to preserve

### 1SP

The root app also hosts Studio at `/studio`. Its public routes are locale-free, internally rewritten to English; locale-prefixed URLs redirect to clean paths. Optional host-to-channel cookie behavior exists, but per-app deployment configuration remains important. Shared component groups, global galleries, forms, jobs, tracking and compatibility modules have consumers outside the root app.

### FLZR

FLZR has its own builder, navigation, visual language and localized routing. Legacy route aliases still matter for inbound links. Service destinations currently use a frontend map: seven service pages and an AI Solutions modal, with long page narratives separate from global service descriptions. Global descriptions also feed structured data. Case categories are a code-owned ID map, independent of service relationships. Do not confuse category filters with CMS channel assignment.

English content migration evidence is recorded; this is not a claim that every configured language is migrated or launch-ready. The [conversion plan](FLZR_CONVERSION_PLAN.md) remains proposed and covers **two separate journeys: client enquiries and recruitment**.

### MSM

The homepage is the visual reference for angular framing, badges, selection sequencing and motion. Preserve the site-owned dark case treatment and block composition. `DecryptRotator` controls headline scrambling; preview annotations must be cleaned from control values so drafts choose the same renderer/animation as published content.

MSM Units own references to cases and people; follow [the relationship decision](../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md). The Services directory, service carousel, global service editions and service pages are separate consumers, with the duplication documented in the service audit.

Local work includes a new `interactiveServiceCarousel` block, Motion-driven drag/wheel/autoplay behavior and case reveal changes. These exist in the dirty worktree and are not newly certified by this documentation pass. Check the relevant source and browser behavior before bundling them into a release.

### Renaissance

Preserve petrol/teal/sand styling, site-owned typography and the [design system](../apps/renaissance-web/design-system/README.md). English public URLs are locale-free; explicit English prefixes redirect and unsupported locale prefixes redirect to the homepage.

The homepage is CMS-first with an intentional authored fallback if the expected published page/content is absent. Check the dataset before editing the fallback. Section roles, anchors and navigation targets must remain aligned. Six services are backed by Globals. The case carousel is site-owned; Results use explanatory groups and count-up metrics, and Renaissance case pages omit the Powered by composition while retaining shared relationships.

A `newsCTABlock` renderer exists for temporal items; availability in the registry does not imply that a particular homepage currently contains it. Client logos and awards are separate composition concerns. The configured Renaissance deployment URL is a preview; no production domain is configured in site-config.

## Operational boundaries and known traps

| Trap | Required distinction |
| --- | --- |
| “Production” means the live site | Dataset name, Vercel environment name and actual public release are separate states |
| Test previews can use any dataset | The explicit monorepo test tier validates `dev-dataset`; recent migration records concern `production`. See [operations](PROJECT_OPERATIONS.md) |
| Studio looks current, so the frontend is current | Source schema, stored schema, Studio bundle, dataset, app deployment and caches are separate |
| Preview query string means draft session is active | Draft Mode must be enabled on the correct app origin; verify cookie/perspective and viewer-token setup |
| Publishing one website edition is isolated | Editions live in a shared document and publish together |
| Every animation comes from one global setting | Apps and blocks have separate motion implementations; verify each affected renderer and reduced-motion behavior |
| Shared documents imply shared visual layout | Queries/contracts are shared; app renderers and page narratives can differ |
| A backup filename proves recoverability | Verify project/dataset, contents, checksum, scope and restore procedure; document-only archives exclude asset binaries |
| An old cleanup audit authorizes deletion | Recheck usage and current requirements; archived findings are unresolved evidence until verified |

See [operations](PROJECT_OPERATIONS.md) for Draft Mode, revalidation, integrations, backup boundaries and a focused test matrix.

## Work remaining, by status

| Status | Workstream | Next step |
| --- | --- | --- |
| Audited, proposed | Service ownership consolidation | Resolve ownership and pilot MSM; preserve Renaissance references and FLZR modal/page behavior. [Scoped queue](SERVICE_CONTENT_HANDOFF.md) |
| Local changes require verification | MSM carousel/case motion, shared green `minimenu` membership button, schema wiring | Review dirty diff, test affected apps and browser interactions before commit/release |
| Small confirmed documentation/UI mismatch | Studio Content help text | Update source help text in a separately scoped code edit; page storage is already unified |
| Deferred by user | Attribute optimization Stage 3+ | Refresh live capacity; use [recipe](SANITY_DATA_STRUCTURE_RECIPE.md). Do not replay completed Stages 1/2 |
| Proposed | FLZR conversion improvements | Preserve two journeys; use [plan and source audit](FLZR_CONVERSION_PLAN.md) |
| Foundations plus proposed workflow | Translation | Recheck document coverage, guidelines, deployed schema and provider capability before pilot. [Strategy](SANITY_AGENTIC_TRANSLATION_STRATEGY.md) |
| Unverified in this review | Hosted Studio, provider settings, remote SHA, webhooks, current form/job delivery, live quota and launch readiness | Verify only for the next task's actual target |

The dated service audits record content state on 21 September. Migration/publication records preserve their own dates. Neither establishes that there are no drafts or outstanding editorial changes today.

## Supporting documentation

- [Feature map](PROJECT_FEATURES.md): where each major feature lives and its important quirks.
- [Operations](PROJECT_OPERATIONS.md): environment, preview, cache, integrations, backups and verification.
- [Architecture](ARCHITECTURE.md): content and app boundaries.
- [Service contract](SERVICE_CONTENT.md) and [service work queue](SERVICE_CONTENT_HANDOFF.md).
- [Documentation index](README.md): all maintained guides, proposals, design references and templates.
- [Dated records](records/README.md): migration source, publication and audit evidence.
- [Archived documents](archived/README.md): superseded plans and old procedures.
- [Consolidation report](records/project/project-handoff-review-2026-09-21.md): review scope, moved files, corrections and verification limits.

Keep this handoff as orientation. Update the owning guide for technical detail, the scoped plan for future work and a dated record for completed verification.
