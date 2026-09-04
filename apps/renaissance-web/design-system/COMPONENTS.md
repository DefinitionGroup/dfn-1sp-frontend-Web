# Renaissance Component and Pagebuilder Contract

## Support tiers

- **Core:** approved for normal Renaissance pages and expected to have complete responsive, accessibility and content states.
- **Conditional:** registered and reusable only after page-specific visual QA; not a default editor choice.
- **Compatibility:** present for shared-platform or migration reasons; do not expose in Renaissance authoring without an explicit cross-site requirement.

Registration in `RenaissancePageBuilder.tsx` means the renderer understands a block type. It does **not** mean the block is visually approved for Renaissance.

## Core components

| Block type | User job | Required content | Layout contract | Critical states |
| --- | --- | --- | --- | --- |
| `heroShowTime` | Orient and convert | wordmark/brand context, one headline, short support, 1 primary + optional secondary CTA, real media, alt text | full-bleed dominant media; no cards, chips, stats or promos; one hero per page | image/video fallback, reduced motion, short landscape, contrast-safe nav |
| `introBlockTypoSophisticated` | Frame the next section | one main statement, up to two short supporting phrases, one paragraph | Sanity-selectable editorial split or compact stack; no CTA or card cluster | semantic heading level, long-copy wrap, muted-token contrast |
| `carousel` | Present selected campaign stories | 1–5 stories, title, image/video, short description, optional verified CTA | immersive single-stage media, never a tiled card row | pause/play, previous/next, active state, swipe, keyboard, reduced motion, optimized media |
| `clientLogoCarousel` | Add client trust | verified logos and names | quiet monochrome rail between proof and offer; decorative duplicates hidden | static reduced-motion state, supported formats, missing-logo omission |
| `cardContainerComponent` | Scan a concise service set | 2–6 items, short title, max 140-character description | desktop grid; compact ruled list on mobile; no shadow | long title, 2/3/5/6 counts, empty item omission, contrast |
| `twoColContentSection` | Pair a human/place/media anchor with narrative | meaningful media and alt text, 1–4 text blocks | 6/6 desktop split, stacked mobile; media not smaller than supporting copy | missing media, reverse layout, reduced parallax, optimized image/video |
| `globeComponent` | Explain location coverage | one title, one short description, 1–6 verified locations | immersive desktop map; capped mobile map followed by scannable text list | canvas failure, reduced data/motion, keyboard-independent labels, small viewport |
| `intertitleCTA` | Close a section or page with one action | one headline, optional subline, one short paragraph, one valid CTA | open editorial field with hairline; no surrounding card | missing/invalid link renders no CTA, internal/external/email intent, heading level |
| `contentSection` | Render general editorial content | structured portable text | single-purpose section; readable measure ≤68ch | all heading levels, lists, quotes, links, empty content |
| `tabbedContentSection` | Compare related views where switching matters | 2–5 labelled panels | tabs only when the user benefits from choosing a view | keyboard roving, selected state, no-JS/readable fallback |

## Conditional components

| Block type | Allowed use | Gate before use |
| --- | --- | --- |
| `showtimeGallery` | complex story or service narrative | confirm it does not compete with the page hero; mobile and motion QA |
| `galleryHeroStep`, `galleryCardsStep`, `galleryListStep`, `galleryPeopleStep`, `galleryScrollHighlightStep`, `galleryRevealStep`, `galleryOverview` | coordinated steps inside a defined gallery narrative | use as a family, not as isolated visual novelties; verify heading and navigation semantics |
| `smartCarousel`, `casesGalleryFiltered`, `casesGalleryFilteredWithPagination`, `casesIntro` | data-driven case pages | channel/language filters, empty dataset, pagination and image fallback verified |
| `servicesHeroWithBadge`, `servicesGalleryFiltered` | dedicated services pages | avoid badges in a landing-page hero; verify filter keyboard behavior |
| `smartPeople` | data-driven people directory | portrait consent/alt text, empty and partial profiles, stable ordering |
| `smartUnitsGallery`, `smartUnitsGlobe`, `unitLogoGrid` | multi-unit or network pages | confirm Renaissance is still the primary brand; do not replace the approved local reach pattern by default |
| `resultsMetrics`, `headlineChallenge` | case-study evidence | every number and claim approved; never use placeholder metrics |
| `pageBuilderPersonioJobs` | jobs page | external service behavior, filters, error/empty states and privacy review |
| `sublineComponent`, `oneSPHeader`, `pageBuilderLogoFloat` | transitional or specialist compositions | verify duplicate-brand risk and semantic heading order |

## Compatibility only

| Block type | Reason |
| --- | --- |
| `oneSpComponentGroupReference` | shared 1SP group contract; must not silently inject 1SP visual language into a Renaissance page |

