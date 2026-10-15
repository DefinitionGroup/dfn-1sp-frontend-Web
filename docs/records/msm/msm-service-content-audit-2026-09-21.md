# MSM service content ownership audit

Follow-up ownership guidance now lives in [Service content](../../SERVICE_CONTENT.md); [the handoff](../../SERVICE_CONTENT_HANDOFF.md) is the current proposed work queue. The measurements and recommendations below remain dated audit evidence.

Status: **Read-only audit completed. No application, schema or CMS changes; no publication, deletion, commit or deployment.** Findings and recommendations are separate. Existing worktree changes were left in place.

## Scope and method

- Live Sanity project `wu6i3y0h`, dataset `production`, channel `msmWeb`, languages `en` and `de`, API `2025-09-16`, CDN disabled.
- Authenticated `raw` perspective distinguishes published documents and drafts. Inspected 89 documents: 33 published services, one service draft, 47 published MSM pages and eight MSM Unit records. Of the pages, 33 are service detail pages (17 EN / 16 DE).
- Root Studio and MSM app environment files agree on project, dataset and API version. MSM sets `NEXT_PUBLIC_CHANNEL=msmWeb`; root has no channel variable, so the doctor was run explicitly with `--channel msmWeb --language en`. It found the expected homepage, menu, 24 pages and 17 EN services. This confirms configured environments and direct dataset results, not the environment of any already-running process.
- Compared the service's effective MSM edition with its linked page: name, short introduction, full description, deliverables, media and reference scope. Extracted Portable Text text in order, joined spans, and normalized whitespace only; no case, punctuation or semantic rewriting for text comparisons.
- Traced current local renderer/query code, including uncommitted carousel work. Compared directory copy with the checked-in rewrite extract, splitting service title and CTA as the migration does. This is not a deployed-code or pixel/rendering audit, nor a full cross-channel content audit.
- The content snapshot is a local read-only extract, not a full dataset backup. No media downloaded. The inventory CSV retains exact document IDs, revisions and block order for follow-up review.

## Findings

| Finding | Verified result | Meaning |
| --- | --- | --- |
| Service/page linkage | 33 valid one-to-one pairs, correct channel/language; no unlinked MSM services or multiply linked service | Preserve existing identities and URLs. |
| Website editions | One MSM edition on each service | No duplicate MSM editions. |
| Name duplication | 33 page titles equal their resolved service names | Two independently editable copies currently agree. Hero headlines remain a distinct editorial role. |
| Full-description duplication | 29 descriptions equal all page `contentSection` prose; three are exact subsets of richer pages; one differs | This is genuine duplicate storage, with one observed textual drift. |
| Media duplication | All 33 service background objects equal the corresponding active hero media objects | Same existing Cloudinary assets selected in two places, not 33 newly duplicated media files. |
| MSM card summaries | No MSM edition has `introText`; seven services inherit shared summaries, 26 have no summary | Channel-aware queries can still show generic base copy because the edition field is unset. |
| Current EN interactive carousel | Six selected services; all six use inherited shared summaries | All six differ from their corresponding approved MSM directory teasers. |
| Directory summaries | 32 local entries: 17 EN and 15 DE | All 32 text/CTA pairs match the rewrite extract after splitting its list-item structure. None exceeds the existing 150-character edition intro limit. |
| Structured deliverables | Zero populated effective `deliverables` fields among these services | No current deliverables-field duplication. HashtagLove capabilities are page prose. |
| Draft status | One draft: `drafts.service-msm-ar-link-en`; editorial fields equal published document | Not an additional conflicting copy. Kept untouched. |
| Cross-channel exposure | Six EN service records are also assigned elsewhere | Any consolidation must affect the MSM edition, not their shared base content. |

### Actual conflicting value: POS Marketing EN

Document `ccb58dec-5ce3-4d6d-bdc5-549e42be254b`, `siteContent[channel=="msmWeb"].serviceDescription`, ends its first paragraph with:

> Today it's everywhere your customer is. 2

Page `page-msm-service-pos-marketing-en`, first `contentSection` paragraph:

> Today it's everywhere your customer is.

The checked-in rewrite extract, row **169**, matches the page and has no trailing `2`. This establishes the intended value for a future scoped fix. No change was made. The current six-card carousel uses POS Marketing's inherited short introduction, so this extra character is not evidence of an error currently displayed on that card or the detail page.

### Richer pages and composition exceptions

