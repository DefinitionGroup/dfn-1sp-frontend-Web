> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# Renaissance rewrite — implementation and review

19 September 2026. The approved content implementation is **published** in `wu6i3y0h/production`, scoped to `renaissanceWeb/en`. The v4 workbook takes precedence over the earlier Renaissance copy. All **169 publishable source cells** have been reconciled against saved CMS content; the [publication record](renaissance-content-publication.md) verifies 225 published documents and zero remaining Renaissance drafts; F27 is an editorial removal note and is excluded from public copy.

## Review locally

- Studio: <http://localhost:3000/studio>. Open **Renaissance Preview** when reviewing future unpublished edits.
- Renaissance: <http://localhost:3003>. Review Home, Services, Cases, About, Clients and Contact from the new page-based navigation.
- Enquiry email: **martin@definition.studio**, published in Renaissance Site Settings as `renaissanceEnquiryEmail`.
- Contact registration: <http://localhost:3003/contact#registration>. Creator and media registration link to the two verified existing Google forms.

The enquiry form currently opens the visitor's email app with their enquiry addressed to the configured email. Its button says **Open email app**, and the visitor reviews and sends the email there. This is not automatic server delivery; no test enquiry or email was sent. The supplied public contact details remain as written in v4. The root server write token is invalid and has not been replaced with an interactive CLI credential.

The user authorized publication after local review, and all 225 Renaissance drafts are now published. Ordinary requests display the new pages and case assignments without preview authentication. Future draft edits can still be reviewed through Studio Presentation; restarting the frontend may require reopening Preview to renew its browser session. No hosted Studio/schema deployment, frontend deployment, domain launch, Git commit or push was performed during this content/publication phase.

## Content and block mapping

| Surface | Implemented composition |
| --- | --- |
| Home | Rewritten hero and metadata; story introduction and two linked campaign slides; six service cards with video; 12 selected client logos; team and awards; retained reach; Origins “Since 2015”; creator/media registration CTAs. |
| Services | Page introduction; four anchored `contentSection` blocks preserving complete rewritten paragraphs; paid-media partner section; separate events section. |
| About | Rewritten introduction; 19 named portraits with global person references; How we work; the reusable Renaissance awards wall. |
| Clients | F29/F30 introduction and an alphabetical 125-logo grid from the Renaissance-owned collection, with global client identities and local artwork overrides. |
| Contact | F31–F33 introduction/contact details; one enquiry form; F34–F36 registration section and verified external forms. One page H1. |
| Cases | F37/F38 index; 66 global case identities, correct client references and hero media; region filters, text search and pagination. |
| Case bodies | `headlineChallenge` contains full introductory copy. The approved Results follow-up maps 60 source paragraphs into 107 scoped `resultsMetrics` groups with 248 metrics, explanations and preserved qualitative outcomes. Autonauts retains its attributed quote; six intro-only cases have no fabricated results section. |
| Navigation/footer | Primary menu now links to actual pages. Footer stories and services link to their cases/section anchors; ICO copy is saved. Legal links point to the verified existing policy pages. |

All six homepage services now use distinct existing videos, including the data-analysis film for Product Management and the storefront/launch film for Go-to-market. Shared portraits and awards also resolve in the fallback homepage. The fallback Home and Contact copy is aligned with v4. Existing Origins historical logos remain intact.

The 2025 Romeo announcement/activation and 2026 full launch remain separate cases. Verified legacy mappings produce 69 local redirects, including the two distinct Romeo URLs, `/about` and `/register`; no redirects have been deployed.

Case summaries are first-sentence excerpts from the rewrite. The Results follow-up preserves supplied UVPM/reach/views terminology, precision, qualifiers, timeframes and substantive facts across structured metrics and explanatory copy. Original paragraphs remain in the recovery ledger; the displayed restructuring is an editorial derivative of v4. Discovery metadata uses verified territories and explicit genre/platform mentions; it does not infer missing taxonomy. Legacy entry dates preserve campaign ordering and are not asserted as release dates.

The Renaissance case template no longer mounts the unit/person **Powered by** block. Global relationships and other websites' content remain intact. See the [Results implementation record](renaissance-results-metrics-implementation.md) and [source-to-metric mapping](../../renaissance-results-metrics-mapping.md).

## Shared identities and Renaissance ownership

Cases, clients and people remain global documents filtered by channel and language. The STALKER 2 pilot retains global ID `9d295e99-7801-42b8-96e7-a15afb267e72` and canonical slug `making-stalker-2-unmissableeverywhere-all-at-once`. Renaissance's F91/F92 copy resides in its website edition; the published 1SP/MSM content is unchanged.

The **Website content** tab lets an assigned channel inherit shared copy or override its headline, subtitle/summary, hero, SEO, discovery metadata and complete body. **Start from shared content** creates an editable snapshot; **Use shared content** removes the overrides. Empty custom bodies and hidden optional text are explicit. Publishing a global document still publishes its whole draft, including all editions; editions do not have independent publishing lifecycles.

The resolver is used by detail pages, listings, manually selected cases, carousels and MSM unit cases. All four frontends consume resolved SEO. New Renaissance-only cases use the shared default fields without a redundant identical edition. The subsequent [global-services migration](../../renaissance-global-services-and-studio.md) replaces inline service copy with six Home and six Services page references to six global service identities. Four existing services have Renaissance website editions; two new services use shared fields with Renaissance assignment. Copy and available media are published, and other-channel service content is preserved.

Renaissance owns its client collections and artwork selections, awards collection and portrait presentation. Global identities remain reusable by other channels. Existing GSC Game World and Stefano Petrullo have published Renaissance membership while retaining their shared identity/artwork. Koelnmesse and Wired Productions were added as distinct clients required by campaigns; neither is silently conflated with a different supplied logo.

