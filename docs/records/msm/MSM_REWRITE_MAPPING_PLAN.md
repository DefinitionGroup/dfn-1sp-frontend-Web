> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# MSM rewrite mapping plan

Planning snapshot: 18 September 2026. Source: `MSM_Website_Rewrite_Comparison_v1.xlsx`, sheets `Rewrite` and `Summary`. Target: Sanity project `wu6i3y0h`, dataset `production`, channel `msmWeb`, English and German. `dev-dataset` is excluded. This is a plan; no CMS content or application code has been changed.

## Recommendation

Treat the workbook as the editorial authority and the existing app as the presentation system. Preserve the rewritten wording, split it into its intended roles, and compose those roles using existing MSM blocks. Adapt a block where its current fields or rendering would lose meaning. Do not shorten the rewrite simply to fit a rotating headline, collapse different services into the current four service records, or recreate the old site's layout automatically.

Keep global Cases, Services and People as shared entities. Put MSM-specific editorial variants behind an explicit channel boundary. Keep MSM Units in the existing `msmUnit` model, including its Unit-owned relationships.

## Verified scope

The workbook contains 1,977 content rows covering 202 distinct page URLs: 102 EN and 100 DE. These are legacy-site source URLs, not 202 verified routes in this app.

| Source family | EN | DE | Current published MSM content in production |
| --- | ---: | ---: | --- |
| Core: home, unit directory, unit details, contact, legal | 9 | 9 | Home/contact EN+DE, unit directory EN, four EN unit records; no legal page documents in the inspected MSM page set |
| Services, including directory | 18 | 17 | Directory EN+DE; four broad EN shared service records; no service-detail route |
| People profiles | 11 | 11 | Ten EN shared people assigned to MSM; no person-detail route |
| Case details | 64 | 63 | Five EN shared cases assigned to MSM; case-detail route exists |

There are nine published MSM `page` documents: five EN and four DE. Those documents contain 23 block instances. The four unit documents are separate from this count. All four currently have empty leadership and case assignments. The ten people, four services and five cases assigned to MSM are also assigned to 1SP; one case has a third channel.

English and German source content differ. EN includes the Mixed Reality in Manufacturing service page without a DE equivalent. Do not invent missing translations or force identical homepage sections across languages. The workbook excludes the founders-blog and press-release articles; their promotional homepage sections are still in scope.

Evidence: published Sanity API reads, `doctor:sanity`, source schema, queries, route files and the current working-tree renderers. The working tree already contains ongoing MSM changes. This is not a deployed-browser audit and does not claim those changes are deployed.

## Editorial precedence and reconciliation

1. Actual public-facing copy in column I replaces conflicting CMS wording. Column H supplies the old text only where I explicitly means to preserve it. Columns J/K are rationale and issues, never public copy.
2. Some column-I cells are also editorial instructions. Examples: row 966 recommends a layout change; rows 573/589 describe missing quotations; rows 838/887/920 describe absent results. Classify these as instructions or unresolved content, not strings to import.
3. An “unchanged” marker means retain the referenced original content, not whichever different content happens to be in the new CMS. Resolve actual people/case references and recover complete source content where necessary. Rows 43/56 abbreviate 28/34-project lists; the workbook alone does not provide their full membership.
4. Preserve paragraph boundaries, list grouping, proper names, quotation attribution and quantitative qualifiers. One Excel row does not necessarily equal one page-builder block. Several paragraph rows normally become one Portable Text array; a row combining heading and subline becomes two fields.
5. Unrepresented existing content receives an explicit retain, move, replace or retire disposition. Being absent from this rewrite does not prove a current case/person is obsolete. Keep those records and decide their presentation separately.
6. Keep known media and factual relationships where compatible. Do not infer a campaign match from client name alone. A Microsoft partnership overview is not automatically the Microsoft escape-room case.
7. Source notes that question a fact become tracked editorial issues. They do not silently authorize changes to claims or legal text. Preserve the rewrite for review and isolate the affected field until its issue is resolved.

## Page compositions

### Homepage

Recommended EN sequence:

