# FLZR Content and Block Plan

Status: English working copy published to `wu6i3y0h/dev-dataset` (2026-08-06)

Scope: FLZR app and FLZR Sanity content (`channel: flizrWeb`)

Inputs reviewed:

- `FLZR_Homepage_Agency_Revised (1).docx`
- `FLZR_Services_Revised (1).docx`
- `SONY CASE/Sony FIELD MARKETING.docx`
- `O2 CASE/O2 Studio Brand Ambassador Programme.docx`
- `BOSE CASE/BOSE_Q4 SALES ACTIVATION.docx`
- The accompanying FLZR2 stills and video loops
- Current FLZR page-builder registry, schemas, queries, and rendered components in this repository

## 0. Approved working-copy scope

The English working copy is published without changing the active FLZR homepage.
German and Polish remain a separate localization phase.

| Deliverable | Working slug / document | Publication rule |
| --- | --- | --- |
| Homepage v2 | `/en/home-v2` | `isHomepage: false`, excluded from sitemap |
| Services v2 | `/en/services-v2` | excluded from sitemap |
| Agency v2 | `/en/agency-v2` | excluded from sitemap |
| Services | Eight published EN `services` documents | `channel: ["flizrWeb"]` only |
| Sony | Revised published client and Case | No invented performance metrics |
| o2 | Published client and Case | No invented performance metrics |
| Bose | Published client and Case | No invented performance metrics |

The working copy uses only existing page and case blocks. In particular, it does
not add or change a Case Pagebuilder block, so the shared Case registry for 1SP,
FLZR, and MSM is unaffected.

### Approved working block sequences

```text
Homepage v2
oneSPHeader
contentSection                 # company introduction
contentSection                 # service introduction
servicesGalleryFiltered
headlineChallenge
cardContainerComponent         # six FLZR strengths, existing media
contentSection
globeComponent
contentSection                 # selected work introduction
casesGalleryFiltered           # Sony, o2, Bose in manual order
clientLogoCarousel
intertitleCTA

Services v2
oneSPHeader
contentSection
servicesGalleryFiltered
contentSection                 # integrated delivery model
casesGalleryFiltered           # Sony, o2, Bose in manual order
intertitleCTA

Agency v2
oneSPHeader
twoColContentSection           # About FLZR
resultsMetrics                 # 20+, 420, 24,000+, 1,000s
introBlockTypoSophisticated    # philosophy introduction
twoColContentSection           # Our belief + existing retail film
twoColContentSection           # How we work + existing BI image
twoColContentSection           # What sets us apart + existing people image
galleryPeopleStep              # existing FLZR team/media selection
intertitleCTA                  # careers + external Personio portal
```

### Media allocation

All page heroes and editorial media are drawn from the existing FLZR Cloudinary
library or the supplied FLZR2 package. No new stock imagery is introduced.

| Surface | Primary media | Supporting media |
| --- | --- | --- |
| Homepage | Existing `01_FLZR_WIP_V3` montage | Existing six FLZR strength-card assets, globe and client assets |
| Services | Existing `Go-To-Market` film | One existing/supplied retail-context asset per service |
| Agency | Existing `FLZR_WEB_VIDEO` montage | Existing Agency metrics image and team media |
| Sony | Existing `sony_tvs_with_girl_lhfjxu` | Existing `sony_flzr_vy2fr7`; `sony headphones.mp4` supports the Homepage people strength |
| o2 | Supplied o2 Studio still/loops | Approved for brand use by the content owner on 2026-08-06 |
| Bose | `bose instore.mp4` | The portrait QR still is assigned to Live Video Consulting, not the Q4 case |

| FLZR-only service | Working media assignment |
| --- | --- |
| Go To Markets | Existing `content_studio_amsvgb` |
| Business Intelligence | Existing `Go-To-Market_euzzvn` |
| Trainings | Existing `Twitch_influencer_03_hepfat` |
| Promotion | Existing `Experiential_jzyg8p` |
| Live Video Consulting | Supplied Bose portrait/QR still |
| PoS Management | Existing `retail_hfcwfu` |
| Sales Force | Existing `brand_ambassadors_egrldj` |
| AI Solutions | Existing `AdobeStock_1490246409_dlco3o` |

The content owner approved the Bose QR destination and the selected media on
2026-08-06. Trainings and AI Solutions use the closest approved existing FLZR
context media.

