# Service content ownership: Renaissance, FLZR and MSM

Use [Service content](../../SERVICE_CONTENT.md) for maintained editing guidance and [the handoff](../../SERVICE_CONTENT_HANDOFF.md) for the current proposed work queue. This record preserves the audit evidence and its original recommendations.

Date: 21 September 2026. **Read-only live-content and code audit. Recommendations are not implemented.** Only audit documentation changed; no schema, renderer, CMS, publication or deployment changes.

## Scope and evidence

Checked `wu6i3y0h / production`, API `2025-09-16`, authenticated `raw` perspective, CDN disabled. Root Studio, FLZR and Renaissance environment files agree on those settings; app channels are `flizrWeb` and `renaissanceWeb`. Ran `doctor:sanity` explicitly for both channels in English. These checks establish configured environments and direct CMS state, not the environment of existing server processes or deployed code.

Fetched all assigned service documents and all pages for Renaissance and FLZR, across languages: **14 published services, 28 published pages and two FLZR page drafts**. Renaissance has six EN services and six pages. FLZR has eight EN services and 22 pages (20 EN, one DE, one PL); it has **no assigned DE/PL global service records** in this snapshot. Supported queries filter language strictly and do not substitute EN services for DE/PL.

Compared live data with current local renderers, projections and FLZR's service-to-page mapping. The [MSM audit](../msm/msm-service-content-audit-2026-09-21.md) supplies its full 33-pair inventory; rechecked the revisions of its original snapshot alongside this audit. All **131 unique documents** across both snapshots remained unchanged at the final check. Also checked counterpart draft IDs independently of channel filters: no hidden assignment-removal draft and no Renaissance/FLZR edition lacking its channel assignment were found.

Two FLZR drafts are separate from the published baseline: the active homepage draft changes only the hero `mediaDarkening`; a new draft-only page (`drafts.4c2fc438-3d47-4f70-b830-6ae3dc8f427b`, slug `SSSS`) has no content. There are no service-document drafts for Renaissance or FLZR. The previously audited MSM AR-Link draft remains editorially equal to published content.

## Comparison

| Concern | Renaissance | FLZR | MSM |
| --- | --- | --- | --- |
| Global service inventory | 6 EN | 8 EN | 17 EN + 16 DE |
| Effective content storage | 4 Renaissance editions; 2 Renaissance-only base records | 8 FLZR-only base records; no FLZR editions | MSM edition on all 33 |
| Overview/card rendering | Homepage cards reference services | Home and Services grid query assigned services | Carousel queries services; directory reads page titles/local teasers |
| Visible card secondary copy | `introText` | `taglabel`, otherwise service groups | Carousel: `introText`, otherwise first description paragraph |
| Description display | Six reference-driven sections on Services | AI Solutions modal; seven other cards navigate to pages | Inline page-builder prose on detail pages |
| Dedicated detail pages | None for individual services | 7 EN pages | 33 pages |
| Description duplication | No local descriptions in the six service cards or sections | Different global and page narratives; no exact copied description paragraphs found | 29 full matches, 3 subsets, 1 observed drift |
| Page relationship | Each service section/card stores a service reference | Seven service-ID/slug pairs hardcoded in frontend | Page stores service reference |
| Media | Homepage cards inherit service media; Services index has its own hero | Cards use individual service films; all 7 detail heroes use the same FLZR brand film | 33 service/hero objects currently identical |
| Other consumers | Shared description remains required for Services sections | Descriptions also feed service-catalog JSON-LD | Preserve supported description-consuming blocks during any consolidation |

## Renaissance: already reference-driven

The published homepage has **six service-reference cards**. The Services page has **six service-reference `contentSection` blocks**. None of those 12 blocks stores duplicate local body/card text or service media. The resolver supplies effective channel name, short introduction and media to the cards, and full description to the Services sections.

Four services use Renaissance website editions because their identities are shared with other channels. Two are assigned only to Renaissance and use their base fields. That is valid inheritance, not missing content. The page retains layout/anchors and two intentional heading overrides: `Events` and `Also available through our partner network`.

| Service | Copy location | Other channels | Home cards / Services sections |
| --- | --- | --- | --- |
| Earned PR Campaign Planning | Renaissance edition | 1spWeb | 1 / 1 |
| Event Management & Production | Renaissance edition | 1spWeb, msmWeb | 1 / 1 |
| Paid & Organic Influencer Planning | Renaissance edition | 1spWeb, msmWeb | 1 / 1 |
| Go-to-market Communication Planning | Renaissance edition | 1spWeb | 1 / 1 |
| Paid Media Planning & Buying | Base service fields | None | 1 / 1 |
| Product Management & Support | Base service fields | None | 1 / 1 |

**Decision:** retain this model. Removing `serviceDescription` globally or moving all service descriptions into standalone pages would break an already coherent use case. The intentional code-owned fallback homepage is a resilience snapshot, not a second CMS editing location; it is outside this CMS duplication count.

## FLZR: two presentation paths with unclear ownership

The Home and Services grids obtain services through the channel/language-aware shared query. Cards show service name, tag label and media; **they do not show `introText`**. That field appears in the service modal together with `serviceDescription` and `deliverables`.

`servicePageHref()` changes seven cards into links. These seven pages render their own PageBuilder hero/prose and do not reference global service content. AI Solutions has no mapped page and still opens the modal. All seven mapped pages exist, so there is no currently broken mapping; creating or renaming one in Studio would not update the hardcoded map.

All eight records have two full-description paragraphs and five or six structured deliverables. Across the seven linked pages, **zero of the 14 full-description paragraphs and zero of the 40 deliverable descriptions appear verbatim** after whitespace normalization. The pages have independent campaign/problem/proof copy. This establishes different copy, not a claim that the prose contradicts itself or that no capability is paraphrased there.

