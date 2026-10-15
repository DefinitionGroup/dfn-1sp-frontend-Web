# MSM workbook Unit alignment — 5 October 2026

The earlier [person assignment update](msm-person-assignments-2026-10-05.md) changed contacts and person profiles only. After the user requested Unit consistency too, the workbook's explicit Unit values were applied as definitive to MSM Unit attribution.

## Scope and result

Source: `/Users/martin/Downloads/MSM_Projects_Liste_GM.xlsx`, unchanged SHA-256 `7f971c0ff4d9221044f74ae0359a3c96523c91fd31200fd816d8b8ec554ff743`. The existing, reviewed case matching uses exact source URL slugs for 64 rows and exact current titles for the four imported projects; verified translation metadata supplies German counterparts.

Workbook aliases resolve to the existing same-language units: `Labs` → AR / VR Labs (`xr-labs`), `Comms` → Communications, `Channel` → Channel Marketing, `Tech` → Technology Systems. Comma-separated entries assign every named Unit, independent of the person's home Unit.

Compared 51 English cases with explicit Unit values and 46 existing German counterparts. Nineteen mismatches were corrected: 11 English and eight German. All 97 now match the workbook exactly. The 17 source rows without Unit values, unrelated case memberships, Unit leadership/content and all case documents remain unchanged. Klett has an explicit Labs value despite lacking a named Head; its existing Labs assignment and inactive publication flag remain unchanged.

Changes include:

- Show-kitchen moved from Channel Marketing to Labs, English and German.
- Microsoft ExpertZone and Turtle Beach now belong only to Communications, English and German.
- Angry Birds/Hatch gained Technology Systems alongside Communications, English and German.
- Migros and dishwasher VR now belong only to Labs, English and German.
- Parrot gained Channel Marketing alongside Technology Systems, English and German.
- German SEA LIFE gained Technology Systems alongside Channel Marketing; English already matched.
- CUPRA and Lufthansa gained Labs. Microsoft's 20-year case gained Channel Marketing. Amazon Fallout gained Channel Marketing and Communications.

## Storage, backup and verification

MSM attribution is stored in `msmUnit.caseStudies[]` and derived for case views. The shared global `caseStudy.units` relationship was not modified. This follows the [Unit ownership decision](../../../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md).

Target: Sanity `wu6i3y0h/production`, the current MSM staging dataset. The environment doctor confirmed that project/dataset and the MSM channel. Live 1SP's `dev-dataset` was not mutated.

One revision-guarded atomic transaction, `GVG1viFRd0GjyaUDdLCLIJ`, changed seven published Unit documents: 12 case references added, 13 removed. No Unit drafts existed at planning or apply. Only the `caseStudies` arrays changed; no Unit draft content was published.

Fresh authenticated queries at `2026-10-05T15:15:10.319Z` verified zero remaining mismatches across all 97 explicit assignments, published/effective agreement, preservation of all unrelated Unit fields and memberships, and exact equality of every MSM case document before/after. The hosted beta XR Labs page was refreshed and displayed the newly assigned show-kitchen, CUPRA and Lufthansa projects alongside its existing cases.

Ignored recovery directory: `EXPORT/msm-unit-assignment-apply-2026-10-05/`. It contains `before.json` (complete originals of seven changed Units), `scope-before.json`, `plan.json` (row-level before/after comparisons and exact patches), `transaction.json`, `after.json`, `verification.json`, the execution script `align-units.mjs` and `xr-labs-assigned-cases.png`. Backup SHA-256: `1811628786a0b1e3ba7c0355a770658394b32f7dd5f1c14476185956c74cae26`.

For a requested rollback, compare current memberships with `after.json`, reverse only this plan's reference additions/removals and guard against newly inspected revisions. Preserve subsequent edits, unrelated references, their ordering and Unit content. Do not replace complete documents from the archive over later work. `--verify` is read-only; do not rerun `--plan` in the recovery directory because it would replace its originals.