The Agency working copy intentionally omits `pageBuilderPersonioJobs`: the live
feed currently mixes FLZR with other 1SP employers and the existing block cannot
filter by subcompany. The careers CTA links to the shared Personio portal. A
future optional `subcompanyFilter: "FLZR GmbH"` can be added to the existing
block without introducing a new Pagebuilder type.

## 1. Recommendation

Use the supplied material across three content surfaces rather than forcing everything into one homepage:

1. **Homepage** - concise brand proposition, service overview, six FLZR strengths, European presence, selected cases, client proof, and a focused project CTA.
2. **Services page** - the eight disciplines, with structured service detail content in the existing service gallery/modal pattern.
3. **Agency page** - company story, scale, philosophy, team, and careers CTA.

This preserves the wireframe's homepage sequence while giving the longer Agency and Services copy enough room. The homepage should tease those destinations; it should not duplicate the full copy from both documents.

The current implementation uses the unified Sanity `page.content` array and an app-specific `FlzrPageBuilder`. FLZR content should therefore be entered in `page.content`, rendered by the FLZR registry, and scoped with `channel: flizrWeb`. It should not be routed through a legacy `content1sp` field.

## 2. Source-to-destination split

| Source material | Primary destination | Homepage use |
| --- | --- | --- |
| Homepage hero and intro | Homepage | Full, but split into focused hero and following intro block |
| Services intro | Homepage + Services page | Short version on homepage; full positioning on Services |
| Six “Why FLZR” strengths | Homepage | Full six-card section with existing approved media |
| References and clients | Homepage | Selected cases plus logo proof |
| Locations / European presence | Homepage | Full section |
| Agency hero and about copy | Agency page | None; keep the Homepage focused |
| FLZR numbers | Agency page | Do not place in first viewport |
| Philosophy | Agency page | Full section |
| Team copy | Agency page | None |
| Careers copy | Agency page | None |
| Eight service chapters | Service documents and Services page | Cards/modal entry points only |

## 3. Homepage content map

### Proposed order

| Order | Wireframe intent | Recommended block | Content assignment | Notes |
| --- | --- | --- | --- | --- |
| 1 | Elevator pitch / video | `oneSPHeader` with `headlineMode: headlineReveal` | Visible H1: `FLZR. Your full-service agency at the point of sale.`; support: `Real presence. Real sales. Everywhere retail happens.` | Use a dominant full-bleed PoS film or image. Keep the first viewport to brand, proposition, one support line, and CTA(s). The typewriter mode remains available for short campaign-style headers. |
| 2 | Intro | `contentSection` | `Twenty years at the point of sale. Thousands of campaigns. One obsession: making your brand impossible to ignore in-store.` plus the shorter FLZR overview paragraph | This holds the long explanation outside the hero budget. |
| 3 | Services introduction | `contentSection` or `galleryOverview` | `Eight services. One partner.` / `Everything your brand needs to win at the point of sale.` | `servicesGalleryFiltered` has no headline fields, so it needs a separate intro block. |
| 4 | Eight services | `servicesGalleryFiltered` | Eight channel- and language-scoped `services` documents | Use the existing FLZR carousel and modal. Hide filters until the People / Technology / Systems taxonomy is approved and populated consistently. |
| 5 | Why FLZR | `headlineChallenge` + `cardContainerComponent` | People at the Centre, AI-Powered Talent, Live Performance Data, True End-to-End, Europe Without Borders, Ahead of the Curve | Reuse and recopy the six existing media cards. This is Homepage-specific proof; the Agency page carries the separate three-part philosophy. |
| 6 | European coverage | `globeComponent`, preceded by a short `contentSection` if support copy is required | `Active across Europe.` / `HQ Berlin · Office Wesel · Office Ingolstadt — and field teams in markets across the continent.` | Office pins and service coverage are different claims. Pins should identify offices; the supporting copy can describe field coverage. |
| 7 | Cases introduction | `galleryOverview` or `contentSection` | `Work that speaks for itself.` plus the short sector/proof sentence | Keep this separate because the case gallery has no headline field. |
| 8 | Selected cases | `casesGalleryFiltered` | Curated cases for Intel, Microsoft, Telefónica/o2, OBI, Müller, Bose, or the best available FLZR cases | Use manual selection for launch so the homepage matches the approved brand list and narrative. |
| 9 | Customer proof | `clientLogoCarousel` | Eyebrow: `Selected clients`; headline: `Trusted where retail happens.` | Use manual selection for launch; switch to auto only after client channel assignments and logo quality are audited. |
| 10 | Campaign/contact close | `intertitleCTA` | A focused project CTA to the existing FLZR contact page | Careers, team and the full company story belong to Agency v2. |
| 11 | Footer | Global FLZR `FooterNew` / Sanity Footer menu | FLZR logo, service links, Agency, Careers, Contact, legal, social links | This is global menu content, not a page-builder block. Remove generic fallback labels before launch. |

