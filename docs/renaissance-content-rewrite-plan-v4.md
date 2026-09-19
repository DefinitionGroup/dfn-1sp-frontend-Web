# Renaissance v4 content mapping plan

Approved plan, revised 19 September 2026. The approved content implementation is now published; see [implementation status](renaissance-rewrite-v4-implementation.md) for the 169 reconciled copy entries and [publication record](renaissance-content-publication.md) for the 225 published documents, fresh backup and verification. The sections below preserve the approved mapping and its pre-implementation audit. The preceding workspace checkpoint is commit `c594befb5` on `multiseite/stage`.

## Current decisions and backup

- Work in the repository's local embedded Studio and local Renaissance frontend, both connected to `wu6i3y0h/production`. A hosted Studio or Vercel deployment is not a prerequisite.
- Prepare content as drafts in that dataset and verify it through authenticated local preview. Local Studio is the editing interface; the saved content remains in Sanity's hosted production dataset.
- Keep global case, service, person and client identities.
- Add a **Website content** tab to global cases, with editions for assigned channels. Existing content remains the shared default.
- Each edition can inherit shared content or own its headline, summary, hero, SEO and complete case-block sequence. Support an explicit **Start from shared content** copy action and **Use shared content** reset; customised content must not silently resynchronise.
- Implement and verify case editions first. Bulk content migration follows a successful representative preview.
- Keep Renaissance-owned client-logo selections/artwork with global client references. Keep the existing Renaissance-only shared awards type.
- Use the supplied `/Users/martin/Downloads/Logos/` library for Renaissance client proof: 129 JPEGs, inspected below. Reuse global clients where identities match; preserve their existing artwork for other sites.
- The v4 rewrite is the copy authority for Renaissance. Other sites retain their current content unless explicitly changed.

The requested backup of `wu6i3y0h/production` is complete:

- Archive: `EXPORT/production-before-channel-editions-2026-09-19T11-30-09Z/production.tar.gz`.
- Verified at `2026-09-19T11:31:18Z`: 302 documents, including 13 drafts; gzip integrity, document parsing and unique IDs checked.
- SHA-256: `4734999a00c1f3d95cb710966b1dde0552d597d2dc12fe1a6b7853f28008ef18`.
- Manifest and checksum file are saved beside the archive. The folder is excluded from Git.
- Cloudinary references are included; external media binaries are not copied. Sanity reported no native asset files.

The user has now explicitly selected `production` for this work. Preserve existing drafts and refresh affected-document snapshots/revisions immediately before each write batch; the full export remains the baseline recovery artifact. The deployed preview's environment is not a dependency of this local implementation. Do not run old migration helpers that hardcode `dev-dataset` or switch datasets to accommodate them.

## Local authoring and review workflow

