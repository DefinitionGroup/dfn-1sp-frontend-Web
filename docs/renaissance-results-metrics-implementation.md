# Renaissance Results — implementation and verification

Implemented and published 19 September 2026 through the local Studio/frontend and Sanity at `wu6i3y0h/production`, `renaissanceWeb/en`. **60 published cases now contain 107 Results groups and 248 metrics.** Four cases retain narrative or ranking-led Results without counters; six intro-only cases remain without Results. The Renaissance case template no longer shows the unit/person Powered by block.

## Content and ownership

The existing `resultsMetrics` block groups figures by outcome and measurement period. It supports individual explanations/context, explicit scale and decimal precision, qualifiers, prefixes and static/count-up display. Numeric storage uses the underlying amount; old value/suffix pairs remain compatible. The shared 1SP, FLZR and MSM renderers understand the optional fields while retaining their existing layouts and legacy metric behavior.

All measurements derive from the approved v4 workbook; they have not been independently fact-checked. UVPM, UMV, potential reach, subscribers, views, review scores and growth retain their distinct meanings. Exact totals, approximations, quotes and timeframe differences are preserved. There are no counters invented from ranks or dates. The [complete mapping](renaissance-results-metrics-mapping.md) records every group, original metric claim, explanation and source cell; the [row-status ledger](renaissance-rewrite-v4-row-status.csv) points to the saved block keys.

Case identities remain global. The shared STALKER 2 case changes only its Renaissance website-edition body; its shared default and other website editions remain intact. The migration initially preserved all 289 published documents and unrelated drafts. The later authorized [publication](renaissance-content-publication.md) published the Renaissance set, with other channel content and all 11 unrelated drafts preserved. No frontend deployment, commit or push was performed.

## Presentation

Renaissance uses content-height Ink sections, white compressed typography and hairlines, with a mobile stack and two/three-column desktop metric groups. The first anchor remains `#results`; subsequent groups have stable unique anchors. Counters animate once when visible over 1.4 seconds, reserve final-value width and use tabular numerals. Server output and assistive technology receive final values. Reduced motion shows final values immediately; subsequent CMS edits settle without replay.

Review [Gamescom 2025](http://localhost:3003/cases/gamescom-2025#results), [Dune](http://localhost:3003/cases/dune-awakening#results), [Dave the Diver](http://localhost:3003/cases/dave-the-diver-in-the-jungle-dlc#results) and [Autonauts](http://localhost:3003/cases/autonauts#results). These published pages are available without a draft session. For future unpublished edits, open **Renaissance Preview** in the [local Studio](http://localhost:3000/studio); reopening it renews draft access after a frontend restart.

## Verification

- All 60 proposed case documents passed compiled Sanity schema validation with zero errors.
- 40 focused source-mapping, formatting, rendering and resolver tests passed, plus a functional reduced-motion/CMS-edit test: **41 tests** in total.
- Renaissance, FLZR and MSM TypeScript checks passed. Renaissance and 1SP production builds passed.
- Local browser QA at 390px and 1440px verified count-up progression, final precision, distinct Dune timeframes, Autonauts attribution, unique anchors, removed Powered by and overflow/contrast behavior. The Walking Dead has narrative Results with zero counters; Felix the Reaper has no Results section.
- Local Studio verified the metric editor and list preview: the full amount `34000000000`, Billion scale, zero decimals and exact qualifier display as `34bn`; explanation, measurement context and count-up/static controls are available. No values were changed during this UI check.
- Every affected draft was re-queried and compared to its exact planned payload. The pre-publication audit verified 289 published documents and unrelated drafts unchanged; repeating the migration plans **zero changes**. The full v4 audit still accounts for all 169 source cells.

## Recovery and repeatability

The original pre-migration dataset backup is `EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z/production.tar.gz`, SHA-256 `4734999a00c1f3d95cb710966b1dde0552d597d2dc12fe1a6b7853f28008ef18`.

Ignored recovery files under `EXPORT/renaissance-rewrite-v4/results/` include the pre-migration `baseline.json`, revision snapshots and exact plans for each batch, `complete-mapping.json`, schema validation and `final-audit.json`. The final audit was recorded at `2026-09-19T15:29:51.318Z`. `latest-plan.json` is the final zero-change dry run, not the initial migration inventory.

`scripts/renaissance-results-import.ts` defaults to a dry run, checks explicit project/dataset, and applies only revision-guarded draft patches when requested. It uses the existing authenticated Sanity CLI; no interactive credential is copied into application environment files. `scripts/renaissance-results-audit.ts` was the draft-only migration audit and mapping generator. Current publication verification uses `RENAISSANCE_PUBLICATION_MODE=verify pnpm exec sanity exec scripts/renaissance-publish-content.ts --with-user-token`; the fresh pre-publication backup and exact evidence are linked in the publication record. Restore individual affected drafts from their snapshots if a rollback is required; review current revisions first rather than blindly restoring the entire production dataset.
