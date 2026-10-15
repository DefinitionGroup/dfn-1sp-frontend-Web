# MSM metadata implementation and verification

MSM metadata is implemented across the English and German public routes and populated for every eligible published document in staging Sanity `wu6i3y0h/production`. The frontend and shared embedded Studio are available at [MSM beta](https://msm-beta.vercel.app) and [staging Studio](https://1sp-beta.vercel.app/studio). Both remain non-indexable. Live 1SP uses `dev-dataset` and was not changed.

## Content coverage

| Published route source | Documents | Search title and description | Meta image | Social title, description and image |
| --- | ---: | ---: | ---: | ---: |
| Pages, including service pages | 48 | 48 | 48 | 48 |
| Case studies | 98 | 98 | 98 | 98 |
| MSM units | 8 | 8 | 8 | 8 |
| People profiles | 22 | 22 | 22 | 22 |
| Total | 176 | 176 | 176 | 176 |

Existing nonempty editorial overrides were preserved. Missing copy was derived from the corresponding authored page, case, unit or person content. Six shared cases received an MSM website edition with search and sharing metadata; other website editions and shared case bodies were preserved. The two Camillo Stark profiles received their missing search and sharing fields. Contact and legal pages deliberately use the MSM brand still where a subject image is unsuitable.

Images use existing editorial artwork, case hero images or video stills, profile portraits, unit media, and verified translation artwork. No new global case, service or person documents were duplicated. Unpublished cases, inactive units, people without profile routes and drafts were excluded. The existing draft remained unchanged.

## Runtime and editor behavior

`apps/msm-web/lib/metadata.ts` resolves search and social titles, descriptions, branded defaults, native image alt text, Open Graph and Twitter cards. Invalid image URLs fall through to a valid source. Video sources produce stills; sharing images request a 1200 × 630 crop. Empty social overrides inherit the resolved search fields. Meta Image is the CMS image fallback used for sharing, rather than a separate nonstandard HTML tag.

All public page, case, unit and person routes use the same resolver. The published route catalogue supplies canonicals, sitemap entries and reciprocal language links. Only actual published Sanity translation references create language alternates: 162 of the 176 routes have a verified English/German pair. Sitemap exclusion and editorial noindex remain separate controls. Error and development pages are non-indexable.

The locale root layout emits the correct HTML language on the server while preserving static generation. Page structured data uses the resolved canonical, copy and image; units and profiles include their corresponding structured data. Metadata inventory changes invalidate the `msm-seo` cache and sitemap for page, case, person, unit and translation updates.

Studio retains its native field editors and adds an effective search/sharing preview. Case website editions now expose Meta Image and Exclude From Sitemap for MSM. Social controls are scoped to the active MSM edition. Image alt text uses the existing image object's Alternative Text field. Authenticated local Studio checks opened the homepage, a shared Fallout case, Camillo Stark's profile and the Communications unit and verified the populated controls without saving editor changes.

## Staging release

| Target | Deployment | Status |
| --- | --- | --- |
| MSM beta | `dpl_CZmCu2BiBcvvBBZZUEiLMywWMZYR` | READY; `msm-beta.vercel.app` assigned |
| Shared staging Studio | `dpl_6S8bmetepxcnemxWoYRu1Y5RxYGM` | READY; `1sp-beta.vercel.app` assigned |

These deployments use an isolated snapshot of the working tree based on `2d851b701888df65bd2189700a582ac2b7526995` on `multiseite/stage`. They preceded the source commit. The source changes and this record are committed together following the user's explicit commit and push request on 6 October. A SHA-256 manifest of the deployed source is saved with the private evidence. Pre-existing untracked MSM public assets were excluded from the deployment snapshot; the user subsequently requested a separate assets commit. That assets commit does not establish deployment of those files.

The stored default schema was backed up, updated and re-read for exact structural equality with the extracted 140-type schema. Only the extracted `seo` object changed, adding the two optional case metadata fields. Verified revision: `4KuOWceZJja0QqEaHTNHjb`, updated `2026-10-06T08:25:41Z`.

This release does not launch `www.msm.digital`, enable search indexing or change dataset ownership. Provider environment settings for the shared staging Studio were retained.

## Verification

- All 34 focused metadata, case-edition and MSM content tests passed. Scoped ESLint and `git diff --check` passed.
- MSM and root 1SP builds passed locally and on Vercel. The MSM build generated 132 static routes; the published inventory also includes dynamic profile and service routes.
- The final hosted crawl passed all 176 routes against the published CMS resolver, including title, description, canonical, Open Graph, Twitter, server HTML language, translation links, beta noindex and JSON-LD parsing. Sitemap contained exactly 176 unique expected URLs.
- Facebook and ordinary browser user-agent samples passed on eight requests. All 162 distinct sharing images returned HTTP 200 image responses. Nine sampled images, including video stills, measured exactly 1200 × 630.
- Local desktop at 1440px and mobile at 390px rendered without horizontal overflow; the German homepage and a profile were checked. Browser error checks were clear.
- Beta alias homepage, German homepage, profile, sitemap and robots returned HTTP 200 with non-indexing headers. Missing page and case requests returned HTTP 404. The shared Studio deployment, homepage, sitemap and robots returned HTTP 200 with non-indexing headers.
- Authenticated hosted Studio opened the English MSM homepage SEO panel and displayed the populated search/social fields, effective preview and indexing controls. No editor content was saved or published during these checks.
- Revalidation fixtures for all five affected document types returned HTTP 200 with `msm-seo` and sitemap invalidation in a local server using a temporary QA secret. Restored hosted cache content was observed refreshing under the existing 60-second revalidation. These checks do not establish delivery of a real Sanity webhook.

## Recovery evidence

Private, ignored evidence lives in `EXPORT/msm-metadata-2026-10-06/`. The content backup is `before-1791273847134.json`, checksum `c0ee8c43c83a7b0f6cce8021433a260234d79c2af2a03cb8b92cc011ff35a07e`. The revision-guarded, atomic content transaction was `q3TmcawVlts6ghyzOFhxEk`, updating 176 documents. Sanity attribute usage after the content update was 1707 of 2000, leaving 293.

The folder contains the content plan and receipt, before/after documents, coverage, audit inventories, local and hosted crawl results, image checks, deployment source manifest, schema backup and schema receipt. The repeatable content migration scripts support snapshot, preparation and guarded application; do not restore entire old documents over subsequent editorial work.

Before this release, MSM beta pointed to `dpl_7tGteLdoy6QHC5fSupD1QnPVbBnF` (`msm-beta-29rppczcq-definition-groups-projects.vercel.app`), and staging Studio pointed to `dpl_67wLQhdfG9tTSCMYSZp612UvVGzM` (`1sp-beta-pbelhod7b-definition-groups-projects.vercel.app`). Reassigning only their beta aliases can roll back the frontend or editor independently of the CMS metadata.