- Start the root Next.js app with `pnpm dev` and use its embedded Studio at `http://localhost:3000/studio`. Start Renaissance with `pnpm dev:renaissance` at `http://localhost:3003`. Reuse a verified running process if present; neither port had a listener during this review.
- `sanity.config.ts` imports the shared schema and environment module and selects `http://localhost:3003` for Renaissance Presentation in development. Root and Renaissance environment files select project `wu6i3y0h`, dataset `production`, API `2025-09-16`; Renaissance explicitly selects `renaissanceWeb`.
- Viewer-token configuration is present in both environments. The draft-mode route and shared fetch helper exist. Verify the signed-in Studio session, local-origin access, preview authentication and draft rendering when starting implementation; configured credentials do not prove that browser workflow works.
- Local schema changes appear in the local Studio. Validate source schema/types/queries/renderers together. A stored-schema upload is a separate operation used by hosted schema consumers; neither it nor a Studio deployment is required merely to edit through the local Studio. See [Sanity's local development documentation](https://www.sanity.io/docs/studio/development) and [schema deployment documentation](https://www.sanity.io/docs/apis-and-sdks/schema-deployment).
- A draft-only channel assignment must be visible in authenticated preview while remaining absent from ordinary published queries and sitemaps. The business flag `isPublished` and Sanity's draft/published document state are separate; never publish a pilot just to bypass a preview filter. If needed, narrowly adapt authenticated preview filtering while retaining ordinary publication rules.
- Draft edits to an existing global case must preserve all unrelated draft fields. Publishing that document publishes its complete current draft, including every channel edition. Review the full document diff before any later publication; the Website content tab does not create independent publishing lifecycles.
- Use the local Studio for editorial review. Repetitive imports can use repository scripts against the same explicit project/dataset, with dry-run manifests, revision guards and draft-only writes; no deployed Studio is involved. New draft references must follow the repository's weak-reference/strengthen-on-publish pattern where necessary.
- The user approved implementation after final review. Current progress is recorded in the linked implementation status. Hosted Studio, stored-schema, frontend and public-domain releases are outside this local preparation phase.

## Recommendation

Use the workbook's rewritten copy as the editorial authority, and the existing Renaissance PageBuilder as the presentation system. Map by meaning and campaign identity, not by spreadsheet order or a similarity match against old text. Change the composition where the rewrite changes the offer. Extend existing contracts only where the supplied content cannot be represented faithfully.

The result should remain the current Renaissance visual experience: full-bleed game imagery, branded hero, editorial sections, petrol/teal/sand, and existing motion. The old six-service positioning must not survive merely because the current layout has six slots.

## Evidence and source precedence

- Source workbook: `/Users/martin/Downloads/RPR_Website_Rewrite_Comparison_v4.xlsx`.
- `Rewrite Comparison!A2:H171`: 170 entries across seven general page categories and 66 case-study entries. Column F supplies replacement copy. One F cell, F27, is a removal recommendation rather than publishable copy, leaving 169 copy entries.
- `DA Audit Scores!A2:I74`: audit commentary on 73 page entries. Treat this as diagnostic context, not an instruction to delete, merge, redirect, or publish anything.
- Columns A–D describe the old site's organisation. “H1”, “Paragraph”, and “List Item” are editorial roles, not Sanity `_type` names. Preserve wording while assigning the appropriate heading level in the new context.
- Column E helps identify what was rewritten; it is not a fallback that overrides F. Columns G/H explain intent and flag questions. Never import audit commentary, `[REMOVE - DUPLICATE]`, or reporting annotations as public copy.
- Existing CMS supplies document identity, media, references and useful content outside the rewrite. Retain such content only after checking for conflict, duplication and relevance. Workbook omissions are not automatic deletion requests.
- New teaser copy, SEO summaries or missing labels must be marked as derived copy for review; do not present them as verbatim v4 text.

The rewrite takes precedence over the older Figma/content baseline in DESIGN.md. Its visual rules still apply. Content precedence does not make conflicting dates, operational promises or unsupported metrics verified facts.

## Current state, checked directly

Project `wu6i3y0h`, API version `2025-09-16`, channel `renaissanceWeb`, language `en`.

Both local root environment files and `apps/renaissance-web/.env.local` select `production`; the app file explicitly selects `renaissanceWeb`. FLZR and MSM local files also select production. Root Studio and frontend import the shared environment module. Re-ran `pnpm doctor:sanity -- --channel renaissanceWeb --language en` against production for this revision: one Renaissance homepage/page, one menu, five assigned clients and zero assigned cases/services/people/units. This checks local configuration and API content, not a signed-in browser session.

The earlier audit found this composition in both datasets; production remains the selected target and its assignment counts were reconfirmed:

| Content | Count / state |
| --- | --- |
| Renaissance page documents | 1: `page-renaissance-home-en` |
| Homepage composition | 17 array entries: 10 content blocks and 7 section markers/reset |
| Renaissance menus | 1 footer menu |
| Assigned cases / service documents / people | 0 / 0 / 0 |
| Assigned client documents | 5 |
| Shared People content | One portraits document and one awards document, selected through site settings |

Therefore this is partly replacement and partly new page/content creation. Services and cases have routes but no Renaissance page documents. Contact has an app-local fallback and an enquiry form. About and Clients can use the generic page route once populated. The two homepage story slides are inline carousel items, not existing Renaissance case documents.

Implementation is explicitly limited to `wu6i3y0h/production`, `renaissanceWeb/en`, and the shared contracts needed for its editions. Preserve other channels' content and published output. Do not mirror changes into `dev-dataset`.

## Proposed homepage composition

Keep the current order: hero → problem and selected stories → services → client proof → people and awards → reach → origins → registration → footer. The structural `renaissanceSectionBand` markers remain layout/navigation controls; they are not extra copy sections.

All row references below mean the `Rewrite Comparison` sheet.

| Current location | Source | Target fields / proposed treatment |
| --- | --- | --- |
| Homepage metadata | F2–F3 | `metadata.title`, `metadata.description`. Preserve the supplied wording in the draft. Check title-template duplication and the long description in preview; any shortened SEO version is a separately reviewed derivative. |
| `renaissance-home-hero` | F4 | `heroShowTime.heading` = “Getting the right coverage for your game shouldn't depend on luck.” Keep `headingTag: h1`, logo and game media. Keep one short, non-conflicting support line and current valid CTAs. Remove redundant old slogan/subheading rather than stacking three competing headlines. |
| `renaissance-stories-intro` | F5–F6 | `introBlockTypoSophisticated.header.mainHeadline` and `.description`. This becomes the problem statement leading into campaign evidence. Use compact layout if the full rewritten heading is too long for the existing oversized split; do not shorten it to fit. |
| `renaissance-stories` | F54–F56 or F69–F70; F61–F62 | Keep the `carousel` and existing Romeo/Yooka media after identity checks. Use concise source excerpts or reviewed teasers and link to their case pages. Current Romeo subtitle says “Global launch campaign · 2025”, while v4 separates the 2026 launch and 2025 Gamescom activation: resolve this before mapping. |
| `renaissance-services-intro` | F7 | Replace “Six services. One mission.” with “What we actually do”. Remove or review the old supporting sentence rather than retaining a contradictory service count. |
| `renaissance-services` | F8–F11 | Keep `cardContainerComponent`; replace six cards with four. Split each supplied list item at the label/explanation boundary into `cards[].headline` and `cards[].text`, preserving wording. Use two desktop columns and keep the established mobile presentation. |
| `renaissance-client-logos` | Supporting proof; F29–F30 belong primarily on Clients | Keep `clientLogoCarousel` and its motion, sourcing an editorial selection from the supplied 129-logo Renaissance collection. Reuse/create correctly scoped client references. Replace this surface's selection without deleting the five currently selected global client documents. The Clients page owns the fuller roster. |
| `renaissance-people-intro` | F25–F26 reused from About | Use the revised team positioning as a section heading and paragraph after checking the 19-person claim and career-history statement. Keep approved shared portraits as selected team imagery. Four current portrait records are not a 19-person directory. |
| Shared awards under People | F12 | Add optional `description` to `renaissanceAwardLogoWall` and populate `renaissance-shared-awards-en.content.description` with the full award paragraph. Keep logos and short heading. Update schema, type, query projection and renderer together; keep awards centrally reusable. |
| `renaissance-global-reach` | No direct replacement | Retain `globeComponent` provisionally as additional supporting content. Verify the UK/Los Angeles/China wording and distinguish locations from partner coverage. Do not infer offices from campaign territories in the workbook. |
| `renaissance-origin` | F3/F6 support “since 2015”; fuller founder copy absent | Keep `twoColContentSection`, logo composition and `/about-us` CTA. Replace the ambiguous “21 years in the making” heading with a source-grounded “Since 2015”, marked as an extracted label. Retain/review the existing paragraph if non-conflicting; do not invent a founder biography from a removal note. |
| `renaissance-register` | F13–F14 | Map to `registerBlock.headline` and `.description`. Preserve the creator/media choices and canonical `/contact` destination. The fuller media-specific paragraph F36 belongs in the contact registration section. |
| Footer | F15 | Add a dedicated Renaissance footer legal-text field and render the supplied ICO line there, outside page content. Do not misuse the 1SP external banner or silently replace copyright. |

### Four core services and additional delivery

The four homepage services are, in workbook order:

1. Earned PR Campaign Planning.
2. Paid & Organic Influencer Planning.
3. Product Management & Support.
4. Go-to-market Communication Planning.

Current “Traditional PR” and “Content Creators” media may transfer to the corresponding new services. Product Management and Go-to-market need editorially appropriate existing assets or new approved assets. Do not blindly reuse the remaining four images by position.

“Corporate Comms” and “Measurement & AI” have no equivalent core offer in v4. Remove them from the primary homepage service set; archive the old copy in the migration record. Do not delete shared service documents or invent replacement descriptions.

Events and paid media remain additional services on `/services`. The workbook itself has a hierarchy conflict: F22 says “Also available through our partner network”, but F24 describes end-to-end event delivery. Resolve it by applying F22 to paid media only, and presenting Event Management & Production separately using its supplied label and paragraph. Paid/organic creator partnerships remain a core service; that is distinct from partner-delivered media buying. Link Dark Envoy and IIDEA as relevant evidence after their case pages exist.

## Page map beyond the homepage

| Workbook page / rows | Proposed route | Composition and copy destination | Gap to resolve |
| --- | --- | --- | --- |
| Services, 16–24 | `/services` | `heroShowTime.heading` F16, `.paragraphs[0]` F17; four `contentSection` sections for F18–F21 with semantic service anchors; partner heading F22 and paid-media item F23 in a separate `contentSection`; F24 event section; optional selected-case carousel with valid case links. | New Renaissance page. Use the four full service paragraphs here, short descriptions on Home. Do not force a six-service grid or hide the main offer in tabs. |
| About, 25–28 | `/about-us` | `heroShowTime` F25/F26; `twoColContentSection` for one verified founder biography; `contentSection` for F28; `smartPeople` for a real roster if available; reusable awards/portraits for selected proof. | No About page or person documents assigned to Renaissance. Stefano already exists globally under 1SP and should be reused. F27 is a duplicate-removal proposal, not a biography. F28 refers to five pillars but does not provide the five definitions. Do not invent them or duplicate a founder section to mimic the old page. |
| Clients, 29–30 | `/clients` | `heroShowTime` F29/F30; the Renaissance client collection rendered as a browsable logo grid; selected `carousel` evidence and `/cases` link. | Account for all 129 supplied files, preserving brand distinctions and documenting artwork exceptions. Extend the existing logo block with a Renaissance grid presentation so the full roster is discoverable without waiting for the six-slot swap animation. No 66-logo implication from 66 campaigns. |
| Contact, 31–33 | `/contact` | Text-led H1 F31 and paragraph F32 via existing intro block with an additive heading-level option; `contentSection` F33 with email links; existing route-owned `ContactForm`, configured through `page.contactForm`. | New CMS contact page replaces fallback. Current form persists enquiries to Sanity; inspected handler does not send email. Confirm monitoring/notification arrangements before promising a two-business-day reply. Do not add a second form inside page blocks. |
| Register, 34–36 | `/contact#registration` | F34 as H2 under the contact H1; separate `contentSection` passages F35/F36 for creators and media, connected to an audience-aware version of the existing form. | Proposed consolidation preserves the established `/contact` decision. Add actual enquiry intent and relevant creator/outlet fields, or integrate the verified registration destination. A generic project enquiry is not automatically a working registration system. Any old `/register` URL needs a deliberate redirect after legacy URL verification. |
| Case Studies index, 37–38 | `/cases` | `heroShowTime` F37/F38 followed by `casesGalleryFilteredWithPagination`, querying `renaissanceWeb/en`. | Existing renderer filters by services, not region, genre or platform. Extend taxonomy, query and UI to fulfil F38 before publishing it. Validate “66 launches”: 66 workbook entries include events, announcements and distinct campaign phases, and may not all become published launches. |

Home, About and Clients reuse proof, not repeated full text sections everywhere. Keep Home concise while preserving the complete rewritten material on its primary page.

## Global ownership and site-specific content — follow-up audit, 19 September 2026

**Recommendation: retain global case, person, client and service identities. Give Renaissance explicit control over its editorial content, composition and proof selections.** Differences in headlines, emphasis, imagery and block order are legitimate. Conflicting claims about the same entity/campaign require reconciliation.

The earlier zero counts meant zero assignments to `renaissanceWeb`, not that Renaissance had no related records in Globals. Fresh queries of both datasets confirm the same following relationships to the English Renaissance unit, `cc6775b3-7157-48d1-be0f-a5843c3ba89c`:

| Global records | Current state |
| --- | --- |
| Services | “Video Games PR & Communications” and “Consumer Tech PR & Communications” reference Renaissance through `unitsrel`; both are assigned to `1spWeb`. |
| Person | Stefano Petrullo (`e957ce16-5b8b-4468-a72e-efb5543f4ae3`) has Renaissance as his unit and is assigned to `1spWeb`. |
| English cases whose `units[]` includes Renaissance | “Shaping Culture Where the Industries Meet”; “Making S.T.A.L.K.E.R. 2 Unmissable, Everywhere, All at Once.”; “Building Tencent’s PR Powerhouse Across Europe”; “A Decade with EA. It’s in the Partnership.” None is assigned to `renaissanceWeb`. |
| Unit's own selected-case list | EA, Microsoft and Tencent. This differs from the reverse case relationships: it omits STALKER/events and includes Microsoft, whose own unit list does not include Renaissance. Treat this as a relationship/curation discrepancy to inspect, not an instruction to sync or delete automatically. |

The two concepts have different jobs: the unit relationship describes involvement; `channel` declares website eligibility. Neither automatically implies the other.

### Cases: one entity, optional site edition

Start with an optional site-edition array on the existing `caseStudy` document. This is a proposed additive contract, not a feature already implemented:

Studio organisation: **Campaign & relationships**, **Shared content**, **Website content**, **Publication**. Within Website content, show editions for assigned channels and clearly indicate inherited versus customised content. Enforce one edition per channel within the existing language document. Selecting a channel for an edition and assigning publication eligibility remain distinct, validated operations.

```text
Global caseStudy
  shared campaign identity, client, participating units/people, assets
  channel assignments and language
  existing default title/description/casesPageBuilder
  optional siteContent[]
    channel (unique within this language document)
    title, summary, hero selection, SEO
    bodyMode: inherit | custom
    casesPageBuilder[] (the site's complete ordered composition)
```

The v4 Renaissance rewrite lives in the Renaissance edition. The current default remains available to 1SP/MSM, so a Renaissance rewrite does not overwrite their narrative. New Renaissance-only campaigns can still be global `caseStudy` records with only `renaissanceWeb` selected; “global type” does not mean “published on every site”.

Use one resolved case contract for detail pages, list cards, related cases, metadata, structured data, route lookup and sitemap entries. Resolve the site edition once. Preserve the global `_id` for relationships. Do not scatter fallback logic across components.

Keep existing shared slugs in the first implementation. Edition-specific slugs are deferred until an actual URL requirement justifies collision validation, preview resolver changes and additional redirects. The rewrite can use a different title without changing the campaign's route. Required title/summary fields reject invalid empty overrides; optional fields must distinguish inherit from intentional removal.

Use an explicit body mode, not per-block merge-by-index or `customBody.length ? customBody : sharedBody`: an intentionally empty/hidden section must not resurrect old copy. A custom edition uses its own complete block sequence; it does not duplicate the campaign entity. Validate supported blocks and required content before publication. Keep source facts and campaign scope traceable when different sites highlight different results.

Initial site editions can use the existing four case blocks. Add a Renaissance-specific block only for an actual content need, such as an attributed quote. Do not allow the full general page-builder registry inside a case without matching schema, query and renderer support.

This minimal model still publishes the global Sanity document as one unit. If separate editorial teams later need independent draft/publish cycles, move site editions into `casePresentation` documents referencing the same global case. That separates editorial lifecycle without duplicating campaigns. It is not required merely to allow different wording now.

Limit the first Website content implementation to cases. Services, people and logos use the site-owned composition/presentation described below; a generic channel-edition framework across every global type is not needed for this rewrite.

### Services: allow different granularity

The two existing 1SP services are broad categories; the rewrite's four offerings are more specific. They are not a one-to-one rename. Keep the 1SP categories and let Renaissance's page blocks own the four labels, explanatory copy, imagery and order.

Where relational uses such as case filtering need the four offerings as entities, create distinct `services` records assigned only to Renaissance, or reuse an existing truly equivalent service with site-specific presentation. Do not create a second service solely because its wording differs. Do not add a `renaissanceService` type just to obtain another label. Link more specific offers to the relevant shared category when useful, rather than forcing equal counts and names across websites.

Before creating scoped service records, check remaining consumers of the legacy `SERVICES_QUERY`: that query filters by language but not channel. Do not assume channel assignment alone isolates every historical query. Preserve 1SP output deliberately.

### People: shared identity, curated presentation

Reuse Stefano's existing person record. Add Renaissance membership when publication is intended. Keep the real name, affiliation and contact identity central; allow a site-specific bio, display role and portrait choice where needed.

The current Renaissance shared portrait grid is a curated visual set, not a people database. It can remain Renaissance-specific. Add optional person references with presentation overrides so it can select global people without forcing the same image or order as 1SP. Existing inline portrait items remain compatible while unnamed images are reconciled. A full team directory should resolve real person records, not count portrait slots.

### Client logos: shared clients, Renaissance-owned collections

Current homepage carousel: five global `client` references. Ubisoft is assigned to both 1SP and Renaissance; Xbox, Epic Games, Warner Bros. and Riot Games are already assigned only to Renaissance. Their global document type does not make them 1SP-owned.

The nine logos in Origins are different: they are already page-local `renaissanceLogos` entries using Renaissance asset paths. There are therefore two editorial mechanisms to consolidate, not one global logo list to detach.

Keep canonical client records. Let a Renaissance-owned reusable logo collection select clients and order, with optional local artwork/display-name overrides. An item would contain `client` reference, optional `logoOverride`, optional `displayName`, and alt text. Resolve omitted artwork from the client record. Use an inline collection for a one-off page; use a reusable Renaissance collection where Home, Clients and Origins need the same selection. Do not duplicate client entities to get white logos or different artwork.

A page's manual selection never grants publication permission automatically. Enforce channel/language eligibility in the picker, validation and query. The current implementation does not consistently do this; see verification below.

### Supplied client-logo library — inspected 19 September 2026

Source: `/Users/martin/Downloads/Logos/`. The user identifies these as Renaissance client logos. All 129 files decode as RGB JPEGs, total 1,701,586 bytes, with no byte-identical duplicates. Their longest side is at most 200 pixels; 59 are 200 × 200. The images have opaque backgrounds and varied built-in whitespace. Contact sheets were visually reviewed; filenames are input labels, not guaranteed canonical client names or instructions.

| Mapping / asset issue | Planned handling |
| --- | --- |
| `GSC_Game_World.jpg` | Exact published English client-name match: `bf0e4443-5cd6-40c0-9422-f0a15a4195c5`, currently assigned to 1SP. Reuse the identity, add Renaissance assignment in draft and keep supplied Renaissance artwork in the collection override. |
| `Tencent_Games.jpg` / existing Tencent | Candidate relationship with `2295e840-8019-443f-8b17-7d347d505ccd`; confirm whether the collection represents the same identity or a distinct brand before reuse. |
| `Amazon_Kids.jpg` / existing Amazon | Sub-brand is not automatically the parent client `7442fb54-ca44-4880-ba04-bab0531fe77b`. Resolve identity explicitly; do not overwrite the Amazon name or logo. |
| Other source names | No other exact normalised match among the 26 currently published client records. Check drafts, aliases and campaign relationships before creating genuinely new global `client` documents assigned only to Renaissance. Do not infer that every unmatched filename requires a new document. |
| `Wired.jpg` | Visually appears to be a small photograph/graphic rather than a clean wordmark. Keep it in the import manifest as an artwork-review exception, not a guessed replacement logo. |
| `Limit_Break.jpg` | Visible artwork reads “Limit Break Mentorship”. Verify that this is the intended client identity/artwork before displaying it. Other valid logos can proceed independently. |
| Existing five Renaissance carousel clients | None has an exact filename match in this delivery. Use the supplied library as the new selection source; retain existing global records and references used elsewhere. Absence from this folder is not a deletion instruction. |

Implementation rules:

1. Preserve originals and record filename, SHA-256, dimensions, chosen display name, matched/new client identity, Cloudinary asset ID, collection membership/order and review status in an import manifest. All 129 files must be accounted for, including held artwork. Keep a local original-file copy beside migration recovery material; the earlier dataset export does not include these files or future Cloudinary uploads.
2. Use the existing Cloudinary media workflow and `cloudinary.asset` contract. Upload usable supplied originals to a Renaissance-specific folder with deterministic IDs/checksums so re-running the import reuses assets. Do not replace a shared client's canonical logo with lower-resolution or different local artwork. No local `/Downloads/` paths go into CMS content.
3. Implement one scoped `renaissanceClientCollection` document type, following the existing Renaissance shared-content pattern. Collections own ordered items with a global `client` reference, optional `logoOverride`, optional `displayName` and alt text. Pages can select different collections/subsets for Home, Clients and Origins. Existing `selectedClients` arrays remain compatible; the new collection path is optional and channel/language validated.
4. Use a curated subset in the existing homepage swap grid; use a browsable full roster on Clients, alphabetically ordered unless editorial order is supplied. Origins remains a deliberate historical selection. Referencing one reusable collection must not force all three surfaces to display all 129 logos.
5. Preserve aspect ratios, original brand colours and reasonable display size; use a consistent light logo area for these opaque JPEGs. Do not invert the entire JPEG, stretch, enlarge it into hero artwork or fabricate vector/transparent versions. Disable the optional grayscale treatment for this supplied colour set. Verify optical size, contrast, mobile layout and lazy loading; flag originals too small for the selected slot. Higher-resolution versions are an improvement, not a blanket prerequisite for draft composition.

These files are client proof, not award assets. They do not resolve the missing award names/years/status or the rewrite's factual questions.

### Awards: already Renaissance-only

`renaissance-shared-awards-en` is a `renaissanceSharedAwards` document explicitly scoped to `renaissanceWeb/en`. “Shared” means reusable across Renaissance pages. The page query and schema prevent another channel from treating it as its own content. Keep this design; no detachment or cross-site award abstraction is needed.

Improve the actual award records: currently eight slots reuse five image URLs, and every name is “Industry award”. Supply accurate award name, organisation, year and winner/finalist status, plus the rewritten paragraph. Eight image slots must not imply eight independently verified awards. Preserve repetition only if it is deliberately decorative and accessible.

### What was verified, and what does not yet work

Read-only checks used the real exported GROQ queries against both datasets, then the same queries against in-memory fixtures. No channel assignment or content was saved.

| Check | Result |
| --- | --- |
| Live STALKER 2 query for 1SP | Returns the existing case and its `challengeAndSolution` / `resultsMetrics` blocks. |
| Same live slug for Renaissance | Returns null, correctly, because the channel is not assigned. |
| Fixture with Renaissance channel added | Appears in the case listing and detail query; all four current case block types survive projection and are registered in Renaissance's `CasePageBuilder`. |
| Independent Renaissance case copy | Not implemented. Title, summary and `casesPageBuilder` currently resolve from the same shared fields for every assigned site. |
| Results layout field | `resultsMetrics.fullWidth` exists in schema/renderer but is omitted by `CASE_STUDY_BY_SLUG_QUERY`; fixture value `true` is lost. Fix the projection before promising complete field parity. |
| Smart People | Still requires `smartPeoplePromo1SP == true` and omits language filtering. Fixtures reproduce an English assigned person being excluded by the 1SP flag and a German person being returned to an English request. Channel-aware selection needs an explicit contract. |
| Manual client-logo selection | Picker filters only for an existing logo; query dereferences without channel/language checks. A fixture client assigned only to 1SP/German still resolves on Renaissance/English. |
| Automatic client logos | Query checks channel but not language. Fixture reproduces a foreign-language client being included. |
| Shared Renaissance awards | The real homepage query resolves the scoped shared award document in both datasets. Existing tests cover defaults, independent local overrides and rejection of foreign channel/language content. |
| Existing focused tests | `pnpm exec tsx --test scripts/renaissance-shared-content.test.ts scripts/renaissance-carousel.test.ts`: 8/8 passed. These do not cover the gaps reproduced above. |

This establishes the query contract and registered renderer support, not completed browser QA for global cases on Renaissance. There is currently no assigned Renaissance case to verify end to end without changing content. The rewrite's longer copy and new fields still need representative preview testing.

Prioritise the site-edition resolver and publication scoping before bulk importing the rewrite. Add contract tests for actual field preservation and one shared case returning different resolved text for Renaissance versus 1SP, while retaining the same identity. Then preview one representative case through the full route before migrating the rest.

## Case-study mapping

Use one global `caseStudy` document per actual campaign identity, with `channel` membership and `language: en`. Use the existing `/cases/[slug]` route and `casesPageBuilder`, not generic `page.content` for case bodies.

The field names below describe the resolved case interface. For an existing case shared with another site, the Renaissance replacements must be written to its Renaissance edition, not the root shared fields. A new case assigned only to Renaissance can use the shared default until it actually needs a second narrative; do not store two identical bodies merely to populate both tabs.

| Source | Destination | Rule |
| --- | --- | --- |
| Page/game label | `caseStudy.title`, `slug.current` | Preserve the game/campaign entity in H1; retain a verified existing slug when reusing a record. Use campaign year/phase where needed to distinguish two entries. |
| Intro H2, where supplied | `casesPageBuilder[].headlineChallenge.title` | Exact rewritten H2. These occur for the first six case entries. |
| Intro paragraph | `headlineChallenge.description` | Full rewritten paragraph. For cases without a supplied H2, use a clearly identified neutral structural label such as “The brief”, not an invented marketing claim. |
| Results paragraph | `resultsMetrics.description` | Preserve the full results narrative, names, time windows, territories, qualifiers and attribution. `resultsMetrics.title` can be the structural label “Results”. |
| Selected numeric facts | `resultsMetrics.metrics[]` | Optional extraction of a few exact metrics, normally `type: animatedNumber`. Counts are not percentages. Keep “+”, estimates and scope. Keep original narrative even when a metric is extracted. Do not sum overlapping measures or equate potential reach/UVPM with actual views. |
| Client quote F155 | Proposed optional attributed quote on `resultsMetrics` | Preserve the Autonauts quote and Michael Fisher / Product Manager / Curve Digital attribution as a quote, not as a metric. Renderer/schema/query need a small optional quote contract. Named media quotes already inside results must keep attribution. |
| Hero/card/SEO summary | `caseStudy.description` | A short exact excerpt where it stands alone, otherwise a separately reviewed derivative of F. The current app uses this field for hero and metadata. Never copy old draft metadata over the rewrite or dump the entire results paragraph into the hero. |
| Client / services / imagery / publication date | Existing relation/media fields | Resolve from actual campaign sources. The workbook does not supply a complete asset library or all publishing fields. Do not fabricate a date, portrait, game image or client reference. |

For the six intro-only cases, publish a compact evidence page only when the supplied text and verified media are sufficient. Do not add empty Results/Approach blocks or manufacture a longer narrative. The case appendix lists the precise row pattern for every entry.

Do not force a Challenge → Solution → Approach template onto two source paragraphs. `challengeAndSolution` and `approachSection` are available but should be used only when there is enough distinct material to populate them without duplication or invention.

### Shared content and campaign identity

No cases are currently assigned to Renaissance, but that does not mean all 66 are new global entities. Both queried datasets already contain the cross-channel candidate `9d295e99-7801-42b8-96e7-a15afb267e72`, “Making S.T.A.L.K.E.R. 2 Unmissable, Everywhere, All at Once.”, assigned to 1SP/MSM. Check whether it is the same campaign or a different unit's contribution before deciding reuse.

If the same campaign is shared, reuse the document and add Renaissance membership. Do not overwrite its shared copy for 1SP/MSM as part of this task. Use the site-edition approach described in the follow-up audit where narratives differ, rather than duplicating the campaign entity. Keep shared relation/media identity intact. Records used by only Renaissance do not need a redundant second copy of their own default body.

Keep Romeo 2025 Gamescom and Romeo 2026 launch distinct. Keep Gamescom 2023/2024/2025 distinct initially; the audit's merger suggestion is not an approved information-architecture change. Do not merge Yooka-Laylee and Yooka-Replaylee, the two Broken Sword campaigns, or the two S.T.A.L.K.E.R. titles.

### Legacy URLs

The audit uses `/case-studies/...`; the app uses `/cases/...`. Build an explicit old-URL → resolved-document → new-URL map. Do not derive redirect targets by stripping a prefix blindly. Preserve existing shared-case slugs where appropriate and isolate redirects to Renaissance.

Workbook-identified exceptions to verify against the old site before redirect implementation:

- `/case-studies/overwatch-2/` is labelled Yooka-Laylee.
- `/case-studies/beneath-a-steel-sky/` is labelled Beyond a Steel Sky.
- `/case-studies/private-division/` is labelled Disintegration.
- `/case-studies/baldours-gate-enhanced-edition/` and `/case-studies/forgotten-anne/` need exact legacy-to-entity mapping despite spelling differences.

These are workbook-reported old-site findings, not newly verified live defects. A host/domain migration requires redirects at the legacy host as well as correct routes in this app.

## Targeted implementation changes

| Area | Required adjustment |
| --- | --- |
| Services | Make the Renaissance services branch respect the existing `columns` setting. It currently hardcodes `lg:grid-cols-3`; setting `columns: 2` in Sanity alone will not fix a four-card layout. |
| Awards | Optional body description on the existing Renaissance award block and its shared-content projection. Render the complete awards paragraph at body size. |
| Page headings | Add an optional semantic heading-level setting to the intro contract for a text-led Contact H1, defaulting to existing behaviour elsewhere. |
| Case prose | Fix the Renaissance `headlineChallenge` presentation: it currently renders the description as a large H2 and the title as H3. Use H2 for the section title and readable paragraph text for the description. Ensure long results support paragraphs/line breaks without clipping. |
| Case quotes | Optional attributed quote within Results, especially F155. Keep it out of numeric metrics. |
| Case discovery | Populate real campaign region/genre/platform data; extend the existing gallery/query for the promised region filter and genre/platform search. Do not relabel service tags as regions. |
| Client proof | Add a scoped reusable client collection with artwork overrides, optional collection reference on the existing logo block and a Renaissance grid presentation for Clients. Keep the existing homepage swap presentation and legacy references compatible. |
| Contact / registration | Keep one canonical destination; add intent handling and needed creator/media inputs plus verified processing. Current form's `website` field is a hidden honeypot, not a creator-channel URL: use a separate field. |
| Footer | Optional Renaissance legal text, queried from footer settings and rendered in the legal area. |
| Case website editions | Implement the agreed optional channel-edition tab and resolver first; populate it for confirmed shared campaigns and retain defaults elsewhere. Defer custom slugs and independent publishing documents. |

No new homepage renderer or broad replacement block library is needed. For every schema extension, update schema, generated/shared types, GROQ projection, renderer and local Studio together. Stored-schema and hosted-Studio updates belong to a later release only when those consumers are needed. Keep defaults backward-compatible and site-specific presentation in `apps/renaissance-web`.

Update the Renaissance design/component documentation to remove assumptions about six services and record the new copy authority. Update homepage/contact fallbacks and relevant component defaults so old copy cannot reappear when the CMS document is absent. Preserve intentional empty values instead of restoring superseded text through hardcoded defaults.

## Content decisions before publication

These are bounded publication questions; none blocks planning or preparation of drafts.

| Item | Resolution proposed |
| --- | --- |
| “19-person” team; every person's prior games career | Verify current roster. Preserve supplied text in draft pending confirmation; request an explicit revision if it is no longer true. |
| “66 launches” | Reconcile the 66 entries with publishable, distinct campaigns and actual launch work. Do not automatically substitute the number of CMS documents into this wording. |
| “Since 2015” versus “21 years in the making” | Use the sourced company founding date; treat any founder-experience number as a separate claim requiring its own wording/evidence. |
| Awards chronology | Check named awards/years and supplied logo identities. The draft takes F12; do not roll the dates forward automatically. |
| Two-business-day response and early access/review-code promise | Confirm operational ownership and actual registration/fulfilment process. A successful Sanity write alone does not fulfil either promise. |
| “Five simple pillars” | Obtain the named pillars from an approved source if showing a five-part breakdown. Otherwise keep the supplied paragraph without inventing a list. |
| Metric terminology | Preserve distinctions among UVPM, UMV, potential audience, actual views, VOD views, hours watched and subscribers. Check especially F122's “6.9bn views from earned media” against its underlying reporting source before presenting it as actual consumption. |
| Ongoing/timing claims | Check F143 “continuously…through launch and beyond”, F163 historical campaign tense and time-relative “to date” results. Keep source time windows visible. |
| Unsupported originals / audit removals | Do not reintroduce leaked GiAdmin notes, incomplete prose or duplicated biographies. Keep the workbook's removal/merger proposals in the issue register, not public fields. |
| Missing founder/team/client/media inputs | Track as missing input per page, preserving available verified assets. Do not treat the rewrite workbook as a complete migration export of the old site. |

## Execution sequence

1. **Start and verify the local workspace.** The project/dataset selection is confirmed and production backup is complete. Start root Studio and Renaissance locally; verify the signed-in editing and draft-preview flow against production. Refresh affected-document snapshots/revisions and preserve other channels' outputs as the regression baseline. No deployment or dataset switch is required.
2. **Implement the case Website content tab.** Add the optional channel-edition schema, types and editor controls. Keep existing root content as the shared default. Provide explicit inherit/custom behaviour, a copy-from-shared action and reset-to-shared action. A custom body owns the entire ordered case-block array. Maintain one global case identity and existing relationships.
3. **Resolve editions consistently and close case mapping gaps.** Use one channel/language-aware case contract for routes, detail bodies, listings, related cases, metadata, structured data and sitemaps. Preserve `resultsMetrics.fullWidth`. Validate case block support, draft preview and other-channel isolation. Cover inheritance, explicit empty values and field preservation with focused tests. Preserve shared slugs for this phase.
4. **Prove the model with a shared-case pilot.** Reconcile the existing STALKER 2 campaign and prepare a Renaissance draft edition using v4 copy. Preview the same global identity locally in Renaissance and 1SP/MSM: Renaissance shows its own narrative, other channels retain theirs. Verify editor controls, list/SEO consistency, links, desktop/mobile layout and draft-only visibility. This is the first concrete review milestone; do not publish the pilot or bulk-import before it works.
5. **Implement Renaissance proof and copy support.** Import the usable supplied logos through Cloudinary, reconcile client identities and create scoped collection drafts with local artwork overrides. Verify homepage subset and Clients roster rendering. Fix logo picker/query eligibility and Smart People promotion/language handling before using those paths. Reuse global people in selected portrait presentations. Extend the existing Renaissance-only awards block with prose and accurate award labels. Adjust the four-service layout, long case prose/quotes, Contact H1, promised case discovery and registration handling. Preserve the current visual system and media where appropriate.
6. **Map and compose the rewritten site as drafts.** Create the row-level manifest with source cell, global identity, site edition, destination block key/field and editorial status. Compose Home, Services, About, Clients, Contact with registration, and Cases index. Migrate cases in batches after checking campaign identity, assets and references; include Romeo's two campaigns, Autonauts and an intro-only case as additional template checks. Preserve exact F copy and identify derived summaries separately. Use revision-guarded, idempotent patches that respect existing drafts. Resolve factual questions and legacy redirect mappings without inventing missing content.
7. **Complete local review and prepare release.** Check all source rows and logo manifest entries, CMS/fallback paths, responsive rendering, contact/registration, redirects, canonicals, sitemap, robots and draft isolation. Run Renaissance build plus 1SP and affected-channel checks for shared changes. Review the saved drafts, full shared-document diffs and local UI. Publishing content or deploying frontend/Studio/stored schema is a later release step; none is required to complete the local implementation review.

The immediate implementation deliverable is the channel-edition tab, its shared resolver and one verified shared-case preview. Completing the entire 66-entry rewrite is the subsequent content phase.

## Acceptance criteria

- An existing global case returns different approved content for Renaissance and 1SP/MSM while retaining one `_id` and unchanged shared relationships.
- Cases without a site edition retain existing behaviour. Custom editions never unexpectedly inherit old body blocks; editor copy/reset actions have clear results.
- Site editions are used consistently by cards, detail pages, metadata, structured data, route lookup and sitemaps.
- Existing draft content survives migration; a channel-specific change does not overwrite another channel's fields.
- Local Studio and Renaissance both use production; authenticated preview shows the pilot draft while ordinary requests and sitemaps exclude draft-only publication assignments. No publishing is used as a preview workaround.
- All 129 supplied logos appear in the import manifest as matched, created or explicitly held for artwork/identity review. Canonical shared logos remain intact; Home and Clients resolve Renaissance collection artwork. Every displayed client passes channel/language checks.
- The Clients page exposes the roster without relying solely on randomly rotating slots. Logos preserve aspect ratio and remain legible without oversized low-resolution rendering.
- Every workbook row 2–171 is accounted for as mapped copy, derived/adapted placement, or editorial exception; F27 never renders publicly.
- Full source copy survives extraction into fields; long paragraphs are not silently truncated or overwritten by legacy defaults.
- Homepage has the four v4 core services, relevant media and no residual “Six services” claim.
- Exact copied text and derived summaries are distinguishable in the review manifest.
- Six general destination pages cover the seven workbook categories, with Register consolidated into Contact and its heading adjusted semantically.
- Case index promises only working filters/search; all published cases have correct identities, channel/language, media and valid links.
- Shared documents and other channels are unchanged except for explicitly reviewed additive assignments/contracts.
- One H1 per page, body paragraphs remain paragraphs, responsive long-copy layout passes desktop, 390px mobile and short landscape checks.
- Contact and registration receive the correct audience intent, save/process successfully and display appropriate success/error states.
- Verify CMS and fallback home/contact paths, `/sitemap.xml`, `/robots.txt`, canonical URLs, locale-free routing, redirect targets and preview non-indexability.
- Run Renaissance build and focused tests for changed behaviour; shared platform/schema/query changes also require the existing 1SP build and affected-channel regression checks.
- Re-query saved drafts and published baselines separately and verify the local authenticated preview. Hosted deployment verification is deferred to the release phase. A successful build alone is not content or publication verification.

## Source-code references

- `apps/renaissance-web/components/RenaissancePageBuilder.tsx`: homepage/general page registry and section composition.
- `apps/renaissance-web/components/pagebuilder/pg-CardContainerComponent.tsx`: hardcoded service columns.
- `apps/renaissance-web/components/pagebuilder/pg-IntroBlockTypoSophisticated.tsx`: paragraph and heading layouts.
- `apps/renaissance-web/components/CasePageBuilder.tsx` and `packages/sanity-schema/src/Global/Cases/caseStudy.ts`: the four case block types and `casesPageBuilder`.
- `apps/renaissance-web/components/pagebuilder/cases/pg-HeadlineChallenge.tsx`: current heading/body semantic mismatch.
- `apps/renaissance-web/components/pagebuilder/pg-CasesGalleryFilteredWithPagination.tsx`: current service-only filters.
- `packages/sanity-schema/src/RENAISSANCE/Components/renaissanceAwardLogoWall.ts`: headline/logos but no body field.
- `apps/renaissance-web/components/RenaissanceRegisterBlock.tsx`: two CTA cards and legacy copy defaults.
- `apps/renaissance-web/components/ui/ContactForm.tsx` and `apps/renaissance-web/app/api/contact/route.ts`: enquiry form and Sanity submission handler.
- `apps/renaissance-web/components/RenaissanceSiteWrapper.tsx`: actual footer implementation and related navigation derivation.
- `apps/renaissance-web/data/homepageFallback.ts`, `apps/renaissance-web/data/contactPageFallback.ts`: fallback copy paths.
- `apps/renaissance-web/DESIGN.md`, `design-system/COMPONENTS.md`, `design-system/RELEASE-CHECKLIST.md`: existing visual/component and verification boundaries.

## Case source-row inventory

The following inventory accounts for all 66 case entries. “Intro” means `headlineChallenge.description`; “H2” means its `.title`; “Results” means `resultsMetrics.description`; “Quote” means the proposed optional attributed quote. Names are workbook labels, not automatic slug/document-ID assignments.

| Case | Source cells / destinations |
| --- | --- |
| Guns Of Eschaton | F39 → H2; F40 → Intro; F41 → Results |
| Dave The Diver In The Jungle DLC | F42 → H2; F43 → Intro; F44 → Results |
| Wax Heads | F45 → H2; F46 → Intro; F47 → Results |
| Poppy Playtime: Chapter 5 | F48 → H2; F49 → Intro; F50 → Results |
| Starsand Island | F51 → H2; F52 → Intro; F53 → Results |
| Romeo Is A Dead Man (2026, full launch) | F54 → H2; F55 → Intro; F56 → Results |
| Genigods Nezha | F57 → Intro; F58 → Results |
| The God Slayer | F59 → Intro; F60 → Results |
| Yooka-Replaylee | F61 → Intro; F62 → Results |
| Ratatan | F63 → Intro; F64 → Results |
| Formula Legends | F65 → Intro; F66 → Results |
| Gamescom 2025 | F67 → Intro; F68 → Results |
| Romeo Is A Dead Man (2025, Gamescom activation) | F69 → Intro; F70 → Results |
| Wuchang: Fallen Feathers | F71 → Intro; F72 → Results |
| Dune: Awakening | F73 → Intro; F74 → Results |
| Pipistrello and the Cursed Yoyo | F75 → Intro; F76 → Results |
| Xbox Retro Classics | F77 → Intro; F78 → Results |
| S.T.A.L.K.E.R. Legends Of The Zone Trilogy | F79 → Intro; F80 → Results |
| The Precinct | F81 → Intro; F82 → Results |
| Yasha: Legends Of The Demon Blade | F83 → Intro; F84 → Results |
| Revenge Of The Savage Planet | F85 → Intro; F86 → Results |
| Hordes Of Hunger | F87 → Intro; F88 → Results |
| Infinity Nikki | F89 → Intro; F90 → Results |
| S.T.A.L.K.E.R. 2: Heart of Chornobyl | F91 → Intro; F92 → Results |
| Broken Sword Shadow Of Templars Reforged | F93 → Intro; F94 → Results |
| My Time At Evershine | F95 → Intro; F96 → Results |
| Gamescom 2024 | F97 → Intro; F98 → Results |
| Delta Force | F99 → Intro; F100 → Results |
| Kena Bridge Of Spirits - Xbox | F101 → Intro; F102 → Results |
| Soulmask | F103 → Intro; F104 → Results |
| Capes | F105 → Intro; F106 → Results |
| Pine Hearts | F107 → Intro; F108 → Results |
| TMNT: Wrath Of The Mutants | F109 → Intro; F110 → Results |
| Shadow Of The Depth | F111 → Intro; F112 → Results |
| Powerwash Simulator: Warhammer 40K | F113 → Intro; F114 → Results |
| New Cycle | F115 → Intro; F116 → Results |
| Den Of Wolves | F117 → Intro; F118 → Results |
| Exoborne | F119 → Intro; F120 → Results |
| My Time At Sandrock | F121 → Intro; F122 → Results |
| Gamescom 2023 | F123 → Intro; F124 → Results |
| Broken Sword (2023) | F125 → Intro; F126 → Results |
| Synced | F127 → Intro; F128 → Results |
| Dark Envoy | F129 → Intro; F130 → Results |
| IIDEA 2023 - IVGA & First Playable | F131 → Intro; F132 → Results |
| The Last Worker | F133 → Intro; F134 → Results |
| Luna Abyss | F135 → Intro; F136 → Results |
| Peaky Blinders: The King's Ransom | F137 → Intro; F138 → Results |
| Wo Long: Fallen Dynasty | F139 → Intro; F140 → Results |
| Inkulinati | F141 → Intro; F142 → Results |
| Metal Hellsinger | F143 → Intro; F144 → Results |
| Hubris | F145 → Intro; F146 → Results |
| Arcade Paradise | F147 → Intro; F148 → Results |
| The Ascent | F149 → Intro; F150 → Results |
| The Outer Worlds | F151 → Intro; F152 → Results |
| Autonauts | F153 → Intro; F154 → Results; F155 → Quote |
| Baldur's Gate (Enhanced Edition) | F156 → Intro |
| The Walking Dead | F157 → Intro; F158 → Results |
| Felix the Reaper | F159 → Intro |
| Ancestors: The Humankind Odyssey | F160 → Intro; F161 → Results |
| Kerbal Space Program 2 | F162 → Intro |
| Pacer | F163 → Intro |
| Beyond a Steel Sky | F164 → Intro; F165 → Results |
| Disintegration | F166 → Intro |
| Yooka-Laylee | F167 → Intro; F168 → Results |
| Overcooked | F169 → Intro; F170 → Results |
| Forgotton Anne | F171 → Intro |