Compatibility blocks require explicit design review and a channel/data-scope check. They are not standard Renaissance authoring options.

## Component behavior rules

### Navigation

- Desktop text targets are at least 24 × 24px, preferably 32px high.
- The current destination is visually and semantically identifiable.
- Every generated anchor exists in the initial page shell; heavy content inside it may hydrate later.
- Compact/idle-hide navigation never becomes hidden or inert while focus is inside it.
- Mobile navigation follows the modal dialog pattern: focus in, contained focus, Escape out, trigger focus restored.

### Buttons and links

- Rectangular actions and navigation controls use `radius.action` (4px); pill geometry is not part of Renaissance UI.
- Public variants: `brand`, `dark`, `glass`, `ghost`.
- `brand`: primary action on paper/mist.
- `dark`: strong action on light neutral surfaces.
- `glass`: media-backed surface only, after contrast verification.
- `ghost`: secondary action where the adjacent primary action establishes affordance.
- Internal links stay in the current tab. HTTP(S) links may open externally only when user expectation is clear. `mailto:` and `tel:` never use `target="_blank"`.
- Incomplete CMS actions render nothing; never fall back to `href="#"`.
- Minimum action height: 44px for primary controls and all touch controls.

### Story carousel

- The media frame is full-width up to 1680px, independent of the general site container.
- Maximum five curated stories on a landing page.
- The first story is editorially selected, not random.
- The containing `renaissanceSectionBand` may select a dark-green or light carousel surround without changing the carousel content contract.
- Autoplay requires a visible pause control and stops for reduced motion, focus, hover and document invisibility.
- Announce manual changes politely; do not announce every automatic change.
- Media uses an optimized responsive source and a stable aspect/min-height to prevent layout shift.

### Service set

- Client ticker logo bounds are 144 × 36px on mobile and 168 × 48px from 768px, with matching responsive image sizes.
- Cards are permitted on desktop because the repeated planes materially group the six services.
- On mobile, use a compact editorial list unless a service card is itself clickable.
- Descriptions are one or two sentences and should stay below 140 characters where possible.
- The set must have a framing statement; do not present a “channel buffet.”

### Two-column narrative

- The Origins content honors the two-column block’s `paddingY` setting (32/64/96/128px), title visibility/color, body size and column order. Its badge supplies separate section separation: 48px on mobile/tablet and a default 96px on desktop, with explicit desktop CMS overrides respected. The legacy adapter must preserve saved title/body copy. Origins uses the saved `renaissanceMediaLayout`: `logos` renders the ordered `renaissanceLogos` array; `media` uses the existing image/video and alt text. The optional shared `cta` supplies the standard Button2. Empty logos or a removed/incomplete CTA stay empty; approved defaults live only in the fallback content. Studio exposes these fields only for Renaissance and hides image/video controls in logo-grid mode.
- Image alt describes the person/place/context, not the visual styling.
- Never show a “No media” production placeholder. If optional media is absent, render the text as a complete editorial section.
- Parallax is progressive enhancement and must stop for reduced motion.

### Global reach

- The globe block places its CMS title and description on the left and an enlarged upper-hemisphere crop on the right from 768px; mobile stacks text above the globe. The split view uses a square canvas and 260-unit camera distance to fit the full silhouette width with side clearance at every breakpoint. A 3:2 viewport reveals the upper portion and fades its lower edge into the section background instead of cutting a hard rectangle. Location labels retain a readable screen size independent of camera distance.
- Locations are always available as text, independent of canvas/WebGL.
- Mobile map height is capped at 55–65svh.
- If WebGL or motion is unavailable, render a static map image/pattern with the same location list.

### Footer

- The homepage 1SP group and footer share a 1680px maximum width and aligned edges. The group has 6px upper corners; the footer has square upper corners and 6px lower corners, with no gap at their join.
- Footer content is derived from actual page/site data where possible.
- Legal/company links remain readable and valid even when no Sanity page exists; use a deliberate empty/setup state rather than a false content page.
- Footer is a destination, not a second homepage. Limit to four clear columns and one primary contact action.

## Content limits

| Element | Preferred limit |
| --- | --- |
| Hero headline | 3 lines desktop, 5 lines mobile; 35–65 characters where copy allows |
| Hero support | one short lead + one paragraph, total ≤220 characters |
| Section headline | ≤70 characters |
| Section support | one paragraph, 45–90 words |
| Service title | 2–4 words |
| Service description | ≤140 characters preferred |
| Story title | ≤40 characters preferred |
| Story description | ≤180 characters |
| CTA label | 2–4 words, starts with a verb |

Limits are guardrails, not truncation rules. If approved content exceeds them, adjust composition deliberately rather than clipping text.
