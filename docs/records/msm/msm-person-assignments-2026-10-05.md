# MSM workbook person assignments — 5 October 2026

Applied the user-approved workbook proposals as definitive for case contacts and MSM person-profile case selections. Source: `/Users/martin/Downloads/MSM_Projects_Liste_GM.xlsx`, SHA-256 `7f971c0ff4d9221044f74ae0359a3c96523c91fd31200fd816d8b8ec554ff743`.

## Result

All 50 English cases with named workbook heads and their 45 existing German counterparts now have the workbook person as their sole primary contact. Those cases appear in that person's MSM profile selection and were removed from other MSM profile selections. The 18 workbook rows without a named head, two cases outside the workbook, unrelated profile selections, other website editions, and publication flags were preserved.

| Workbook head | English cases | German counterparts |
| --- | ---: | ---: |
| Camillo Stark | 9 | 6 |
| Lennart Scheel | 13 | 12 |
| Nils Kedeinis | 9 | 8 |
| Kirsten Hücker | 5 | 5 |
| Nikolas Angerstein | 5 | 5 |
| Sven Weber | 4 | 4 |
| Maic Ungermann | 3 | 3 |
| Timo Studt | 2 | 2 |
| Total | 50 | 45 |

Workbook Niko/Nikolas spelling variants resolve to the existing Nikolas Angerstein documents. CUPRA's contact changed from Lennart Scheel to Camillo Stark; Microsoft's 20-year case changed from Sven Weber to Lennart Scheel. Camillo's English and German MSM profile editions were added with his existing `camillo-stark` slug and the assigned case references, without authoring new biography text.

## Mutation and verification

- Target: Sanity `wu6i3y0h/production`, MSM staging. Live 1SP's `dev-dataset` was not mutated.
- One atomic transaction: `q3TmcawVlts6ghyzODH7R9`, committed at `2026-10-05T15:05:42.631Z`.
- 103 documents changed: 85 published case documents, the existing English show-kitchen draft, and 17 person documents. Ten published English contacts already matched and required no mutation.
- Only `caseStudy.people` and MSM selections within `person.siteContent` changed. 29 incorrect profile references were removed and 35 missing references added across both languages.
- Every patch used its inspected `_rev` as an `ifRevisionId` guard. The existing show-kitchen draft received only its contact change; its pending editorial content was not published.
- Fresh authenticated queries verified all 95 case/person mappings, exclusive ownership of the mapped profile selections, preservation of unrelated fields in changed documents, and exact equality of the 54 untouched MSM documents. Object comparison uses structural equality, allowing Sanity to reorder object properties.
- Hosted beta checks verified Camillo's English profile renders all nine cases and German profile all six counterparts. The CUPRA case renders Camillo as contact after its ordinary cache refresh. No deployment or cache-configuration change was required. The local port 3004 server was unavailable, so rendered checks used the beta deployment.

## Recovery files

Ignored output directory: `EXPORT/msm-person-assignment-apply-2026-10-05/`.

- `before.json`: complete originals for all 103 changed documents; SHA-256 `371ed8620efccc133349fb504066ffaff15dfb68e8f0742601ecf884e5ac6bd0`.
- `scope-before.json`: full pre-apply MSM case/person scope.
- `plan.json`: exact field sets, assignments, original revisions, source-row provenance.
- `manifest.json`, `transaction.json`, `after.json`, `verification.json`: scope, receipt and verification evidence.
- `apply-assignments.mjs`: execution and verification script; `--verify` performs no writes. Do not rerun `--plan` in this directory because it would replace recovery originals.
- `camillo-profile-en.png`, `camillo-assigned-cases-en.png`: hosted browser proof.

For a requested rollback, re-read current documents and compare their affected fields with this transaction's `after.json`. Restore only the saved `people` fields and changed MSM edition/selection fields, preserving any subsequent edits and all other website editions. Guard each rollback patch against the newly inspected revision; unset fields that were originally absent rather than writing a fabricated empty value. Do not recreate whole documents from the backup over later editorial work.
