# Documentation

Start here for repository documentation. Organized and checked against the current source on **2026-09-20**. This review covers maintained Markdown documentation in the root, `docs/`, apps, packages and migration folder; generated output, private exports, vendor files and hidden tool artifacts are outside the catalog.

## Daily work

| Need | Read |
| --- | --- |
| Start an app or build it | [Repository README](../README.md) |
| Understand app and content ownership | [Architecture](ARCHITECTURE.md) |
| Diagnose missing or mismatched CMS content | [Local Sanity debugging](local-sanity-debugging.md) |
| Understand Globals channel/language filters | [Studio customization tutorial](<studiocustomize -tut.md>) |
| Edit Renaissance global services and understand inheritance | [Services and Globals browser](renaissance-global-services-and-studio.md) |
| Add a block | [PageBuilder guide](PAGEBUILDER_COMPONENT_GUIDE.md) |
| Handle nullable CMS data | [Null handling](SANITY_NULL_HANDLING.md) |
| Configure the root contact form | [Contact form](CONTACT_FORM.md) |
| Add the shared footer banner | [Footer external banner](footer-external-banner.md) |
| Use the Renaissance case carousel | [Case carousel](renaissance-case-carousel.md) |
| Verify a release | [Deployment verification](DEPLOYMENT.md) |
| Work in the correct checkout | [Worktree guide](WORKTREE_GUIDE.md) |

## Website-specific references

- **FLZR:** [app README](../apps/flzr-web/README.md); [content records](records/README.md#flzr).
- **MSM:** [app README](../apps/msm-web/README.md), [product](../apps/msm-web/PRODUCT.md), [design](../apps/msm-web/DESIGN.md), [domain context](../apps/msm-web/CONTEXT.md), [Unit relationship decision](../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md); [implementation and publication records](records/README.md#msm).
- **Renaissance:** [app README](../apps/renaissance-web/README.md), [product](../apps/renaissance-web/PRODUCT.md), [design](../apps/renaissance-web/DESIGN.md), [design-system guide](../apps/renaissance-web/design-system/README.md), [component contract](../apps/renaissance-web/design-system/COMPONENTS.md), [release checklist](../apps/renaissance-web/design-system/RELEASE-CHECKLIST.md), [shared-content guide](../apps/renaissance-web/docs/shared-content.md); [content records](records/README.md#renaissance).
- **Shared:** [context map](../CONTEXT-MAP.md), [PageBuilder package](../packages/pagebuilder-core/README.md).

## Planned work

- [FLZR conversion and information architecture plan](FLZR_CONVERSION_PLAN.md) — separate client-enquiry and recruitment journeys, prioritized from published content and desktop/mobile inspection; [source audit](FLZR_CONVERSION_SOURCE_AUDIT.md). Proposed, not implemented.
- [Data structure optimization recipe](SANITY_DATA_STRUCTURE_RECIPE.md) — **deferred by the user** until more content work is complete. Refresh measurements before starting Stage 3.
- [Translation strategy](SANITY_AGENTIC_TRANSLATION_STRATEGY.md) — foundations and proposed pilots; audit/provider status must be refreshed before rollout.

These are proposals, not completed migrations or automatic authorization to execute them.

## Completed work, history and templates

- [Completed-work records](records/README.md): copy mappings, publication evidence, backup provenance and implementation results. Preserve these for traceability; counts and outstanding items belong to the recorded date.
- [Historical archive](archive/README.md): superseded handoffs, audits and old guide versions. Useful rationale, not the current work queue.
- [Reusable templates](templates/README.md): new-project and conversion recipes, separate from this repository's setup.

The root [July project memory](../MEMORY.md), [July deployment plan](../deploymentplan.md) and [unified-page migration runbook](../migrations/unify-page-content/RUNBOOK.md) remain at their familiar paths with explicit historical scope. The old [deployment guide](VERCEL_DEPLOYMENT.md) and [deployment reference](VERCEL_DEPLOYMENTS.md) are compatibility pointers to the current release guide.

## What changed in this review

- Replaced the starter README and corrected obsolete app commands, languages and scaffold descriptions.
- Replaced the old PageBuilder paths and `content1sp` instructions with the current package-based, unified-page workflow.
- Reduced duplicated agent guidance to [AGENTS.md](../AGENTS.md) plus task-specific pointers in [CLAUDE.md](../CLAUDE.md) and [GEMINI.md](../GEMINI.md).
- Separated completed MSM/Renaissance/FLZR work and media cleanup records from future plans.
- Retired early platform handoffs that say the dataset is untouched or MSM does not exist. Moved old performance/component audits out of the active guide list rather than treating their findings as a current deletion list.
- Preserved source mappings, rollback notes and historical release boundaries. No CMS or deployment changes were part of this review.

## Keeping documentation useful

Give guides one canonical home; link to configuration and scripts instead of copying changing versions or provider settings. Record completed work under `records/<topic>/` and superseded investigations under `archive/`. Keep app design/product documents beside their app. Date measurements and deployment evidence. When a plan is implemented, link its outcome and change its status; avoid leaving it as an apparent next step.

Source code establishes repository behavior. A dated record establishes what was checked at that time. Live environment/provider checks establish current operational state.
