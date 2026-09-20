# Sanity data structure optimization recipe

Status: **Deferred — resume after the current content work.**

Recorded: 2026-09-20. This document preserves a proposed sequence; it does not authorize a migration. Refresh the evidence and confirm scope when the work resumes.

## Purpose and boundaries

Reduce repeated attribute paths while preserving shared identity, independent channel content and the existing editing experience.

- Keep **Globals**: cases, services, people and clients remain shared entities with explicit channel assignments.
- Keep channel editions and intentional differences in copy, SEO, media and case narratives.
- Keep each site's renderer, blocks and visual identity.
- Keep document-level localization and the existing page `content[]` model.
- Do not duplicate global cases per website, flatten rich text, serialize content into JSON strings, or split datasets merely to reduce attributes.

Background: [original attribute analysis](records/sanity/SANITY_ATTRIBUTE_MODEL_OPTIONS.md), [Stage 1](records/sanity/SANITY_MEDIA_STORAGE_STAGE1.md), [Stage 2](records/sanity/SANITY_MEDIA_STORAGE_STAGE2.md), and [MSM migration/publication](records/msm/MSM_CONTENT_MIGRATION.md).

## Recorded baseline — refresh before use

On 2026-09-20, the production dataset in project `wu6i3y0h` reported **1,567 / 2,000 attributes**, leaving **433** available (78.35% utilization). The project warning threshold is 80%.

Stage 1 reduced the live count from 1,991 to 1,751; Stage 2 reduced it to 1,592. Following MSM publication, the count was 1,567. Publication itself is not an optimization strategy.

Independent in-memory simulations used `EXPORT/msm-publication-20260920/after.json` (911 records). That snapshot's analyzer counted 1,561 attributes, six fewer than the live quota response. These are directional estimates, not guaranteed live outcomes, and their savings must not be added together.

| Candidate | Estimated reduction | Scope and interpretation |
| --- | ---: | --- |
| Root case `casesPageBuilder[]` → `content[]` | 66 | 244 affected records; no existing `content` collisions in this snapshot. Recommended next structural change. |
| Referenced case compositions with root `content[]` | 80 | Moves 244 root bodies and one embedded edition body. Alternative to the preceding row; only 14 additional attributes saved in this snapshot. |
| Referenced Cloudinary payloads | 428 | Moves 1,156 embedded asset occurrences into document-root payloads, without deduplication. Illustrative broad scope; final placement fields and schema will change the result. |
| Numbered tab fields → `items[]{title, content[]}` | 14 | One stored tabbed block; lower priority. |

Eight MSM Unit records had `image`, none had legacy `heroMedia`, and four retained `heroImageSource`. The URL query still supports legacy fallbacks. Do not delete these fields without proving that their values and consumers are superseded; removing an unused schema declaration does not free attributes.

## Stage 3: align shared case-body storage

Objective: store the shared case body under root `content[]`, matching pages, while retaining the current frontend data contract and channel-edition behavior.

1. Refresh the complete dataset inventory, official attribute count, field collisions and all readers/writers of `casesPageBuilder`. Include draft and published documents, scripts, previews and Studio copy/reset actions.
2. Re-run the simulation on a fresh export. Measure the temporary overlap as well as final savings. Do not rely on the recorded 66-attribute estimate.
3. Add compatibility readers for old and new storage. Query output can continue exposing `casesPageBuilder` to existing renderers. Define precedence explicitly, including intentionally empty arrays.
4. Update the case schema and Studio edition-copy behavior to use the canonical root field. Preserve channel-specific bodies, `bodyMode`, block order, `_key` values and all editorial data. Moving nested edition bodies is outside this stage.
5. Exercise the migration and editing workflow on a disposable dataset before applying it to production.
6. Make and verify a fresh production backup. Dry-run exact revision-guarded mutations and compare resulting document bodies against the intended field move.
7. Ensure every deployed consumer of the target dataset can read the new shape before removing old stored fields. A local Studio change alone is insufficient. Coordinate any deployment separately.
8. Apply controlled batches; stop and re-inventory on revision conflicts. Preserve draft/published separation and do not publish unrelated drafts.
9. Verify all affected site/channel/language flows, shared and custom case bodies, Studio editing, preview, edition copying, routes, media and published output. Run relevant checks/builds, including existing 1SP behavior.
10. Remove residual legacy root values only once consumers and editing paths are verified. Re-query official statistics and record the actual result.

