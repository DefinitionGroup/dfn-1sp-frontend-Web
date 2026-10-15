> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# MSM content migration and publication record

**Publication update, 20 September 2026:** All 430 migration drafts were published to `wu6i3y0h / production` following explicit user authorization. No MSM drafts remained at that publication checkpoint. The 10 unrelated content drafts remain untouched. English resolves 69 cases and four Units; German resolves 63 cases and four Units. Homepage, service/legal routes and representative case metrics were checked using the published perspective. See [publication verification](../../../outputs/msm-publication-20260920/verification.json). The text below records the original draft handoff. The [21 September service audit](msm-service-content-audit-2026-09-21.md) found a later AR-Link draft; the publication checkpoint is not a current draft count.

Publication used one atomic transaction with revision checks on both draft and existing published documents, a successful server dry run, and zero schema errors or warnings. Fresh recovery archive: `EXPORT/production-before-msm-publish-20260920.tar.gz` (973 documents, parsed and SHA-256 verified). Protected before/after snapshots and the publication plan are in `EXPORT/msm-publication-20260920/`. Published content matches the drafts, with reference strengthening applied where requested by Sanity. Other channel editions are unchanged; ten shared people records gain previously missing portraits from the approved migration, also available to their other assigned channels. The post-publication attribute count is 1,567 / 2,000.

The local MSM cache was revalidated. Unauthenticated requests to `/` and `/de` return HTTP 200 and the newly published English/German headlines. No frontend deployment or Git commit was performed as part of this content publication.

## Original draft-only implementation — 19 September 2026

Implemented on 19 September 2026 against Sanity project `wu6i3y0h`, dataset `production`, channel `msmWeb`. The migration is **draft-only**. Published documents and unrelated documents were compared with the baseline and remain unchanged. No deployment or publication was performed.

The source is `MSM_Website_Rewrite_Comparison_v1.xlsx`, the prepared [mapping plan](MSM_REWRITE_MAPPING_PLAN.md), and the original pages for explicitly retained copy, media, references and legal bodies. Column I takes precedence; Column H is used where the rewrite explicitly retains the original. Editorial instructions are not public copy.

## What carries over from Renaissance

**Globals stays Globals.** Services, cases, people and clients retain shared identities and channel/language assignments. MSM-specific service and person copy lives in `siteContent[]`, using the platform's existing edition convention. Global services also hold MSM media; website-specific service pages reference those services and own their ordered page-builder composition.

New MSM campaign cases use the shared `caseStudy` type, assigned to MSM, with normal `seo` and `casesPageBuilder` fields. Their only current channel is MSM, so an identical second body is not stored in an edition. If another channel needs different copy later, the existing case edition mechanism supplies that override. Existing aggregate cases and relationship stories were not overwritten with distinct campaign stories.

MSM Units remain website-specific. A Unit owns its selected cases and leaders; a case can appear in several Units. This does not write into the shared `caseStudy.units` relationship. Leader role, quote and phone can vary by Unit while the referenced person's identity remains shared.

MSM keeps its own angular design, navigation, templates and page builder. Renaissance layouts were not copied into MSM.

## Content saved

All **1,977 spreadsheet rows** have a recorded disposition across **202 source routes**: 102 English and 100 German. The two existing case hubs were also updated.

| Draft document type | Count | Purpose |
| --- | ---: | --- |
| Case studies | 127 | 64 EN and 63 DE campaign stories, results and media |
| People | 24 | 22 profiles plus supporting identity/media records |
| Global services | 33 | 17 EN and 16 DE services; existing identities reused where present |
| Clients | 94 | Reused or new client identities; no invented logos |
| Pages | 47 | 33 service pages and 14 core pages, including case hubs |
| MSM Units | 8 | Four Units per language |
| Translation metadata | 97 | New pairs, alongside three existing pairs |
| **Total** | **430** | Draft documents created or updated |

There are 100 bilingual source pairs. The source has no German equivalent for the MR Showroom case or Mixed Reality in Manufacturing service; no translation was invented.

There are **58 structured metric instances** across cases and the manufacturing service. Metrics retain qualifiers, units and explanatory context; digits count up on entry and respect reduced motion. German qualifiers and scale labels are localized. Named quotations retain their source attribution. Qualitative claims remain prose.

Media was recovered from the original pages and imported to the existing Cloudinary account. The asset inventory contains 327 uploaded/reused source entries; the final model requests 278 source URLs. Earlier inventory variants remain available and were not deleted. Hero videos come from the relevant page's hero, excluding project-card and footer videos. Service thumbnails use the service's own poster or image.

## How the blocks map

