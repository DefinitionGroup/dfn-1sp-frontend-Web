# Whole-project handoff and documentation consolidation

21 September 2026. Scope: the complete local multisite repository, expanding the previous services-only handoff. Baseline branch `multiseite/stage`, HEAD `e31b074917e01e011d567c94766244e2a2a34b04`; substantial existing uncommitted code/schema/design work was preserved.

## Deliverables

- [Project handoff](../../HANDOFF.md): platform orientation, app-specific behavior, content ownership, operational traps and workstreams by status.
- [Feature map](../../PROJECT_FEATURES.md): source/schema/query/renderer pointers covering Studio, content, site features, media, motion, forms, jobs, tracking and SEO.
- [Operations](../../PROJECT_OPERATIONS.md): environment and routing differences, preview lifecycle, cache invalidation, publication, synchronization, backups and focused verification.
- [Focused service handoff](../../SERVICE_CONTENT_HANDOFF.md): preserved separately; it no longer stands in for the entire project.
- Reorganized [documentation index](../../README.md), root entry points, records, archive and template indexes.
- [Complete maintained-document inventory](documentation-inventory-2026-09-21.csv) and [move manifest](documentation-moves-2026-09-21.csv): classifications and reasons, including uppercase `.MD` files.

## What moved and why

**24 document relocations:** 23 into `docs/archived/`, plus the focused service handoff moved to its own name. Of the 23 archived relocations, 17 were already in the old `docs/archive/` directory and six were newly archived.

| Newly archived item | Reason |
| --- | --- |
| Root July `MEMORY.md` | Historical operational snapshot; its “current” branch/content claims no longer orient the whole project |
| Root `deploymentplan.md` | July rollout procedure and evidence, not current provider configuration or release authority |
| Unified-page migration `RUNBOOK.md` | Page storage is already unified; preserve rollback/procedure history without presenting a pending migration |
| `docs/VERCEL_DEPLOYMENT.md` | Redundant compatibility pointer; canonical release guide is `docs/DEPLOYMENT.md` |
| `docs/VERCEL_DEPLOYMENTS.md` | Second redundant compatibility pointer |
| Sanity v5 project template | Historical version-specific variation; current package declares Sanity 6 |

Older performance, unused-component and design investigations remain archived. Their findings were not treated as resolved or as permission to delete code. Historical prose, original measurements and migration scripts were preserved; paths were adjusted for relocation.

Recent migration mappings, source ledgers, publication evidence and current service audits remain in `docs/records/`. They are still necessary for provenance and recovery. The large Renaissance metric mapping stays at its established path because a script generates it there; its role is source evidence, not a general setup guide. Hidden tool artifacts, private exports and vendor/generated documentation were not reorganized.

## Verified facts and corrections

| Finding | Resolution in documentation |
| --- | --- |
| Previous HANDOFF covered service consolidation only | Whole-platform handoff plus dedicated service workstream |
| Root July history looked like current orientation | Moved to archive; current entry points point to the project handoff |
| Old archive directory differed from the requested location | Standardized on `docs/archived/`; repaired inbound and moved-document links |
| Three uppercase `.MD` archive files were outside the earlier lowercase-only catalog | Included in this inventory and local-link verification |
| Pages use `content[]`; Studio help text still describes obsolete channel fields | Documented as confirmed UI-copy debt; no schema/code change made |
| Cases still use root/edition `casesPageBuilder[]` | Documented current storage and deferred Stage 3 separately |
| Case edition copy is a snapshot; publication is document-wide | Added explicit editorial warning and source pointer |
| Runtime and preview environments have distinct constraints | Documented executable monorepo test-tier requirements and separated them from production-dataset migration records |
| Service inheritance differs among Renaissance, FLZR and MSM | Kept the current contract/audits and proposed queue as separate documents |
| FLZR category/service destinations include code-owned mappings | Added source pointers and ownership gaps; no migration implied |
| App routing is similar but not identical | Added per-app middleware behavior table |
| Local carousel/menu/motion changes are uncommitted | Marked as local source state requiring verification before release |
| Document-level backup excludes asset binaries | Documented actual script scope and recovery limitations |
| Source support can be mistaken for live functionality | Distinguished optional blocks, translated content, integrations and deployed state |

The earlier [service-focused documentation review](../sanity/documentation-review-2026-09-21.md) retains the detailed corrections to service ownership, contact API behavior, footer counts and PageBuilder helper typing. Its “retained in place” archival statements describe the earlier pass and are superseded by this move manifest.

## Remaining work and risk

- Service consolidation requires an agreed field/destination ownership model and a scoped implementation; Renaissance's working reference model is the regression control.
- Studio's stale Content description remains in source. Documentation now identifies it accurately; this task did not change application code.
- Existing MSM carousel/reveal and shared minimenu changes need their own code, browser and release verification.
- Attribute Stage 3+, FLZR conversion and translation pilots remain deferred/proposed as recorded in their guides.
- Separate app API implementations and residual root imports require cross-app regression checks when shared behavior changes.
- Current hosted Studio, provider configuration, webhook delivery, integration delivery, remote Git state, live quota and launch readiness were not verified by this documentation task.
- Prior backup and workbook locations are provenance references; their current availability and restorability must be checked before use.

## Validation scope

- Cataloged **89 Markdown documents**, including uppercase `.MD`: 35 current references, four proposed/deferred documents, 24 dated records, 23 archived documents and three template documents (including the template index).
- Checked local Markdown file targets across all 89: **zero missing targets**. This checks file existence, not external URLs or every heading anchor.
- Verified all 24 relocation destinations exist and the 23 archived files are under the requested directory. The original service handoff path was intentionally reused for the new project handoff.
- `git diff --check` passed.
- Compared hashes of pre-existing non-document files before/after: **no changes made by this task**. Existing application/schema work remains untouched.
- Application builds, browser QA, CMS publication, remote Git/provider checks and deployment were not run for this documentation-only change. No commit or push was requested or performed.