| Service | Card destination | Global deliverables | Page body references service? |
| --- | --- | --- | --- |
| AI Solutions | Service modal | 6 | Modal reads service directly |
| Business Intelligence | /en/business-intelligence | 6 | No |
| Go To Markets | /en/go-to-markets | 5 | No |
| Live Video Consulting | /en/video-consulting | 6 | No |
| PoS Management | /en/pos-management | 6 | No |
| Promotion | /en/promotion | 5 | No |
| Sales Force | /en/sales-force | 6 | No |
| Trainings | /en/trainings | 6 | No |

The seven records' detailed descriptions and **40 deliverables are bypassed by the normal card-click journey**. AI Solutions still visibly uses its description and six deliverables. Do not label the other descriptions unused: Home and Services include service-catalog JSON-LD built from the global `serviceDescription`; other service-gallery routes use the same projection. There is therefore also a visible-copy/SEO-copy consistency question before changing or removing those fields.

Example: the Trainings service's long description starts with retail confidence and programmes; the page opens with “Untrained store staff cost brands sales every day” and adds LEDVANCE proof. Those have different editorial jobs. Its six structured deliverables remain available in Globals but are not rendered by the linked page.

All seven detail-page heroes select `01_FLZR_WIP_V2_ub8n2n`; their cards select individual service films such as `Training_b5bow6`. Unlike MSM, these are **different media selections**. A cross-site consolidation must preserve this existing art direction rather than replace all heroes with card media by default.

There are no FLZR website editions today because all eight services are FLZR-only. Introducing editions solely to make the tabs look identical would add duplicate values without solving ownership. If these identities become shared, review what is truly reusable and put FLZR-specific copy into the FLZR edition then.

## Consistent model to adopt — recommendation only

Consistency should mean **one owner per piece of content and the same reference/fallback rules**, while allowing sections, modals and full pages to have different jobs.

1. **Globals owns identity and reusable service presentation:** name, tag, short introduction, concise overview, structured deliverables and card media. Resolve the website edition first, then shared base fields. A website-only service may legitimately use base fields; do not require identical copies in an edition.
2. **Website pages own composition and extended storytelling:** URL/SEO, hero headline and media art direction, bespoke narrative, evidence, cases and CTAs. A reusable overview/deliverables block must reference its service instead of copying those fields into local prose.
3. **Make destinations CMS-owned:** one explicit primary page relationship per service, website and language where a page exists. A service may instead appear as a referenced section or modal. Validation should prevent ambiguous targets; reference changes should update card/footer links. Choose the schema direction once rather than adding redundant references both ways.
4. **Clarify field labels and usage:** distinguish short card copy, reusable overview and page narrative; show where each is currently used. Keep the storage key `serviceDescription` compatible while deciding on clearer help text. It must not silently mean “the entire landing page” on one channel and “unused legacy text” on another.
5. **Keep SEO on the same editorial basis:** recheck catalog descriptions against the chosen overview/page content before retiring any field. No automatic two-way synchronization.

### Site-specific follow-up

- **Renaissance:** preserve the six existing references and the two page heading overrides. Improve explanation/navigation in Studio if needed; no service-content migration is justified by this audit.
- **FLZR:** first replace the frontend-only page mapping with a CMS relationship. For each of the seven pages, decide whether its stored overview/deliverables add value; render the useful material via reference blocks or consciously retire it after editorial and SEO review. Retain AI Solutions' modal unless a detail page is separately requested. Keep separate card and hero media.
- **MSM:** populate the MSM card summaries from the 32 approved directory teasers and unify listing consumers. Correct the observed POS Marketing drift in a future scoped content change. Then choose whether each repeated long description is a reusable overview or page narrative; preserve the richer pages and split block sequences. Do not remove the global description field across the platform.

This cross-site evidence qualifies the previous MSM-only recommendation: **retiring an MSM edition's redundant long-form copy is a possible scoped cleanup, not a platform-wide retirement of service descriptions.** Renaissance actively needs them, and FLZR uses them in its modal and SEO output.

## Source pointers

- [Renaissance service resolver](../../../apps/renaissance-web/lib/serviceContent.ts)
- [Renaissance content section](../../../apps/renaissance-web/components/pagebuilder/pg-ContentSection.tsx)
- [Service presentation projection](../../../packages/sanity-queries/src/service-presentation.ts)
- [Global service website-edition schema](../../../packages/sanity-schema/src/Global/Objects/serviceWebsiteContent.ts)
- [FLZR service grid data loader](../../../apps/flzr-web/components/pagebuilder/server/FlzrServicesGridBlock.tsx)
- [FLZR card and modal renderer](../../../apps/flzr-web/components/data/data-ServiceGallery.tsx)
- [FLZR service page mapping](../../../apps/flzr-web/lib/service-pages.ts)
- [FLZR Services page and JSON-LD](<../../../apps/flzr-web/app/(site)/[locale]/services/page.tsx>)
- [Shared structured-data helper](../../../lib/structured-data.tsx)
- [Earlier MSM audit and full inventory](../msm/msm-service-content-audit-2026-09-21.md)

This audit does not verify browser visuals, deployed behavior, all page-copy claims, translated copy accuracy or Sanity attribute savings. Archive/alternate FLZR pages were included in the fetched inventory but are not treated as the active English homepage. The active published homepage is `page-flizr-home-v3-preview-en`, as established by `isHomepage`, despite its historical ID.

Snapshot time: `2026-09-21T19:12:37.984Z`. SHA-256: `df406d7bdf9591e691cebc434d0b2925a5b1e2d9d1f6e4c5bc347f125479aa7e`. Read-only local extract: `/private/tmp/cross-site-service-audit-20260921.json`. It is temporary evidence, not a full backup; refresh before implementation.