| Page family | Composition / ownership |
| --- | --- |
| Home | Editorial `oneSPHeader`, proof intro and selected cases, campaign prose/CTAs, `msmUnitsGrid`, staff quotations where supplied, closing campaign content |
| Service directory | `servicesHeroWithBadge`, introduction, ordered `msmServiceDirectory`, closing CTA |
| Service detail | Header, ordered prose sections, optional result metrics, source CTA and manually selected case proof; global service referenced by `services[]` |
| Cases | Case hero from global fields, challenge/solution, `resultsMetrics` with narrative and optional quotation, source closing `intertitleCTA` |
| Unit detail | Unit hero, introduction, capabilities, contextual leadership, additional content, selected cases, optional source closing CTA |
| Person | Shared identity/portrait, MSM quote, I do, Ask me, biography, contact and selected cases |
| Contact | CMS headline/intro on the existing form, followed by contact-channel and social sections |
| Legal | Header and complete original legal body in portable text, pending client legal review |

The exact stored block order and keys for each source route are in [routes-and-blocks.csv](../../../outputs/msm-content-migration-20260919/routes-and-blocks.csv). Row-level dispositions are in [source-row-mapping.csv](../../../outputs/msm-content-migration-20260919/source-row-mapping.csv); its destination names are logical mapping labels (for example `content.hero`), not executable Sanity patch paths. The route inventory records actual block keys. Unsupported orphan blocks in the old case-hub drafts were replaced with supported composition.

English routes are locale-free; German routes use `/de`. Legacy `/project`, `/service` and other changed paths have explicit redirects. People and service detail routes, canonical URLs, sitemap entries, footer service links and German case links were connected to the new model.

## Preview and publication boundary

Use local Studio at `http://localhost:3000/studio`, select **MSM Preview**, and choose **Drafts**. The local app runs at `http://localhost:3002`. Studio's signed draft-mode flow authenticates the browser preview; adding a perspective query parameter alone does not enable draft access. A normal public request continues to use published content.

Studio currently reports **“Referenced document must be published”** on references to the new draft services and cases. These are expected publication dependencies, not missing documents. The references resolve in authenticated draft preview. The migration retains Sanity's strengthen-on-publish behavior instead of weakening the schema to bypass dependency validation.

When publication is separately authorized, publish/release the dependencies together: client/service identities, cases, profiles and Units, then pages; include translation metadata. Recheck the reference graph because profile/Unit selections can create cross-dependencies. Do not simply publish the page while leaving its new dependencies in draft. The shared case `isPublished` business flag is true for intended visible cases, but their Sanity documents are still drafts.

## Verification and backups

- All 430 saved draft bodies match the intended migration bodies; all 202 source route targets have the expected channel and language.
- Published case counts remain 5 EN / 0 DE. Draft preview resolves 69 EN / 63 DE, including five pre-existing English cases.
- Both languages resolve Unit cases and leaders, homepage content, services, contact, legal pages and representative case results.
- Schema-shape validation passed. Studio's separate unpublished-reference dependencies are described above.
- 26 focused tests passed, covering mapping, channel isolation, relationships, presentation routes, preview annotations, Renaissance carousel/results regression and localized metric formatting.
- Root TypeScript check, MSM production build and existing 1SP production build passed.
- Desktop preview covered both languages and the home, service directory/detail, Unit, person, contact, case and legal templates. Mobile Studio preview covered the German homepage and English service page, including deferred case proof. German case numbers were observed reaching their final values. This is representative browser QA, not manual inspection of every route.
- Localhost Cookiebot authorization remains an existing account configuration issue; no Cookiebot account settings were changed.

The protected baseline is `EXPORT/msm-content-before-migration-20260919.tar.gz` (522 documents). The post-migration snapshot is `EXPORT/msm-content-draft-20260919.tar.gz` (961 documents at export, including preview/system records). Both have SHA-256 sidecars. The post-migration SHA-256 is `490db1484ad617f30bdab598c448ebab3c2dc5b7aa528440af2b3aa7a3055eb7`.

Sanity exports contain zero native asset binaries because this content uses Cloudinary. These archives preserve Cloudinary metadata and references; they are not independent backups of Cloudinary originals. Detailed before/after snapshots, migration plans, asset inventory and logs are in the ignored `EXPORT/msm-rewrite/` directory. Do not commit credentials or raw exports.

## Review items before publication

1. **Sanity capacity:** the dataset reports **1,991 / 2,000 attributes**, leaving nine. Imported fields were consolidated without dropping approved copy or changing unrelated documents. Further populated schema expansion needs additional capacity or a separately scoped cleanup. Sanity counts unique field paths and data types across the dataset; see [Sanity's attribute-limit documentation](https://www.sanity.io/docs/content-lake/attribute-limit).
2. **Two social walls:** source rows 1639 and 1667 (German UBS employer-branding and EDEKA influencer cases) need a supported provider/consent integration. No third-party script was injected.
3. **Legal pages:** original bodies were preserved. The workbook's legal review comments still need client review before publication.
4. **Legacy destinations:** the Forrester report keeps its original gated form link; the MSM contact form does not deliver that report. The #godigital and Founders Keepers destinations remain legacy external links for review.
5. **Missing-source notes:** 14 editorial instructions were excluded from public copy. Missing quotations/results were not fabricated. The row inventory identifies each one.

See [review-items.json](../../../outputs/msm-content-migration-20260919/review-items.json) and [verification.json](../../../outputs/msm-content-migration-20260919/verification.json) for the recorded findings. All code remains local and uncommitted for review.
