# FLZR Content and Block Plan

Status: content planning only  
Scope: FLZR app and FLZR Sanity content (`channel: flizrWeb`)  
Inputs reviewed:

- `FLZR_Homepage_Agency_Copy.docx`
- `FLZR_Services.docx`
- `1SP_FLZR_2026_Wireframe_v1.pdf`
- Current FLZR page-builder registry, schemas, queries, and rendered components in this repository

## 1. Recommendation

Use the supplied material across three content surfaces rather than forcing everything into one homepage:

1. **Homepage** - concise brand proposition, service overview, European presence, selected cases, proof through clients, careers teaser, team teaser, and 1SP relationship.
2. **Services page** - the eight disciplines, with structured service detail content in the existing service gallery/modal pattern.
3. **Agency page** - company story, scale, philosophy, team, and careers/jobs.

This preserves the wireframe's homepage sequence while giving the longer Agency and Services copy enough room. The homepage should tease those destinations; it should not duplicate the full copy from both documents.

The current implementation uses the unified Sanity `page.content` array and an app-specific `FlzrPageBuilder`. FLZR content should therefore be entered in `page.content`, rendered by the FLZR registry, and scoped with `channel: flizrWeb`. It should not be routed through a legacy `content1sp` field.

## 2. Source-to-destination split

| Source material | Primary destination | Homepage use |
| --- | --- | --- |
| Homepage hero and intro | Homepage | Full, but split into focused hero and following intro block |
| Services intro | Homepage + Services page | Short version on homepage; full positioning on Services |
| Six “What sets us apart” pillars | Agency page | One short teaser/link on homepage at most |
| References and clients | Homepage | Selected cases plus logo proof |
| Locations / European presence | Homepage | Full section |
| Agency hero and about copy | Agency page | One team/agency teaser only |
| FLZR numbers | Agency page | Do not place in first viewport |
| Philosophy | Agency page | Full section |
| Team copy | Agency page | Shortened teaser on homepage |
| Careers copy | Agency page | Short CTA and selected roles/jobs on homepage |
| Eight service chapters | Service documents and Services page | Cards/modal entry points only |

## 3. Homepage content map

### Proposed order

| Order | Wireframe intent | Recommended block | Content assignment | Notes |
| --- | --- | --- | --- | --- |
| 1 | Elevator pitch / video | `oneSPHeader` with `headlineMode: headlineReveal` | Visible H1: `FLZR. Your full-service agency at the point of sale.`; support: `Real presence. Real sales. Everywhere retail happens.` | Use a dominant full-bleed PoS film or image. Keep the first viewport to brand, proposition, one support line, and CTA(s). The typewriter mode remains available for short campaign-style headers. |
| 2 | Intro | `contentSection` | `Twenty years at the point of sale. Thousands of campaigns. One obsession: making your brand impossible to ignore in-store.` plus the shorter FLZR overview paragraph | This holds the long explanation outside the hero budget. |
| 3 | Services introduction | `contentSection` or `galleryOverview` | `Eight services. One partner.` / `Everything your brand needs to win at the point of sale.` | `servicesGalleryFiltered` has no headline fields, so it needs a separate intro block. |
| 4 | Eight services | `servicesGalleryFiltered` | Eight channel- and language-scoped `services` documents | Use the existing FLZR carousel and modal. Hide filters until the People / Technology / Systems taxonomy is approved and populated consistently. |
| 5 | Why FLZR teaser | `contentSection` | Condense the six pillars to one positioning paragraph and link to Agency | Do not add six generic cards to the homepage. The full six-part story belongs on Agency. |
| 6 | European coverage | `globeComponent`, preceded by a short `contentSection` if support copy is required | `Active across Europe.` / `HQ Berlin · Office Wesel · Office Ingolstadt — and field teams in markets across the continent.` | Office pins and service coverage are different claims. Pins should identify offices; the supporting copy can describe field coverage. |
| 7 | Cases introduction | `galleryOverview` or `contentSection` | `Work that speaks for itself.` plus the short sector/proof sentence | Keep this separate because the case gallery has no headline field. |
| 8 | Selected cases | `casesGalleryFiltered` | Curated cases for Intel, Microsoft, Telefónica/o2, OBI, Müller, Bose, or the best available FLZR cases | Use manual selection for launch so the homepage matches the approved brand list and narrative. |
| 9 | Customer proof | `clientLogoCarousel` | Eyebrow: `Selected clients`; headline: `Trusted where retail happens.` | Use manual selection for launch; switch to auto only after client channel assignments and logo quality are audited. |
| 10 | Careers teaser | `intertitleCTA` | `Want in?` plus a shortened version of the careers paragraph; CTA to Agency/jobs | This is the clean current-block fit. The wireframe's role-category cards need a new dedicated block or a revised jobs presentation if they remain a requirement. |
| 11 | Team teaser | `contentSection` + `smartPeople` | `Team FLZR: Better Together.` plus one short sentence; 6-8 selected people | `smartPeople` has no headline, so the heading needs a separate block. Team records must be assigned to `flizrWeb`. |
| 12 | 1SP relationship | New `networkHandoff` block, or a reduced `intertitleCTA` for v1 | `Part of 1SP Agency.` with links to `1SP.com` and contact | The large dark 1SP mini-site in the wireframe does not map honestly to an existing FLZR block. Treat it as a new, scoped component or simplify it. Do not misuse `pageBuilderLogoFloat`, which is a fixed page-top logo wall. |
| 13 | Footer | Global FLZR `FooterNew` / Sanity Footer menu | FLZR logo, service links, Agency, Careers, Contact, legal, social links | This is global menu content, not a page-builder block. Remove generic fallback labels before launch. |

### Homepage copy that should not be carried over verbatim

