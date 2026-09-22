# Handoff: multisite service content consolidation

Updated 21 September 2026. **Current phase: audits and documentation complete; service-model implementation is not authorized by this handoff.** This focused workstream is part of the [whole-project handoff](HANDOFF.md). Earlier migration approvals do not authorize a new service-data migration.

## Start here

1. Read [Service content](SERVICE_CONTENT.md) for current ownership and [Architecture](ARCHITECTURE.md) for platform boundaries.
2. Read the [cross-site audit](records/sanity/service-content-ownership-audit-2026-09-21.md); use the [MSM audit](records/msm/msm-service-content-audit-2026-09-21.md) and [CSV](records/msm/msm-service-content-audit-2026-09-21.csv) when working on individual service/page pairs.
3. Inspect the current worktree before implementation. At this handoff, branch is `multiseite/stage`, HEAD is `e31b074917e01e011d567c94766244e2a2a34b04`, and there are substantial uncommitted MSM carousel/motion, shared menu-button, schema and documentation changes. Preserve them; this handoff is not a clean-checkout or remote-push assertion.
4. Refresh scope and source data using [local diagnostics](local-sanity-debugging.md). The audits used `wu6i3y0h/production`, API `2025-09-16`, with explicit site/language filters. Read both published and drafts before preparing mutations.

Done with orientation when the intended site/language, dataset, actual Git state, affected consumers and pending drafts are identified. Then agree the implementation scope rather than replaying an old migration script.

## Verified outcome

- Pages already use `content[]`; obsolete Studio helper text still describes removed per-channel fields. This is UI-copy debt, not a pending page-storage migration.
- Renaissance's six cards and six Services sections reference Globals; preserve this working model.
- FLZR has seven independently authored service pages plus the AI Solutions modal. Its frontend-only service/page map and page-bypassed deliverables need explicit ownership. Descriptions still feed SEO.
- MSM has 33 valid service/page pairs: 29 exact prose copies, three partial copies and one POS Marketing EN trailing-`2` difference. All 33 selected media objects match. The directory has 32 approved rewrite teasers, while all six carousel cards use inherited generic summaries.
- No service data, schema, application code or publication was changed by the audits. Only audit documents and this documentation consolidation were added/edited.

Detailed IDs, draft distinctions, richer-page exceptions and source comparisons belong to the dated audits; do not duplicate their tables into future handoffs.

## Proposed work queue

| Order | Work | Completion evidence |
| --- | --- | --- |
| 1 | Agree the role of reusable service overview versus page narrative and choose one CMS-owned primary-page relationship direction | A field-by-field ownership decision, explicit precedence and unique site/language target rules; no bidirectional duplicate ownership |
| 2 | Pilot MSM PR for the simple duplicate case; separately reconcile POS Marketing EN against rewrite row 169 | Same approved rendered content, stable URL and block order, clear Studio edit location; no changes to shared base/other editions |
| 3 | Populate MSM edition summaries from the 32 approved directory teasers; use them consistently in carousel and directory | Exact source comparison, retained selection/order/CTA labels, no invented HashtagLove DE teaser; unchanged unrelated projections |
| 4 | Replace FLZR's hardcoded service/page map with the agreed CMS relationship | Seven correct page destinations and AI Solutions modal retained; valid references, no ambiguous targets or broken footer links |
| 5 | Review FLZR's seven descriptions and 40 stored deliverables for page use and catalog SEO | Explicit keep/reference/retire decision per field; useful content exposed by references where approved, distinct hero/card art direction preserved |
| 6 | Address remaining MSM duplicate long copy/media with the chosen model | HashtagLove EN/DE and Manufacturing retain richer sections; Training DE keeps its split prose/CTA sequence; all consumers and previews verified |
| 7 | Clarify Studio labels, inherited-source hints and navigation between records/pages | Editors can identify the actual source and destination; help text no longer promises nonexistent inheritance |

This order is a proposal for review, not permission to execute. Avoid building a universal body-sharing system unless the pilot demonstrates a real reuse requirement. Keep Renaissance intact as a regression control.

## Implementation and release conditions

Before data writes: fresh verified backup, exact document/draft inventory, a reviewable revision-guarded plan and a dry run. Stop on revision conflicts and re-plan. Preserve approved rewrite copy; avoid prose flattening, automatic two-way synchronization and unrelated publishing.

Verify global service resolution by channel/language, intentional empty values/media, preview and published perspectives, one primary landing page where applicable, selected order, card/footer destinations and SEO. Test Renaissance's existing references and FLZR's modal/page paths alongside the changed MSM flow. Run focused checks and affected builds; shared changes also need the root 1SP build. Use [release verification](DEPLOYMENT.md) for any separately authorized release.

The audit snapshots under `/private/tmp` are temporary extracts, not recovery backups. Dated records link earlier exports; confirm their existence and scope before use. A successful local build or a historical publication record does not verify a hosted release.

## Separate workstreams

- [Data structure / attribute optimization](SANITY_DATA_STRUCTURE_RECIPE.md): Stage 3 and later remain explicitly deferred. Service ownership cleanup does not authorize moving case bodies or introducing shared media documents. Refresh live capacity before resuming; old quota numbers are historical.
- [FLZR conversion plan](FLZR_CONVERSION_PLAN.md): still proposed. Preserve the two journeys (client enquiries and recruitment); service ownership work is not permission to redesign navigation or contact pages.
- Existing carousel/motion and `minimenu` changes: present in the dirty worktree, separate from this service-data proposal. Validate their current state before including them in any future commit/release. No commit, push or deployment was requested in this documentation turn.
- Hosted Studio, production frontend deployments, webhook delivery and current remote Git refs: not re-verified by this documentation review.
- PageBuilder helper typing: the generic `defineRegistry<Union>` signature does not enforce all missing-member cases. The package guide now documents an explicit `satisfies Required<BlockRegistry<Union>>` check; a helper API change would be separate work.

## Documentation map

- Current editing contract: [SERVICE_CONTENT.md](SERVICE_CONTENT.md).
- Resume/work queue: this handoff.
- Evidence: [records](records/README.md), including the [documentation review](records/sanity/documentation-review-2026-09-21.md).
- Historical procedures: [archive](archived/README.md), the archived July records and unified-page migration runbook. They provide history, not a current queue.

Update the handoff's phase and queue after an approved implementation is verified; preserve the original audit measurements as dated evidence.
