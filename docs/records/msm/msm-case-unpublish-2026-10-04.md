# MSM case publication update — 4 October 2026

The user authorized unpublishing the 17 projects marked `No` in `MSM_Projects_Liste-1.xlsx`, then checking the result. The operation targeted MSM's currently used staging dataset: project `wu6i3y0h`, dataset `production`, channel `msmWeb`, English and German.

## Applied change

Set `isPublished: false` on the 34 corresponding case documents (17 projects × two languages). These documents belong only to `msmWeb`; no shared-channel case required reassignment. The documents, content, translations, media and page references remain intact. The existing publication filters remove them from listings, navigation, homepage selections and public detail routes.

| Spreadsheet project | Client | Project title |
| --- | --- | --- |
| 1 | Minimax | Virtual factory tour |
| 3 | .now | Right now / dotnow |
| 5 | UBS | UBS, we did it again! |
| 9 | UBS | Hunting for talent |
| 11 | Eppendorf | Security only a click away |
| 13 | Warner | Brick by Brick PR |
| 17 | Förde Sparkasse | The 5-star-strategy |
| 20 | EDEKA | Recruiting done differently |
| 24 | Coop | Queue-less |
| 27 | Decivisual | Modernizing branding and design |
| 29 | Reifen Helm | Pole Position in the digital hemisphere |
| 35 | Can Do | Yes, we Can Do! |
| 36 | Tech Company | Escape the Room! |
| 42 | HERMES Arzneimittel | Being YOU being real |
| 43 | Electronic Arts | Scoring PR Goals with FIFA |
| 47 | Coca-Cola | The CokeCube – sustainably digital |
| 56 | nespresso | Let there be light in the marketing plan |

The guarded script is `scripts/msm-unpublish-no-cases.mjs`. A dry run confirmed 34 changes, zero shared cases and zero drafts. All original documents were backed up before one transaction using `ifRevisionId` on each patch.

Transaction: `9xwYgO7OlTajAgagjoH513`.

Ignored recovery evidence is under `EXPORT/msm-case-unpublish-2026-10-04/`: `audit.json`, `plan.json`, the timestamped `before-*.json` backup, `after.json`, `receipt.json`, and `local-verification.json`. The backup has a SHA-256 checksum in the plan. Reversing the operation requires restoring the prior publication flag with fresh revision guards; it does not require reconstructing content.

## Recheck

- Fresh Sanity reads confirmed all 34 flags are false and all case content is preserved. Publication flags and channel assignments of all other case documents were compared with the original inventory and remained unchanged.
- English published cases changed from 69 to **52**: all 47 `Yes` projects plus the five additional cases absent from the spreadsheet.
- German published cases changed from 63 to **46**: all previously available `Yes` projects. The previously missing German MR-Showroom remains missing.
- The local layout cache was refreshed with the existing `/api/revalidate-home` endpoint. The local webhook secret was absent, so authenticated tag revalidation was not used.
- The local `/api/cases` responses returned **52 English / 46 German** cases, zero targeted `No` IDs and all expected approved IDs.
- All **34 public detail URLs returned HTTP 404** after the refresh.
- Browser inspection confirmed the German homepage now contains eight selected cases, down from thirteen. Its five `No` projects (.now, Eppendorf, EDEKA, Coop and HERMES Arzneimittel) are absent. Screenshot: `.impeccable/review/msm-homepage-after-unpublishing.jpg`.
- Script syntax and `git diff --check` passed. No frontend implementation change, rebuild, deployment, commit or push was required.

This establishes the CMS update and its local website result. It does not establish a separate deployed MSM environment's cache state.