- Do not place all six USP pillar descriptions on the homepage.
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
| 1 | Go To Markets | Successful market launch | Conquer Europe's retail sector. From idea to shelf. |
| 2 | Business Intelligence | Data-based decisions | Your data. Your edge. Decisions that move sales. |
| 3 | Trainings | Building competence in sales | Know the product. Win the sale. |
| 4 | Promotion | Personnel pool - Europe-wide | Your brand, live. In every store, at every event. |
| 5 | Live Video Consulting | Interactive shopping advice | Personal advice. Digital speed. Carts that don't get abandoned. |
| 6 | PoS Management | Merchandising, rackjobbing and more | The shelf is a decision. We make it the right one. |
| 7 | Sales Force | Retail presence | Your brand in every store. Our people making it happen. |
| 8 | AI Solutions | Predictive analytics and AI | NOVA. 98% precision. Act before your competition reacts. |

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
| 3 | FLZR in numbers | New reusable `stats` block, or a restrained `contentSection` for v1 | 20+ years, 420 team members, 24,000+ field pool, 1000s campaigns. Place below the first viewport. |
| 4 | Philosophy | `contentSection` | Use three H3 sections: Our belief, How we work, What makes us different. One section, one job; no three-card treatment is necessary. |
| 5 | Team introduction | `contentSection` | Use the rewritten `Team FLZR: Better Together.` copy. |
| 6 | Team | `smartPeople` | Channel-scoped people, ideally with editorial ordering rather than “newest first.” |
| 7 | Careers introduction | `intertitleCTA` | `Want in?` plus the short careers proposition. |
| 8 | Live vacancies | `pageBuilderPersonioJobs` | Use when Personio configuration and localized feeds are verified. |

### Agency block gaps

- There is no general-purpose stats block. A small reusable lower-page stats component is preferable to formatting numbers manually in rich text.
- `smartPeople` currently takes a language prop but its query filters only by channel, not by language. That conflicts with the platform rule that global content must be scoped by channel and language. Fix before treating the team section as localized.
- `smartPeople` sorts by creation date. The Agency page needs either manual selection/order or an explicit editorial rank.
- The role-category carousel shown in the wireframe is not the same thing as the current Personio job list or the existing 800px media carousel. Decide whether the intended section is “career paths” or “open jobs”; they need different content and interaction models.

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

### Claims that require source approval before publication

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

Do not turn unverified numbers into metadata, JSON-LD, or prominent proof points.

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

### Phase 1 - Sign-off

- Approve the three-surface information architecture: Homepage, Services, Agency.
- Approve the homepage order.
- Approve the eight service names and People / Technology / Systems grouping.
- Decide between career-path cards, live Personio jobs, or both.
- Decide whether the 1SP handoff is a new branded block or a simple CTA.
- Validate all quantitative and client claims.

### Phase 2 - Content model

- Add the missing structured service fields and query/render support.
- Add or approve a restrained stats block for Agency.
- Add manual ordering and language filtering for the FLZR people section.
- Add a career-category block only if the wireframe carousel remains required.
- Add a dedicated `networkHandoff` block only if the full 1SP treatment remains required.

### Phase 3 - English CMS entry

- Create/update the English homepage, Services, and Agency pages for `flizrWeb`.
- Create/update eight English service documents with channel assignment, media, groups, deliverables, and related cases.
- Curate launch cases and clients manually.
- Create/update the FLZR navbar and footer menus.
- Enter SEO titles/descriptions and image alt text.

### Phase 4 - Localization

- Create German and Polish content from the approved English master.
- Verify menus, pages, services, cases, clients, people, and footer content per locale.
- Verify that no English fallback silently appears in German or Polish pages.

### Phase 5 - Content QA

- Desktop and mobile visual QA for every page and modal.
- Verify hero media/posters and text contrast.
- Verify eight services and their deliverables.
- Verify channel and language filters.
- Verify case/client permissions and ordering.
- Verify Personio feed and application links per locale.
- Verify canonical URLs, sitemap, robots, SEO metadata, and JSON-LD independently for FLZR.
- Rebuild 1SP after shared schema/query changes to prove its runtime remains unchanged.

## 10. Recommended v1 block sequences

### Homepage

```text
oneSPHeader                    # headlineReveal mode
contentSection                 # company intro
galleryOverview/contentSection # services intro
servicesGalleryFiltered
contentSection                 # short Why FLZR teaser
contentSection + globeComponent
galleryOverview/contentSection # cases intro
casesGalleryFiltered
clientLogoCarousel
intertitleCTA                  # careers teaser
contentSection + smartPeople   # team teaser
networkHandoff                 # new, or intertitleCTA for v1
global FooterNew
```

### Services

```text
oneSPHeader                    # headlineReveal mode
contentSection
servicesGalleryFiltered
casesGalleryFiltered           # optional
intertitleCTA
global FooterNew
```

### Agency

```text
oneSPHeader                    # headlineReveal mode
twoColContentSection
stats                          # new, or contentSection for v1
contentSection                 # philosophy
contentSection + smartPeople
intertitleCTA
pageBuilderPersonioJobs
global FooterNew
```

## 11. Definition of content-ready

The content is ready for implementation/CMS population when:

- Homepage, Services, and Agency ownership is approved.
- Every supplied paragraph has one destination and no page contains accidental duplication.
- The eight services have approved names, descriptor, benefit headline, body, five deliverables, media, group, cases, language, and channel.
- Quantitative claims and client permissions have owners and approval evidence.
- The career and 1SP handoff decisions are closed.
- English is approved as the master copy.
- German and Polish scope is confirmed.
- The identified schema/query gaps have implementation tickets or are explicitly deferred with an agreed content fallback.