Key implementation entry points:

- `packages/sanity-schema/src/Global/Cases/caseStudy.ts`
- `packages/sanity-schema/src/Global/Cases/caseWebsiteContent.ts`
- `packages/sanity-schema/src/Global/Cases/CaseEditionInput.tsx`
- `packages/sanity-queries/src/case-presentation.ts`

## Stage 4: prototype shared media references

Objective: avoid storing the same provider payload at many nested paths. Start with a disposable-dataset prototype, then decide whether the measured benefit justifies production implementation.

Proposed ownership:

```text
Shared media document
  Cloudinary identity, delivery data and required asset metadata

Media placement in a page, case or edition
  reference to shared media
  usage-specific alt text, crop, focal point and presentation choices
```

Before selecting the final schema:

- Inventory differences between payloads sharing a Cloudinary ID. Do not silently merge differing editorial metadata, transformations or asset versions.
- Define what is shared and what belongs to a placement, including replacement semantics and the effect of shared edits on other sites.
- Preserve required URLs, dimensions, duration, delivery version, video information and helper fallbacks.
- Prove picker selection, replacement, array insertion, dereferencing, draft preview and publication behavior. The earlier Cloudinary picker and Presentation iframe checks were inconclusive; resolve them first. A working direct draft frontend is not sufficient evidence for Presentation.
- Define reference strength, publication order, deletion protection and unused-media handling. Do not introduce automatic asset deletion.
- Measure query behavior and actual response size; attribute reduction alone does not prove a runtime performance improvement.
- Recalculate final and peak migration attributes with the complete proposed shape, including local placement fields.

Only proceed to production with a validated editor experience, compatibility rollout, fresh verified backup, guarded migration, cross-site checks and a tested rollback procedure.

## Defer unless new evidence changes the decision

- **Separate case-composition documents:** useful if independent channel bodies become widespread, but currently add publication/preview complexity for modest additional savings. Keep small overrides embedded. A channel-specific body must remain an intentional composition, not a positional patch against another site's blocks.
- **Tabbed content consolidation:** clean up when revisiting the component, preserving tab order, labels, rich text and its two-tab presentation.
- **Presentation-field reduction:** adopt purposeful variants where justified by design; preserve editorial control and site identity.
- **Legacy fields:** remove only proven obsolete stored values. Small cleanups are maintenance, not the primary capacity strategy.

## Risks and release gates

| Risk | Required mitigation |
| --- | --- |
| Older app or script stops reading/writing content correctly | Inventory consumers; deploy compatible readers before storage removal; update writers before cleanup can regrow. |
| Channel differences or intentional empty bodies are lost | Compare complete compositions and test shared/custom modes, copying and empty states. |
| Old and new paths temporarily exceed capacity | Simulate peak overlap and choose a bounded cutover; reassess capacity before applying. |
| Editors create new revisions during migration | Guard revisions; stop on conflicts; re-read and re-plan rather than overwrite. |
| New references complicate drafts, publication or deletion | Validate those workflows in the prototype and define ownership/publication rules. |
| Rollback overwrites subsequent editorial work | Retain per-document before/after records; use revision-aware restoration. Treat whole-dataset restore as a separate recovery decision. |

The read-only capacity command is `pnpm doctor:sanity-capacity`. Its script supports `--fail-on-warning` for preflight/CI use. Always verify its resolved project and dataset. Local simulations estimate savings; the non-stale official statistics response is the quota authority.

Sanity counts populated path/datatype combinations. A stored path stops counting only after its final occurrence is removed; changing Studio labels or schema declarations alone does not recover capacity. See [Attribute limit](https://www.sanity.io/docs/content-lake/attribute-limit) and [Technical limits](https://www.sanity.io/docs/content-lake/technical-limits).

## Resume checklist

1. Read this recipe and the completed-stage reports.
2. Refresh environment, dataset, backup, inventory and live statistics.
3. Recalculate the options against content added since this document was written.
4. Confirm the Stage 3 scope and rollout boundaries with the user.
5. Implement one stage, verify it, record actual savings and reconsider the next stage.
