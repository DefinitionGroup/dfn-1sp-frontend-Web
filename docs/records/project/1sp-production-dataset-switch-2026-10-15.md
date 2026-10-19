# 1SP production dataset switch: readiness audit, 15 October 2026

Question: can live 1SP (`main`, www.1sp.agency) and the remaining branches move from `wu6i3y0h/dev-dataset` to `wu6i3y0h/production`? Decision the same day: yes, in the same release as the `multiseite/stage` → `main` merge. The checklist is in [deployment verification](../../DEPLOYMENT.md#switching-live-1sp-to-production).

## Lanes and datasets (Vercel env pulled 15 October)

| Lane | Git branch | Dataset |
| --- | --- | --- |
| `dfn-1sp-frontend-web` Production (www.1sp.agency) | `main` @ `1d6780b37` | `dev-dataset` |
| `dfn-1sp-frontend-web` Preview and Development | every other branch | `dev-dataset` (same variable as Production) |
| `dfn-msm2026-prod` (www.msm.digital) | `msm/production` | `production` |
| `1sp-`, `msm-`, `flzr-`, `renaissance-monorepo-test` | `multisite/test` @ `7c5d15b3e` | `production` |
| `1sp-`, `msm-`, `flzr-`, `renaissance-beta` | — | Projects no longer exist; their URLs return 404 |

`main`'s six commits that stage lacks by hash (Personio PRs #140–#142) are patch-equivalent to stage commits (`git cherry`).

## Content comparison

Published documents, read without a token (both datasets are public):

- `dev-dataset` 253, `production` 922. Every `dev-dataset` document exists in `production` except one `contactSubmission` (28 September), which the live contact form wrote.
- `1spWeb`-tagged: 131 in each. Only one becomes newly visible to 1SP: the person *Inge Laufmann* (created in `production` 14 October). No untagged MSM, FLZR or Renaissance document is added to what 1SP queries; the four extra untagged documents are German `msmUnit`s.
- All shared documents have new revisions in `production` because it was rebuilt from `dev-dataset` and then migrated for staging: compacted Cloudinary objects, extended `channel` arrays, `siteContent` overrides, person image overrides, unit banner logos, alt-text corrections. These are intended.
- Live edits after the branch point: one, *Reviews that Work Harder* (`9fd3bef9-…`), whose blocks were reordered on 24 September to Approach → Results → Challenge with badges 001–003. Copied to `production` the same day by setting `casesPageBuilder` from production's own blocks in the live order and publishing (revision `rUX6TrVVDKLBBhwMQoIihs`). Afterwards the blocks match live.
- Drafts: the `dev-dataset` drafts of 1SP Home and *Brand Ambassadors & Live Sales Teams* are already reflected in published `production` content. `production` holds a 1SP draft page "Test"; do not publish it.

`pnpm check:1sp-dataset-switch` ([script](../../../scripts/compare-1sp-datasets.mjs)) repeats this comparison. After the copy it exits 0. With `--since 2026-09-20T00:00:00Z` it would have reported the reordered case.

## Rendered comparison

`1sp-monorepo-test.vercel.app` runs stage code on `production`. Its sitemap matches www.1sp.agency (23 URLs). On each URL, headings, image counts and word counts were compared. The home page and 19 other URLs were identical. Three case pages differed. On the livestream and Lufthansa cases, one heading differs ("Challenge:" added, "Our Scope" missing on stage). Their block content is identical in both datasets; only Lufthansa's contact person gained `isPrimary` in `production`. So this is stage rendering, which ships with the merge anyway. *Reviews that Work Harder* differed because of the block order, fixed afterwards.

## Configuration findings

- Studio: `/studio` on www.1sp.agency is built from `main` and lacks the stage schema that `production` content already uses. That is why the dataset switch is tied to the merge.
- `NEXT_PUBLIC_SANITY_STUDIO_URL` on `dfn-1sp-frontend-web` was `http://localhost:3000/studio` for Production, Preview and Development. Production and Preview were set to `https://www.1sp.agency/studio`; Development keeps localhost. Effective from the next build.
- `NEXT_PUBLIC_SANITY_STUDIO_URL` on `dfn-msm2026-prod` Production is `https://1sp-beta.vercel.app/studio`, which returns 404 since the beta projects are gone (Preview uses the `1sp-monorepo-test` Studio). Left for after the switch at the user's request.
- Revalidation: the only Sanity webhook, "Revalidate Test", posts every dataset's changes (`*`) to `https://1sp.agency/api/revalidate`. The uncommitted `revalidate-sites` function now lists 1SP with `production`.
- CORS already allows `https://www.1sp.agency` and `https://1sp.agency`. Both datasets have ACL mode `public`.
- Not part of the switch: MSM units, disclaimer and privacy pages use the video `MSM_VIDEO_WIP_ndnprm` as `metadata.image` and `openGraphImage`.

## Not verified

Sensitive Vercel variables pull as empty strings, so their values (including `SANITY_REVALIDATE_SECRET` and the write token's dataset scope) were not checked. The old `main` code was not run against `production`.

## Release, same day

- 17:25 UTC: content check exit 0; backups `EXPORT/dev-dataset-before-1sp-switch-20261015.tar.gz` (268 documents incl. drafts, sha256 `7d7472e3…`) and `EXPORT/production-before-1sp-switch-20261015.tar.gz` (934, `628d83df…`). Images live on Cloudinary, so the archives hold no asset files.
- `main` merged into stage (`1cf35d257`). The four Personio job components conflicted textually; stage's version already contains main's hotfixes, and the merged tree equals stage.
- Local production build of stage with live 1SP's Vercel env and `production`. Two case pages differed from live. Cause: the shared case query now spreads blocks, so unset `showCta`/`showButton` arrived missing and the component's `= true` defaults applied. Fixed in `cdaf0c6b9`; afterwards 21 of 23 pages matched live in full visible text, and the other two differ only by the deliberate contact-person change (kept at the user's decision).
- 17:36 UTC: `NEXT_PUBLIC_SANITY_DATASET=production` set on `dfn-1sp-frontend-web`, PR #143 merged (`6d13246dd`), deployment `dpl_FCdVpHTssTLHPHrUZQtZvevTyuvU` ready and aliased to www.1sp.agency and 1sp.agency.
- Verified on www.1sp.agency: all 23 sitemap pages identical to the release build (text, images, canonical, title, robots); *Driving Presales* shows the `production` contact; the `/studio` bundle names `production`; robots, sitemap and the jobs API answer; an unsigned `/api/revalidate` call returns 401.
- Revalidation gap found: the "Revalidate Test" webhook filtered on `_type in ["page", "case", "person", "service", "serviceGroup", "menu", "siteSettings"]`, so publishes of `caseStudy`, `services`, `client` and `unit` never revalidated (harmless under main's 60 s timer, a day's delay under the new cache). With the user's approval the filter became `!(_type in ["sanity.imageAsset", "sanity.fileAsset", "sanity.previewUrlSecret", "contactSubmission"])` and the URL `https://www.1sp.agency/api/revalidate`; a no-op case-study publish then delivered HTTP 200 at 17:49 UTC.
- Rollback target: `dpl_CZN95UAH9azGNd6acUJd16cjG8Zu` (`1d6780b37`, `dev-dataset` compiled in).
- Not tested: a contact-form submission (it emails real recipients), Draft Mode and Presentation, and Studio unknown-field warnings (need a Studio login).