### Homepage copy that should not be carried over verbatim

- Do not place the four Agency statistics in the hero or first viewport.
- Do not place the full team paragraph and full careers paragraph on the homepage.
- Do not repeat all service deliverables below the service carousel.

## 4. Services page content map

| Order | Recommended block/data | Content |
| --- | --- | --- |
| 1 | `oneSPHeader` with `headlineMode: headlineReveal` | Visible H1 with brand signal `FLZR`; page proposition `Real presence. Real results. At the point of sale.`; support `Eight disciplines. One partner. Europe-wide.` |
| 2 | `contentSection` | Short explanation of the full-service model and the People / Technology / Systems framework |
| 3 | `servicesGalleryFiltered` | The eight structured service documents |
| 4 | `casesGalleryFiltered` (optional) | Selected cases that demonstrate multiple FLZR services |
| 5 | `intertitleCTA` | Project/contact CTA |

### Eight-service inventory

| Order | Service name | Descriptor (`taglabel`) | Benefit headline (`introText`) |
| --- | --- | --- | --- |
| 1 | Go To Markets | Successful Market Entry · Retail Expansion | Your product in Europe's stores. From strategy to shelf. |
| 2 | Business Intelligence | Data Analytics · Retail Performance | Real-time retail data. Decisions that move the needle. |
| 3 | Trainings | Retail Sales Training · Brand Education | Product knowledge that closes. Sales confidence that sticks. |
| 4 | Promotion | Field Marketing · Brand Activation | Your brand, live. Every store. Every event. Every moment that matters. |
| 5 | Live Video Consulting | Online Retail Advice · Live Commerce | Personal advice. Digital speed. The sale that would have been missed. |
| 6 | PoS Management | Visual Merchandising · Retail Execution | The shelf is a sales tool. We make sure it works. |
| 7 | Sales Force | Retail Sales Force · Field Teams | Your brand in every store. The right team making it happen. |
| 8 | AI Solutions | Predictive Analytics · Retail AI | NOVA. 98% accuracy. Act before your competition even notices the trend. |

### Service document field map

The source has six distinct layers per service:

1. Descriptor
2. Service name
3. Benefit headline
4. Two body paragraphs
5. Five “What we deliver” items, each with a label and explanation
6. Media, service grouping, related cases, and channel/language metadata

Map them as follows:

| Source layer | Sanity field | Current status |
| --- | --- | --- |
| Descriptor | `taglabel` | Fits and is rendered on cards/modal |
| Service name | `name` | Fits and is rendered |
| Benefit headline | `introText` | Field exists, but the channel query and current gallery/modal do not render it |
| Two body paragraphs | `serviceDescription` | Fits only as plain text; paragraph structure is weak |
| “What we deliver” list | New `deliverables[]` with `title` and `description` | Missing; required to preserve the supplied content |
| Card/modal media | `serviceBackground`, `serviceicon` | Fits |
| Website scope | `channel: ["flizrWeb"]` | Fits |
| Language | `language` | Fits per localized service document |
| People / Technology / Systems | `servicegrouprel` | Fits after the taxonomy is approved |
| Proof/case links | `caseStudies` | Fits, but the modal does not currently surface them |

### Required content-model work before service copy entry

Recommended minimum:

- Include `introText` in `SERVICES_BY_CHANNEL_QUERY` and in the FLZR service type used by the gallery.
- Render `introText` as the modal's benefit headline.
- Add a structured `deliverables` array to the `services` document.
- Render the deliverables as a scannable list inside the service modal, or create service detail pages if the modal becomes too dense.
- Preserve `serviceDescription` as body copy; do not paste the deliverables into one unformatted text field.
- Keep services global and reusable, filtered by `channel` and `language`; do not duplicate the same service just for FLZR presentation.

### Proposed service grouping

This is a draft editorial taxonomy and needs business-owner approval before CMS entry. Services may belong to more than one group.