1. `oneSPHeader`: rows 4–7; one full visible H1, support paragraph and CTA to `/units`. Metadata comes from rows 2–3. Keep MSM.digital a strong hero-level signal and the existing dominant media.
2. `msmUnitsGrid` embedded: row 16's four distinct outcomes, linking to existing unit routes.
3. `casesIntro` + manually selected `smartCarousel`: rows 14–15 introduce evidence; row 18 supplies the intended examples once their actual case records/media are available.
4. Two `twoColContentSection` product sections: hashtaglove, rows 8–10; #godigitalnow, rows 11–13. Use the exact headings and support text, with an inline link inside rich text. Link hashtaglove to its planned detail page. Resolve #godigitalnow's actual destination before making its CTA active.
5. `galleryPeopleStep`: row 17's staff quotations and identities, kept distinct from case evidence. A missing person/quote mapping is an explicit dependency.
6. `twoColContentSection`: Founders Keepers, rows 19–22. Preserve the series name, 7+1 label and interview CTA; recover the real destination/media. This does not require migrating the excluded article archive.

This deliberately changes legacy section order to explain the four units before presenting proof, while retaining all supplied public content. The workbook's order remains the default within each narrative section. Record this reordering in the mapping.

DE follows its own rows 954–971: hero, unit navigation where useful, case proof, hashtaglove and interview promotion. Do not add the EN #godigitalnow section to DE without source copy. Row 960's 1SP membership line can use the MSM shell's membership presentation, subject to verifying its actual settings field. Row 966 is a layout suggestion; keep proof below the focused hero rather than crowding the first viewport.

**Required adaptation:** MSM `oneSPHeader` currently renders a hidden H1 and rotating words; its existing editorial `headlineMode/headline` schema controls are FLZR-only and MSM does not consume them. Enable an explicit MSM editorial headline mode and render the supplied headline visibly as H1. Map support to `paragraphs`; clear or update `mobileParagraphs` to prevent old mobile-only copy. Do not store the full H1 only in `seoTitle` or split it into unrelated rotating slogans.

### Units directory and unit detail

Use the existing directory block: `msmUnitsGrid.headline` = row 26; `.intro` = row 27; `.eyebrow` = row 25. Set `embedded=false` on the directory and true on homepages. Create the missing German directory and four German unit records using their own source rows.

The homepage teaser, directory teaser and unit hero are different copy roles. Add optional per-unit teaser/link-label overrides to the grid, preserving existing `selectedUnits` references. Do not overwrite `msmUnit.claim` three times. The grid currently ignores its `eyebrow` prop; render the authored value.

Unit detail remains structured:

| Rewrite role | Destination |
| --- | --- |
| Unit name | `msmUnit.name` |
| Unit hero problem statement / DE subline | `msmUnit.claim` |
| Remaining explanatory paragraphs | `msmUnit.body[]`, ordered Portable Text |
| Capabilities explicitly supported by source | `msmUnit.capabilities[]`; reconcile existing extra capabilities separately |
| Faces / selected-project headings | NEW optional `leadershipHeading`, `casesHeading` |
| Named people / projects | Existing `leadership[]` / `caseStudies[]` references |
| CADLaif and India sections | NEW optional `additionalContent[]`, initially restricted to `contentSection` and `twoColContentSection` |
| CTA sentence and destination | NEW optional `contactCta` fields; preserve sentence, avoid inventing a booking journey |
| Metadata | Existing `metadata.title` / `.description` |

Also make the introduction heading optional/editable instead of forcing “Our approach.” Recommended detail order: hero → introduction → capabilities where supported → people → CADLaif/India where present → selected cases → contact. Omit empty sections. Current renderer order differs and its section/CTA copy is hardcoded.

The rewrite calls the current **XR Labs** unit **AR / VR Labs**. Use the rewritten display name, retain `/units/xr-labs` as the existing app route, and map old `/business-units/ar-vr-labs/` to it. Do not preserve additional MR/AI-glasses copy merely because it exists in CMS; retain only material compatible with the source scope or identify it as a separate editorial decision.

Proposed leadership references from source: Communications → Kirsten, Nikolas, Nils, Timo; Channel Marketing → Lennart, Sven, Tobias, Maic; AR / VR Labs → Camillo; Technology Systems → Lennart. Resolve missing people and current identities before setting references. These are planned assignments, not completed writes.

### Services directory and details

Keep `/services` as the directory. Use a hero, concise introduction and a linked catalogue of the workbook's actual services/products. The four current broad `services` records do not represent the 17 EN service-detail pages one-to-one.

Create MSM-owned `page` documents for the service landing pages, using their existing `content[]` field and a new optional service page kind/reference. Add `/services/[slug]` routing and resolve that scope explicitly. Reuse shared service entities only when their identity genuinely matches. Do not create duplicate global services simply to obtain MSM-specific prose or turn HashtagLove and generic Influencer Marketing into one page.

Default detail composition:

`servicesHeroWithBadge` → `contentSection` → selected `casesGalleryFiltered` → `intertitleCTA`.