- **HashtagLove EN and DE:** global description duplicates two page paragraphs; pages also contain campaign strategy, creation, implementation and reporting copy plus headings and CTAs. Their complete page bodies cannot be replaced with the current global description.
- **Mixed Reality in Manufacturing EN:** two duplicated paragraphs; page additionally holds research copy, metrics and source attribution, interspersed with CTAs. These must retain their structure and context.
- **Training DE:** combined prose equals the service description, but it is split across two `contentSection` blocks with a CTA between them. Text equality does not authorize collapsing block order.
- **HashtagLove DE directory omission:** detail page exists, but the German listing has no entry. This matches the supplied rewrite and is explicitly recorded in the migration; it is not a broken reference or grounds to invent teaser copy.
- **Mixed Reality in Manufacturing:** EN only; the source migration records no DE counterpart. Do not invent a translation as part of deduplication.

## Which source each surface actually uses

| Surface | Text source | Media source | Link source |
| --- | --- | --- | --- |
| Service detail pages | Page hero fields and inline `page.content[]` prose/metrics/CTAs | Page hero image/video | Page slug |
| EN `interactiveServiceCarousel` on Services | Resolved service name; `introText`, otherwise first full-description paragraph | Resolved service edition background | Reverse lookup of service-linked MSM page |
| EN/DE `msmServiceDirectory` | Linked page title + directory entry's local `text` | Linked page's hero media | Linked page slug |
| MSM footer capabilities | Resolved global service name | None | Linked service-page slug, otherwise Services index |
| Supported `smartServicesCarousel` | Resolved service intro, otherwise full description | Resolved service background | Existing smart-carousel behavior |
| Supported `servicesGalleryFiltered` | Global service presentation, including full description in expanded view | Resolved service background | Existing gallery behavior |

The last two block types are supported by the current MSM registry but are absent from the inspected published MSM page block arrays. All eight Unit records have empty/missing `additionalContent`, so there is no additional active service block there. This limits the immediate migration scope but does not permit breaking supported blocks.

The `page.services[]` reference currently establishes identity and routing; it does **not** make the page's inline paragraphs or hero inherit the service fields. Conversely, editing page prose does not update the global description.

There is no current duplicate landing-page match, but the carousel picks the first matching page by ID if duplicates are introduced. The schema limits references per page to one; it does not enforce one primary page per service/channel/language.

### Concrete summary mismatch on the same Services page

For Social Media, the interactive carousel reads the inherited base summary:

> Building vibrant online communities through content, conversation, and culture-led social strategy.

The directory reads the approved MSM-specific teaser (rewrite row 116):

> Strategy, content, and community management for your brand's channels.

This difference is not a factual contradiction, but it is a source-ownership inconsistency and bypasses the MSM rewrite for the carousel. The other five selected cards have the same source mismatch: Influencer Marketing, POS Marketing, Experiential Marketing, AR & VR and Content Creation.

## Recommended ownership after this audit — not implemented

The audit refines the earlier suggestion to centralize every full description in Globals. MSM has no demonstrated active need to render its full long-form description in multiple places; its pages already hold richer, ordered narrative. A new universal body-reference mechanism would add complexity unless actual reuse requires it.

1. **Keep Globals as the service identity and reusable presentation source:** channel assignment, relationships, website display name, short teaser, card media and icon.
2. **Keep the MSM landing page as the long-form narrative owner:** URL, SEO, hero headline/subtitle, ordered prose, metrics, proof, citations and CTA placement.
3. **Use the existing MSM edition `introText` for the 32 approved listing teasers.** Make the directory and carousel read it consistently; preserve list selection/order/CTA labels on the page. HashtagLove DE needs an explicit editorial decision if a card is later required. Do not automatically copy generic base summaries or create new summaries during structural work.
4. **Use service media as the default, with an explicit optional page-hero override.** All 33 pairs currently agree, so this can remove a second default selection while retaining legitimate future art direction.
5. **Retire the redundant MSM full-description copy only after checking every consumer and updating fallbacks.** Do not delete the shared field or other website editions: Renaissance uses its own description through service-referencing blocks. If long-form reuse is required, use one explicit source/reference rather than keeping two synchronized editable bodies.
6. **Make Studio ownership visible:** distinguish service presentation from landing-page content, link the documents, flag missing/ambiguous primary pages, and update the stale generic `Content` and service full-description helper text.

No two-way synchronization is recommended. It would preserve the current ambiguity and introduce overwrites. A future implementation needs a new backup, fresh draft/revision checks, scoped MSM mutations, paragraph/block-order comparisons, and before/after verification of other-channel projections. No Sanity attribute-quota savings are claimed by this audit.

## Inventory

`Exact` means full-description text equals all normal Portable Text paragraphs across the page's `contentSection` blocks after whitespace normalization. It does not include hero, CTA, metrics or case text. `Subset` means each description paragraph appears verbatim on the page, which also has additional text. Media matches for every row. `Base` means the resolved short summary comes from the shared service; `Missing` means neither shared nor MSM edition intro is populated.