| Group | Primary services | Possible cross-over |
| --- | --- | --- |
| People | Trainings, Promotion, Sales Force | Live Video Consulting |
| Technology | Business Intelligence, AI Solutions | Live Video Consulting |
| Systems | Go To Markets, PoS Management | Business Intelligence, Sales Force |

## 5. Agency page content map

| Order | Content | Recommended block | Notes |
| --- | --- | --- | --- |
| 1 | Agency hero | `oneSPHeader` with `headlineMode: headlineReveal` | Keep FLZR in the visible H1 as the brand-level signal. Use `420 people. One mission.` as the proposition, not as a larger competing brand. |
| 2 | Company story | `twoColContentSection` | Use the rewritten two-paragraph story with real team/PoS media. |
| 3 | FLZR in numbers | `resultsMetrics` | 20+ years, 420 team members, 24,000+ field pool, 1000s campaigns. Reuse the existing Agency metrics image and place below the first viewport. |
| 4 | Philosophy introduction | `introBlockTypoSophisticated` | Introduce the three-part working philosophy. |
| 5 | Our belief | `twoColContentSection` | Full approved paragraph with an existing retail film. |
| 6 | How we work | `twoColContentSection` | Full approved paragraph with an existing BI/data image. |
| 7 | What sets us apart | `twoColContentSection` | Full approved paragraph with an existing people/network image. |
| 8 | Team | `galleryPeopleStep` | Use only the seven verified English people assigned to `flizrWeb`; keep their existing video portraits. |
| 9 | Careers | `intertitleCTA` | Full careers proposition and external link to the Personio portal. |

### Agency block constraints

- `galleryPeopleStep` is manually ordered. The working copy uses seven verified English `flizrWeb` people references rather than copying the current mixed selection.
- The live Personio feed currently contains FLZR and other 1SP employers. Since `pageBuilderPersonioJobs` cannot filter by subcompany, the working copy uses the careers CTA only.
- The role-category carousel shown in the wireframe is not the same thing as the current Personio job list. It remains out of scope for this draft.

## 6. Wireframe reconciliation

The wireframe and copy agree on the main story but not on information depth.

### Keep from the wireframe

- Single-composition, video-led FLZR hero
- Eight-service carousel
- European presence as a major visual section
- Cases followed by client proof
- Careers and people as separate sections
- Clear relationship to 1SP near the end

### Change from the wireframe

- Add a real intro block after the hero instead of squeezing the long company introduction into the first viewport.
- Make the services intro explicit because the current service block has no title fields.
- Use curated cases and clients at launch rather than uncontrolled auto lists.
- Treat the 1SP dark section as a separate scoped component or simplify it; it is not the footer and not an existing page-builder block.
- Move the full company history, statistics, philosophy, team narrative, and jobs to the Agency page.
- Correct wireframe labels: `Mershandising` -> `Merchandising`, `Omni Channel Managament` -> `Omnichannel Management`, `Customer Logo's` -> `Customer Logos`.

## 7. Editorial system

### Naming and style decisions

Approve one form and apply it consistently:

- `FLZR` in capitals
- `PoS` or `point of sale` - avoid mixing with `POS`
- `PoSLive` vs `PosLive`
- `Omnichannel` vs `Omni Channel`
- `Go To Markets` vs a more natural service label such as `Go-to-Market`
- `rackjobbing` capitalization and spelling
- English punctuation and dash style
- `Europe-wide` vs `European`

### Claims approved for publication

- “20+ years” / founding in 2004 (in 2026 the precise duration is 22 years)
- 420 team members
- 370 people in the field
- 24,000+ personnel pool
- “1000s” campaigns delivered
- NOVA prediction accuracy of 98%
- Live events for up to 1,000 participants
- 30+ live consultants across Germany, Austria, and Spain
- Any claim of coverage across every major European market
- Client names and permission to display their logos/cases

The content owner approved these claims on 2026-08-06. Future claim changes still
require a source check before they are added to metadata or structured data.

## 8. Localization plan

The supplied copy is English. The FLZR site configuration currently declares English, German, and Polish, and the wireframe also shows EN/DE/PL.

Content production therefore needs:

1. English master copy approved first.
2. German transcreation, not literal translation.
3. Polish transcreation or an explicit decision to postpone Polish routing.
4. Localized page, menu, service, case, client, people, SEO title, SEO description, CTA, Personio, and footer content.
5. Cross-locale QA for text length in hero, service cards/modal, navigation, and CTA labels.