- `title`/`subtitle`: split combined H1/subline rows; `titleTag=h1`.
- `contentSection.content[]`: consecutive problem, approach and value paragraphs, preserving their wording and order. Group by meaning, not by Excel row.
- `casesGalleryFiltered.selectedCases[]`: references for explicitly named projects after matching; use manual selection and avoid substituting unrelated auto-selected cases.
- `intertitleCTA`: preserve the sentence as heading/support; use an actual source button label where present. If the source supplies only a sentence, put a contact link on its action phrase or flag a concise derived label as proposed copy rather than approved source text.
- Unit tag: link to its source-assigned unit. Do not “correct” the Manufacturing page's Channel Marketing tag to XR solely because its subject is MR.

Special cases: HashtagLove's four service stages fit one `galleryListStep` or `contentSection` list, with separate contact and document links. Manufacturing needs sourced statistics/footnote and a real report-download flow. `resultsMetrics` exists in the shared page schema but is absent from MSM's general page renderer; add its MSM rendering before using it there, or keep the exact statistics in readable rich text. A lead-generation CTA is not implemented by pointing to `/contact`: add the actual gated report form/asset or keep that CTA inactive pending those inputs.

### Cases

Keep `/cases/[slug]` and the existing case entities. Reconcile all 127 source URLs by campaign, client, language, media and source URL. Broad current umbrella cases and individual legacy projects can coexist. No bulk match by client name; no bulk replacement of the five current cases.

| Rewrite role | Existing or proposed destination |
| --- | --- |
| Headline / subline | Effective MSM `title` / `subtitle` |
| Challenge | `challengeAndSolution.description` as prose, not a fabricated bullet list |
| Solution | `challengeAndSolution.solution[]` Portable Text |
| Additional approach narrative | `approachSection.description` / `.approachDetails[]`, only when source supplies a distinct section |
| Results prose | `resultsMetrics.description` |
| Real quantitative result | `resultsMetrics.metrics[]`; preserve units, qualifiers and time/context |
| Quote and named attribution | NEW `caseQuote` block in the MSM case contract |
| Closing CTA | Reuse `intertitleCTA` with case-schema/renderer support, or an equivalent scoped CTA object |
| Separate SEO copy | NEW effective MSM metadata fields and query/render support |

Cases currently reuse visible `title/description` for SEO. For example, rows 407–410 intentionally distinguish “EA Need for Speed Influencer Campaign | MSM.digital” from “Reaching young car enthusiasts”; collapsing them loses approved copy. Separate metadata is necessary.

The case builder currently accepts only `headlineChallenge`, `challengeAndSolution`, `approachSection`, `resultsMetrics`. It has no attributed quote or independent closing CTA block. Its challenge block gates the mini-CTA behind a nonempty challenge/service list, so it is not a dependable universal CTA destination. Do not invent list items to make the CTA appear.

For cases shared with other sites, add a backward-compatible `websiteContent[]` editorial variant keyed uniquely by channel. Proposed MSM variant fields: `channel`, `title`, `subtitle`, `description`, `metadata`, `casesPageBuilder`. The shared case keeps identity, slug, assets, client and global relationships. Resolve the variant in MSM queries for details, listings, related cards and structured data. Distinguish absent override (inherit) from intentional empty value (clear); do not use truthiness fallback that resurrects old copy. Other sites retain their existing projections.

New genuine case entities may be created when no matching entity exists, with MSM channel assignment and linked translations. Do not duplicate an existing global case to isolate copy.

### People

Create `/people/[slug]` with an MSM-specific profile presentation of shared Person references. Reuse nine matching EN people; Nathalia Traxel and Tobias Schnoor are not present in the inspected MSM assignment set and require identity resolution. Camillo exists in CMS and is needed for unit leadership even though he has no dedicated profile in this rewrite.

Name, position, portrait and contact identity stay shared. Add an MSM editorial variant for metadata, quote, “I do,” “Ask me,” biography and selected-case references. Prefer a fixed profile template with rich text and case galleries, using existing typography/media components. Do not squeeze all these roles into `person.tagline` or one undifferentiated biography.

Use page-owned route slugs/aliases to handle workbook names such as `kirsten-huecker` versus current `kirsten-hcker`, and Maic's current unslugified value. Do not rename shared slugs without checking other channels. Source contact numbers are not automatically fresh; distinguish approved identity/contact data from editorial rewrite text.

### Contact and legal