| Language | Route | Full description vs page | Card intro | Other assigned channels |
| --- | --- | --- | --- | --- |
| DE | `/services/ar-link` | Exact | Missing | — |
| DE | `/services/augmented-and-virtual-reality` | Exact | Missing | — |
| DE | `/services/cashback-services` | Exact | Missing | — |
| DE | `/services/content-kreation` | Exact | Missing | — |
| DE | `/services/couplar` | Exact | Missing | — |
| DE | `/services/development` | Exact | Missing | — |
| DE | `/services/digital-signage` | Exact | Missing | — |
| DE | `/services/experiential-marketing` | Exact | Missing | — |
| DE | `/services/hashtaglove` | Subset | Missing | — |
| DE | `/services/influencer-marketing` | Exact | Missing | — |
| DE | `/services/pos-marketing` | Exact | Missing | — |
| DE | `/services/pr` | Exact | Missing | — |
| DE | `/services/review-plattform` | Exact | Missing | — |
| DE | `/services/social-media` | Exact | Missing | — |
| DE | `/services/strategy` | Exact | Missing | — |
| DE | `/services/training` | Exact; two blocks | Missing | — |
| EN | `/services/ar-link` | Exact | Missing | — |
| EN | `/services/augmented-and-virtual-reality` | Exact | Base | 1spWeb |
| EN | `/services/cashback-solutions` | Exact | Missing | — |
| EN | `/services/content-creation` | Exact | Base | 1spWeb |
| EN | `/services/couplar` | Exact | Missing | — |
| EN | `/services/development` | Exact | Missing | — |
| EN | `/services/digital-signage` | Exact | Missing | — |
| EN | `/services/experiential-marketing` | Exact | Base | 1spWeb, renaissanceWeb |
| EN | `/services/hashtaglove` | Subset | Missing | — |
| EN | `/services/influencer-marketing` | Exact | Base | 1spWeb, renaissanceWeb |
| EN | `/services/mixed-reality-in-manufacturing` | Subset | Missing | — |
| EN | `/services/pos-marketing` | Drift: trailing 2 | Base | — |
| EN | `/services/pr` | Exact | Missing | — |
| EN | `/services/review-platform` | Exact | Base | 1spWeb |
| EN | `/services/social-media` | Exact | Base | 1spWeb |
| EN | `/services/strategy` | Exact | Missing | — |
| EN | `/services/training` | Exact | Missing | — |

German public routes have the `/de` prefix. See the [machine-readable inventory](msm-service-content-audit-2026-09-21.csv) for IDs, revisions, exact field paths, paragraph counts and block order.

## Evidence and reproducibility

- [Service website edition schema](../../../packages/sanity-schema/src/Global/Objects/serviceWebsiteContent.ts): card introduction and full-description roles; inherit/custom media behavior.
- [Service presentation projection](../../../packages/sanity-queries/src/service-presentation.ts): channel override before shared fallback.
- [Interactive service carousel](../../../apps/msm-web/components/pagebuilder/server/InteractiveServiceCarouselBlock.tsx): selected services, summary fallback and reverse page lookup.
- [Service directory](../../../apps/msm-web/components/pagebuilder/server/MsmServiceDirectory.tsx): page-owned title/media and locally stored teaser.
- [MSM generic page renderer](<../../../apps/msm-web/app/(site)/[locale]/[slug]/page.tsx>): reads `page.content`.
- [Service migration model](../../../scripts/msm-content-model.ts): the service loop stores paragraph-role copy in the edition; a later loop separately creates page prose blocks. This explains the original duplication.
- [Rewrite extract](../../../scripts/data/msm-rewrite-v1.json): row 169 for POS Marketing, rows 116–132 and 1095–1109 for listing copy.
- [Migration record](MSM_CONTENT_MIGRATION.md): historical source coverage and intentional language/listing omissions.

Read-only scope query:

```groq
*[
  (_type == "services" && "msmWeb" in channel) ||
  (_type == "page" && channel == "msmWeb") ||
  _type == "msmUnit"
]
```

The `raw` snapshot contained one `drafts.*` document and no release-version documents. Published inventory excludes draft IDs; the draft was compared separately while excluding system metadata. A second query checked draft IDs for every published document regardless of channel assignment: it found the same single draft, so a draft removing MSM assignment was not missed by the initial filter. No service had an MSM edition without MSM channel assignment. All 89 document revisions still matched the snapshot at the final recheck. Asset equality compares the full selected Cloudinary wrapper, not merely a derived thumbnail URL. Directory text was compared to the rewrite after extracting name and CTA using the same delimiter/language rules as the migration.

Queried at: `2026-09-21T19:03:36.743Z`. Snapshot SHA-256: `274c4ad4ae8c9e2d13c2ff2ff7541de8f9da5085168886d8d7ef8a0b90f13190`. Local snapshot: `/private/tmp/msm-service-content-audit-20260921.json` (temporary, not committed). Re-query before any implementation; this audit does not freeze the dataset.