Known implementation mismatch: the shared site configuration includes `pl` for FLZR, while the current Sanity menu schema declares only English and German. Resolve that before Polish is considered launch-ready.

## 9. Content production sequence

### Phase 1 - Safe English working copy

- Back up `wu6i3y0h/dev-dataset` before the first content mutation.
- Add structured `deliverables[]` and `sortOrder` support to the global Service type, shared queries, and the FLZR service modal.
- Upload only the supplied media not already present in Cloudinary.
- Create the three page working copies, eight FLZR-only Services, and Sony/o2/Bose Case drafts.
- Keep the current published pages, current shared Services, and `isHomepage` assignment unchanged.
- Validate the working slugs in Draft Mode on desktop and mobile.

### Phase 2 - Editorial and rights sign-off

- Approved by the content owner on 2026-08-06: the quantitative claims listed above.
- Approved by the content owner on 2026-08-06: Sony, o2/Telefónica and Bose case/public media rights.
- Approved by the content owner on 2026-08-06: the QR destination and the usage rights for Gemini/Hailuo-labelled o2 material.
- Approved by the content owner on 2026-08-06: the selected media for Go To Markets, Trainings and AI Solutions.
- Decide whether the future Agency page needs an inline FLZR-filtered Personio list in addition to the portal CTA.

### Phase 3 - Localization

- Create German and Polish content from the approved English master.
- Verify menus, pages, services, cases, clients, people, and footer content per locale.
- Verify that no English fallback silently appears in German or Polish pages.

### Phase 4 - Publish/cutover

- Export and verify a fresh `dev-dataset` backup immediately before publication.
- Publish the complete 25-document batch in one Sanity transaction: eight replacement Services, eight superseded-Service overlays, three Cases, three Clients and the three v2 Pages.
- Strengthen the 20 draft-only references inside the same transaction and delete the 25 matching Draft IDs only after their published replacements are part of that transaction.
- Keep `/en/home-v2`, `/en/services-v2` and `/en/agency-v2` as published working copies with `isHomepage: false` and sitemap exclusion. Promoting them to stable URLs remains a separate, explicit cutover.
- Update navigation only in the explicit cutover transaction.
- Rebuild and verify FLZR and 1SP before deployment.

The guarded implementation is `scripts/flzr-content-publish.mjs`, invoked through the authenticated Sanity CLI wrapper. It refuses any project/dataset other than `wu6i3y0h/dev-dataset`, requires an existing valid gzip backup for `--apply`, checks the exact 25 Draft IDs and 20 weak references, performs an API dry-run, and verifies the final published state after the commit.

### Phase 5 - Release QA

- Desktop and mobile visual QA for every page and modal.
- Verify hero media/posters and text contrast.
- Verify eight services and their deliverables.
- Verify channel and language filters.
- Verify case/client permissions and ordering.
- Verify the Personio portal link per locale.
- Verify canonical URLs, sitemap, robots, SEO metadata, and JSON-LD independently for FLZR.
- Rebuild 1SP after shared schema/query changes to prove its runtime remains unchanged.

## 10. Completed pre-publish gate

The working copy is ready for editorial review when:

- Only the intended Drafts and deterministic Cloudinary uploads were created before publication.
- Homepage v2, Services v2 and Agency v2 resolve on their working slugs and remain excluded from the sitemap.
- The Service query returned exactly the eight new FLZR-only Services in editorial order under Draft Mode.
- Every Service modal shows descriptor, benefit headline, two body paragraphs and its structured deliverables.
- Homepage v2 selects Sony, o2 and Bose manually and every Case route renders with the existing Case block registry.
- Agency v2 renders the full About, Philosophy, Team and Careers copy with only verified English `flizrWeb` people references.
- FLZR desktop/mobile and the existing 1SP build pass after the shared schema/query change.
- Claims and media rights were signed off by the content owner on 2026-08-06.

## 11. Publish record

- Target: `wu6i3y0h/dev-dataset`
- Backup: `EXPORT/dev-dataset-before-flzr-publish-20260806-104809-IDT.tar.gz`
- Sanity transaction: `93CCjksceNIuW2zCQzxlN3`
- Result: 25 documents published and 25 matching Draft IDs removed atomically
- Reference result: 20 Draft-only references strengthened; zero weak references or `_strengthenOnPublish` markers remain
- Active FLZR EN Homepage preserved: `page-flizr-home-en`
- Published working copies remain outside the sitemap and are not marked as Homepage