Contact rows 85–86 fit `page.contactForm.headline/subheadline`; this prevents a duplicate intro above the existing form. The form currently renders its headline as H2: allow an H1 when it owns the contact-page introduction. Map phone/email/Messenger/WhatsApp and social headings into `contentSection` with real labeled links or a small structured MSM contact block if reusable fields are needed. Check that claimed contact channels are actually present and functional.

Legal pages fit ordinary MSM `page` documents with a heading and `contentSection` rich text. “Unchanged” markers must resolve to the complete original/approved legal body. The workbook's legal notes are unverified review requests, not legal advice or publishable replacements. Do not publish abbreviated extracts as a complete privacy policy.

## Existing block reconciliation

The companion workbook lists all 23 current instances by document, field path and `_key`, including DE placeholders. Main EN dispositions:

- Home `oneSPHeader`: reuse and adapt. `galleryHeroStep`: merge its introductory role into the rewritten hero/unit framing, retiring superseded copy. `smartCarousel`: retain, select intended evidence. Existing `intertitleCTA`: move/rewrite as evidence introduction only if needed. `galleryScrollHighlightStep`: replace its superseded statement with the source-backed product/editorial sequence; no duplicate brand manifesto. `msmUnitsGrid`: retain with contextual teasers. `galleryPeopleStep`: retain and reconcile identities/quotes.
- Cases hub: retain hero, `casesIntro` and filtered gallery. No dedicated rewritten Cases hub exists in the workbook, so retain compatible hub copy and mark any proposed edits as new editorial copy. `introBlockTypoSophisticated` and top-level `block` currently fall through MSM's renderer: inspect their text, merge unique needed content into supported blocks or retire it in the planned replacement. Do not leave invisible copy stranded.
- Services hub: merge `headlineChallenge`, hero and `intertitleCTA` into one rewritten introduction; replace the four-record carousel with a linked catalogue matching the actual source detail pages. A small MSM service-directory block referencing pages is preferable if existing gallery contracts cannot represent those pages.
- Units EN: retain and rewrite grid. Contact EN/DE: replace placeholder copy via the existing contact form/content fields. Home/services/cases DE: replace placeholder compositions; Cases DE remains a hub without workbook-specific copy.

## Delivery order and acceptance

1. **Normalize source and identity map.** Classify all 1,977 rows; establish legacy URL → destination → document/reference matches. Resolve “unchanged” source recovery and editorial notes. Preserve a source row number for each destination field. Exact slugs and references are a second pass for unmatched cases, not guessed in the plan.
2. **Implement required contracts in isolation.** Homepage visible headline; unit overrides/headings/additional content; service and person routes; scoped shared editorial variants; case quote/CTA/metadata; source-specific report flow. Add only fields needed by these mappings. Reuse existing block renderers where they fit.
3. **Complete one EN and one DE example per template.** Use real source rows, full-length copy and actual media. Check heading hierarchy, long CTA wrapping, mobile copy and empty relationships before populating the whole set.
4. **Prepare production content changes.** Read current revisions and drafts, back up only affected documents, produce a field-level dry-run diff. Stage draft content in `production` for testing; do not move testing to another dataset. Use draft-aware MSM preview. Publishing and domain release remain separate from this planning request.
5. **Populate dependencies before linking them.** People/case identities and media → unit references and detail pages → services and related proof → directories/home/contact → legal content when complete. Run EN first as a template check, then DE from its own copy, without treating DE as an automatic translation.
6. **Verify and release the approved scope.** `pnpm --filter @1sp/msm-web build`; root `pnpm build` when shared schemas/types/queries change. Verify affected other-site projections and builds as applicable. Check source-to-rendered-text coverage, actual links, metadata, canonical/language paths, sitemap, robots and desktop/mobile pages. Do not change the existing indexing/domain boundary as a side effect of copy work.

Acceptance: every source row is mapped, explicitly preserved, or tracked with a concrete missing dependency; every current block has a disposition; no editorial marker appears in rendered text; no approved wording disappears on mobile; no empty heading or fake result is manufactured; source-attributed staff quotes are not relabeled customer testimonials; shared 1SP content remains unchanged by MSM overrides; all enabled links have verified targets.

## Remaining source dependencies

- Complete lists hidden behind abbreviated “unchanged” rows, plus exact case/people identities and media.
- Destinations/assets for #godigitalnow, interviews, the HashtagLove paper and the manufacturing report/form.
- Missing quote text, ambiguous case names and unresolved biographical notes identified in the workbook.
- Complete legal bodies and resolution of the workbook's legal-content review notes.

These dependencies affect individual sections or pages. They do not prevent mapping or implementing the supported templates. No permission question is needed to finish this plan.
