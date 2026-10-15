# Historical archive

These documents are **not the current work queue**. They retain useful rationale and evidence, but their branch, dataset, version, deployment and component-usage claims need fresh verification. No unfinished finding is assumed resolved simply because its document was archived.

Use the [documentation index](../README.md), [architecture](../ARCHITECTURE.md) and [deployment verification](../DEPLOYMENT.md) for current entry points.

## Early platform plans and handoffs

- [Handoff — Phase 1A complete in branch, production migration pending](platform/HANDOFF.md)
- [MSM channel launch (`msmWeb`)](platform/MSM_LAUNCH.md)
- [Multi-site platform — state of play](platform/MULTI_SITE.md)
- [Multisite Platform Plan](platform/multisite-platform-plan.md)

- [Early task list and January feature history](platform/TODO.MD) — unfinished entries require re-triage.

## Past audits and implementation investigations

- [Site Audit — Channel filtering, mode-drop, stale cache, performance](audits/AUDIT-2026-07-channel-cache-mode.md)
- [Component Cleanup Documentation](audits/CLEANUP-COMPONENTS.md)
- [MSM navbar glass — handoff / state of play](audits/MSM_NAV_GLASS.md)
- [Performance & Bundle Optimization Plan](audits/PERFORMANCE_PLAN.md)
- [Unused Components](audits/UNUSED.md)
- [StaggeredSlideUp Animation - Performance Update](audits/UpdatedStaggerAnimation.md)
- [Renaissance Web — Design Audit](audits/renaissance-design-audit-2026-08-11.md)

- [January Sanity performance refactoring record](audits/REFACTOR.MD) — includes historical implementation and measurements.

## Replaced guide versions

- [PageBuilder Component Creation Guide](guides/pagebuilder-guide-original.md)
- [Git Worktree Survival Guide](guides/worktree-guide-original.md)

- [Original PageBuilder component overview](guides/Components.MD) — superseded by the current PageBuilder guide.

## Archived operational records

- [July project memory](platform/project-memory-2026-07.md) — source and dataset snapshot from July, not current task state.
- [July test deployment plan](platform/test-deployment-plan-2026-07.md) — original test rollout boundaries and evidence.
- [Page-content migration runbook](migrations/unify-page-content-runbook.md) — recovery/migration reference; not a pending migration checklist.

## Obsolete deployment pointers and template

- [Former deployment guide pointer](guides/VERCEL_DEPLOYMENT.md) and [former deployment reference pointer](guides/VERCEL_DEPLOYMENTS.md): use the maintained [deployment verification guide](../DEPLOYMENT.md).
- [Sanity v5 template](templates/new-multisite-project-sanity-v5.md): historical version-specific blueprint; this checkout uses Sanity 6.

The directory was renamed from `docs/archive/` to `docs/archived/` on 21 September 2026. The [move manifest](../records/project/documentation-moves-2026-09-21.csv) records every relocation. Source/recovery information was retained; archival does not mark old findings as fixed.