## Saved batches and assets

The first milestone created **130 editorial drafts**: the shared-case pilot, GSC membership, 124 client identities, two collections, Home and Clients. The completed content phase wrote **98 drafts**: 94 new drafts and four updates to drafts prepared by this work.

| Content-phase type | Drafts written |
| --- | ---: |
| Cases | 66 |
| Additional client identities | 2 |
| People | 19 |
| Shared portraits and awards | 2 |
| Pages | 6 |
| Navigation and footer menus | 2 |
| Site settings | 1 |

125 supplied client JPEGs and 94 reconciled legacy case/team/award assets were uploaded with deterministic Cloudinary IDs and overwrite disabled. Existing correct shared media was retained. Recovery manifests record source URLs, IDs and checksums. The full roster uses 125 logos; Home selects GSC Game World, Funcom, Mob Entertainment, Curve Games, Team17, Atari, Revolution, Private Division, 505 Games, Grasshopper Manufacture, IIDEA and Ember Lab.

Four supplied files remain held for review and were not uploaded/displayed:

- `Amazon_Kids.jpg`: confirm sub-brand identity versus Amazon.
- `Tencent_Games.jpg`: confirm games-brand identity versus Tencent.
- `Wired.jpg`: artwork is a photograph/graphic rather than a clean wordmark. The case client identity is still recorded as Wired Productions.
- `Limit_Break.jpg`: artwork says “Limit Break Mentorship”; confirm the intended identity.

## Verification and recovery

- Baseline: `EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z/production.tar.gz`; 302 documents, 289 published and 13 drafts. SHA-256 `4734999a00c1f3d95cb710966b1dde0552d597d2dc12fe1a6b7853f28008ef18` is verified before mutation.
- Snapshots, dry-run plans, revision-guarded mutation payloads, media manifests and live re-query evidence are under `EXPORT/renaissance-rewrite-v4/` (Git-ignored). The full export includes media references, not Cloudinary binaries.
- Pre-publication content audit: **all 289 existing published documents unchanged**, unrelated drafts unchanged, all 169 copy cells accounted for, 66 cases with client and hero, 125 logos, 19 portraits, 10 award logos, and the requested email saved exactly.
- Offline compiled-schema validation: all 98 proposed documents pass with zero errors.
- Focused content, case-edition, section, shared-content and Presentation suite: **34 tests passed**.
- Local production builds: **Renaissance and 1SP passed** after the content changes. FLZR and MSM typechecks passed; all four app builds passed at the preceding case-edition milestone. Final Renaissance typecheck passed after the responsive navigation/portrait refinements.
- Browser: authenticated Studio and draft pages; desktop navigation; 390px Home, Services, About, Contact and representative cases; one H1 per page, no horizontal overflow. The named directory has 19 portraits. Case filtering, no-results state and mobile pagination work. Autonauts attribution and an intro-only case render correctly. Contact has one form, the configured mailto link and working registration anchor destinations.
- The five-page navigation now switches to the mobile menu below 1280px, avoiding tablet overlap. Decorative portrait artwork is clipped to its section, avoiding page overflow. Origins and other enum/layout controls remove Sanity preview metadata before lookups while retaining editable copy metadata.
- After publication and local cache revalidation, ordinary requests return 200 for all six main pages, Gamescom and the shared STALKER 2 case. The sitemap contains 72 entries (six pages and 66 cases). `/en` redirects to `/`; sample legacy redirects preserve correct destinations. `/robots.txt` disallows indexing, and pages carry noindex headers. Local canonical origin is `http://localhost:3003`.

Local Studio and Renaissance share `localhost`; development-only `multiZoneDraftMode` prevents either app clearing the other's valid preview cookie without treating it as its own authorization. The rejected app Viewer token was aligned with the working root Viewer token in ignored local configuration. No credentials are committed. Preview indexing and production tracking stay disabled until a Renaissance production domain is deliberately configured.

Current review servers use webpack with polling because development watching was unreliable with Turbopack on this machine. To restart them in separate terminals after stopping existing listeners:

```sh
WATCHPACK_POLLING=1000 pnpm exec next dev --webpack -p 3000
WATCHPACK_POLLING=1000 pnpm --filter @1sp/renaissance-web exec next dev --webpack -p 3003
```

The import scripts default to dry-run, use an authenticated `sanity exec --with-user-token` session, require explicit apply flags and guard existing revisions/new-document collisions. Completed imports detect their own batch and preserve subsequent editorial edits. The earlier draft-only audits and 225-document publication manifest are historical migration checks: Home and Services intentionally differ after the global-services migration. See its [current verification command and baseline](../../renaissance-global-services-and-studio.md). Do not replay migration/refinement scripts over later editorial work.

## Retained source and operational notes

The user approved publication of the supplied copy. The following notes remain part of the source record; publication does not independently verify these claims:

- The 19 named people are reconciled, but the v4 employment claim (“not contractors”) differs from older consultant descriptions.
- The 66 entries include announcement/event phases; “66 launches” is not independently verified as 66 releases.
- Award artwork covers 2016–2025. The v4 “every year since 2015” claim is not independently verified for 2015.
- Metric terminology, two-business-day response promise and early review-code promises remain as supplied.
- Review the four held logos, temporary enquiry email and whether email-app enquiries are the desired launch behavior.

Content publication is complete; frontend deployment remains separate. Complete shared-document diffs were checked before publication, preserving other channel content and all 11 unrelated drafts. Continue reviewing the complete document when publishing future shared case/person/client edits.

Review ledgers: [source-row status](../../renaissance-rewrite-v4-row-status.csv), [logo identity/artwork status](../../renaissance-rewrite-v4-logo-status.csv), [approved mapping plan](renaissance-content-rewrite-plan-v4.md).
