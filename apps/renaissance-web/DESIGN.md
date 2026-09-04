---
name: Renaissance Web
description: A bold editorial games-communications system led by game worlds, compressed type, and confident teal surfaces.
colors:
  petrol: "#245e66"
  teal: "#99bbba"
  mist: "#dbe5e5"
  sand: "#edeae1"
  white: "#ffffff"
  ink: "#163f45"
  hairline: "#c8d2d0"
  signal-orange: "#f49a24"
typography:
  display:
    fontFamily: "IBM Plex Sans Variable, sans-serif"
    fontSize: "clamp(2.55rem, 6.2vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 82.5"
  body:
    fontFamily: "IBM Plex Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Sans Variable, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.15
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
rounded:
  indicator: "0.125rem"
  action: "0.25rem"
  card: "0.25rem"
  base: "0.25rem"
  media: "0.375rem"
  statement: "0.375rem"
spacing:
  section-sm: "3rem"
  section-md: "4rem"
  section-lg: "6rem"
  section-xl: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "0 1rem 0 1.25rem"
    height: "2.75rem"
---

# Design System: Renaissance Web

## Overview

**Creative North Star: "The Editorial Game World"**

Renaissance should feel like senior games-industry communications expressed as an editorial campaign: game imagery owns the canvas, compressed headlines deliver the point with confidence, and the persistent navigation carries the Renaissance brand. The approved homepage hero intentionally has no Renaissance wordmark. Petrol, teal, mist, sand, white, and ink form a light-first world with deliberate dark media passages.

The system is implemented through registered `RenaissancePageBuilder` blocks. The existing PageBuilder blocks and shared data contracts remain authoritative; Renaissance app-local presentation adapters compose them into the approved layout without changing their stored meaning. Sanity may replace the local homepage composition, but it must use the same block contracts and visual rules; do not create a separate homepage-only renderer or leak Renaissance styling into 1SP, FLZR, or MSM.

**Key Characteristics:**

- A Figma-faithful, wordmark-free homepage hero with Renaissance retained in navigation and full-bleed game media.
- Compressed editorial typography with natural-case body copy.
- Diagonal light streaks, flat colour planes, hairlines, and selective rounding.
- Controlled entrance, navigation, media, and button motion with reduced-motion fallbacks.

## Colors

Petrol is the primary action and headline signal; teal is the supporting highlight; mist and sand create quiet light surfaces; ink anchors text, navigation, dark sections, and the footer; white is reserved for contrast on media and ink. Signal Orange `#f49a24` is a deliberately narrow accent for the approved Figma section badges and signal details.

**The Renaissance-Only Rule.** Legacy violet, purple, lime, and blue APIs must resolve to the Renaissance teal family. Never expose FLZR violet in Renaissance-owned UI, and never broaden Signal Orange beyond the approved Figma signal role.

**The Sand Header Rule.** The initial navigation uses the dark Renaissance logo and ink text on the sand header. White navigation at rest does not provide acceptable contrast.

## Typography

IBM Plex Sans Variable owns display, headline, body, and UI roles. Use its weight axis across 100–700 and its width axis across 75–100; display roles are compressed to roughly 82.5%, labels remain slightly condensed, and body copy stays full width. Geist Mono is reserved for compact indices, telemetry-style eyebrows, and small system labels.

Display copy is bold, tightly tracked, and close-set; body copy is calm and readable with a preferred measure of about 68 characters. Italic IBM Plex Sans may punctuate a short word or phrase in teal, but does not introduce a separate serif personality.

**The Compression Rule.** Compress major headlines, not paragraphs. Preserve natural letter spacing for body and UI copy except for the intentional compact media-title treatment.

## Layout

Use one dominant composition per section. The homepage hero follows the approved Figma composition: one game world, one headline, one support statement, and the CTA group beneath the branded navigation, with no Renaissance wordmark inside the hero. Content aligns to a centered container capped near 1480px; desktop layouts use a 12-column grid, while mobile sections stack into a four-column rhythm.

Section spacing scales from 3rem on compact screens to 8rem on large screens. Intro passages use generous vertical breathing room, hairline starts, and asymmetric text columns. Story and game media remain broad and immersive rather than becoming small cards.

Mobile derives from the approved desktop layout and content rather than becoming a separate concept. Keep the same hierarchy and assets, then reflow them into compact compositions: media stays edge-dominant, hero copy and actions stack, the full-screen ink menu remains available, and readable line breaks are preserved without horizontal overflow. Landscape-small layouts must respect reduced viewport height.

## Elevation & Depth

The system is flat by default. Depth comes from tonal contrast, image overlays, diagonal translucent streaks, and foreground/background scale rather than a general shadow vocabulary. The compact scrolled navigation is the exception: it may use a soft ambient ink shadow, translucent white surface, border, and backdrop blur so it remains legible over content.

**The Flat-By-Default Rule.** Do not add decorative shadows to sections, service tiles, or media. A shadow must communicate a floating interactive state.

## Shapes

The hero resolves to a square full-bleed plane after its reveal. All rectangular UI uses crisp, very small corners: 2px for indicators, 4px for controls and cards, and 6px for large media or statement shells. True circles are reserved for geometry whose meaning depends on being circular, such as a status dot or the globe itself. Do not use pills or large-radius containers.

Hard diagonal streaks and skewed translucent planes are the signature motif. They should guide the eye through imagery or the page atmosphere, never become badges, chips, or detached decoration over the hero.

## Components

### Buttons

Buttons are compact, confident rectangles with subtly softened 4px corners and a right arrow. Primary buttons use petrol and white; dark buttons use ink and white; glass buttons are reserved for image-backed contexts. Hover assembles a bright teal/mist surface from a clearly readable, rapidly shuffled mosaic of small rectangles; the shader owns that surface change without a competing CSS background swap. The arrow and label change after the mosaic begins, with restrained spring scale providing immediate feedback. Focus uses a visible petrol ring with offset; reduced motion replaces the mosaic with an immediate static mist surface and removes spring scaling.

Origins and Join Us actions use the same `Button2` mosaic component as the hero. Origins reads its button label, destination and variant from the shared Sanity `cta` field; its logo list and visual mode are also explicit CMS values. The mosaic releases its shader resources on cleanup without explicitly losing the canvas context, so React's development remount can initialize it again.

### Navigation

The expanded navigation sits in page flow with the dark Renaissance logo and ink links on sand. It is the explicit brand carrier for the approved wordmark-free homepage hero. After 64px of scroll it compacts into a white translucent 4px-corner shell; it may hide after three idle seconds and returns with renewed scroll activity. Mobile uses the same compact corner treatment and a full-screen ink menu with numbered Geist Mono indices, large compressed links, hairline separators, and explicit open/close labels.

### Section Badges and Adapted Sections

Section badge labels are controlled by Sanity. They use Signal Orange `#f49a24` and retain the exact Figma badge asset. On entry, the signet fades in while rotating clockwise from -90 degrees to 0 over 420ms; only the collapsed brackets are visible beside it. The brackets expand over 360ms, then the text decrypts. The final label width is reserved throughout to prevent layout shifts. Editors may opt a section into a looped descramble with a 3.2-second readable pause after the entrance and between cycles; loops stop while offscreen or when the document is hidden. With `prefers-reduced-motion`, the final readable badge appears immediately. Badges introduce sections only; they are not permitted in the hero.

The approved services, network, people, and origin passages use the exact assets in `public/renaissance/figma/` and the compact compositions established by Figma file `nPhFDVszVftw0kl4D6afmr`. Renaissance app-local adapters may frame or augment existing PageBuilder blocks to achieve this presentation, but they must not fork or replace the shared block/data contracts.

### Media, Tiles, and Footer

Game stories are image-first and full-bleed, with controlled dark overlays for white copy and accessible controls. Services use the current compact Figma composition and exact `service-01.jpg` through `service-06.jpg` assets. Network, people, and origin proof use their corresponding Figma background, logo, portrait, award, bolt, and client-logo assets without substitutions. The footer is a substantial ink destination with the white wordmark, four clear content columns, hairline divisions, and simple arrow movement on links.

All Join Us actions use the canonical `/contact` route. Do not split content-creator or media intent into separate destinations unless that product decision is approved later.

Logo marquees use supported web image formats, pause on hover, and stop moving when reduced motion is requested. The unsupported Tencent AVIF logo is intentionally absent; do not restore it without a verified browser-safe asset.

## Do's and Don'ts

### Do:

- **Do** preserve the approved wordmark-free homepage hero, keep Renaissance visible in navigation, and let game imagery remain the dominant visual anchor.
- **Do** use the approved palette and ink text for accessible contrast on sand and mist.
- **Do** preserve the Pagebuilder-only content boundary and registered Renaissance block/data contracts; use app-local presentation adapters for the Figma layout.
- **Do** preserve the exact Figma services, network, people, and origin assets and their compact desktop-to-mobile compositions.
- **Do** provide visible focus states, meaningful alt text, keyboard-operable controls, and reduced-motion behavior.
- **Do** verify desktop, mobile, and short landscape viewports before release.

### Don't:

- **Don't** introduce FLZR violet, generic gradients, default font stacks, or an uncompressed substitute display face.
- **Don't** add a Renaissance wordmark to the approved homepage hero; navigation already carries the brand.
- **Don't** use inset hero cards, floating badges, detached labels, or secondary marketing clutter in the first viewport.
- **Don't** turn every section into a rounded card or use shadows as decoration.
- **Don't** use white initial navigation on the sand header or unsupported AVIF logos.
- **Don't** invent claims, metrics, or components outside the supplied content and Pagebuilder contracts.

## System Status and Source of Truth

This document is the canonical visual foundation for Renaissance. For the shipped redesign, Figma file `nPhFDVszVftw0kl4D6afmr` is the layout and content authority; runtime values live in `app/globals.css`; approved component behavior and Pagebuilder support tiers live in `design-system/COMPONENTS.md`; release criteria live in `design-system/RELEASE-CHECKLIST.md`. New work must update the relevant source in the same change when it alters a system contract. The independent finish verdict for this baseline is **Ship**.

The current homepage demonstrates the target language, but it is not permission to duplicate raw Tailwind values. Repeated decisions become semantic roles; one-off values remain exceptions until they prove a reusable need. The optional, backward-compatible `renaissanceSectionBand` marker is the redesign's only new schema object; it groups existing blocks and stores the editor-controlled badge label without changing those blocks.

## Design Principles

1. **Game worlds lead.** A real game, person or place owns the composition; the design supports it.
2. **Editorial, not ornamental.** Scale, crop, line and rhythm create energy. Badges, floating labels and generic gradient decoration do not.
3. **Senior clarity.** One strong point per section, short copy, confident actions and no channel-buffet presentation.
4. **Human proof.** Work, people and verified outcomes build trust before technology or network scale.
5. **Motion has a job.** Reveal hierarchy, show state or preserve spatial context. Do not animate because a component can.
6. **Robust before clever.** Navigation, semantics, reduced motion and static fallbacks are part of the visual system.

## Semantic Color Roles

Primitive names describe a stable brand color. Semantic names describe why it is used. Components must consume semantic roles wherever possible.

| Semantic role | Current value | Use | Never use for |
| --- | --- | --- | --- |
| `surface.page` | Sand `#edeae1` | default page field | text or dark media overlay |
| `surface.quiet` | Mist `#dbe5e5` | founder, supporting narrative, quiet data | primary CTA without contrast check |
| `surface.brand` | Petrol `#245e66` | primary action, active line, brand field | long body-copy background unless text is white |
| `surface.ink` | Ink `#163f45` | dark passages, footer, story frame | every section; dark is contrast, not the default mode |
| `text.primary` | Ink `#163f45` | headings and body on paper/mist | text on ink/media |
| `text.brand` | Petrol `#245e66` | light-surface headings and emphasis | low-priority metadata |
| `text.inverse` | White `#ffffff` | media and ink surfaces | teal surfaces (`2.06:1`) |
| `text.muted` | `#536f73` | temporary muted body role | normal text until darkened to ≥4.5:1 on paper |
| `text.decorative` | `#7d9899` | large accent phrase/non-essential graphics | normal body, labels, legal or navigation text |
| `accent.support` | Teal `#99bbba` | streaks, large emphasis, focus-support detail | white normal text; use ink on teal |
| `accent.signal` | Signal Orange `#f49a24` | approved Figma section badges and narrow signal details | general CTAs, body text or large surfaces |
| `border.light` | `#c8d2d0` | hairlines on paper/mist | interactive state without another cue |
| `border.dark` | white at 15% | hairlines on ink/media | small essential text |
| `focus` | Petrol `#245e66` | focus ring on light surfaces | focus on petrol/ink; use white there |

Verified contrast pairs:

- Ink on paper: 9.53:1.
- Petrol on paper: 6.09:1.
- White on petrol: 7.32:1.
- Ink on teal: 5.56:1.
- White on ink: 11.47:1.
- White on teal: 2.06:1 and not approved for normal text.

## Typography Roles

| Role | Typeface/axis | Fluid range | Leading | Use |
| --- | --- | --- | --- | --- |
| `display.hero` | IBM Plex Sans, 700, width 82.5% | `clamp(2.55rem, 6.2vw, 6rem)` or component-specific equivalent | 0.84–0.92 | one page-defining headline |
| `display.section` | IBM Plex Sans, 700, width 82.5% | `clamp(2.25rem, 3.2vw, 4.25rem)` | 0.96–1.02 | primary section heading |
| `display.component` | IBM Plex Sans, 600–700, width 82.5–90% | `clamp(1.65rem, 2.4vw, 2.5rem)` | 0.98–1.08 | card/story/component titles |
| `body.lead` | IBM Plex Sans, 500–600, width 100% | 1.125–1.25rem | 1.4–1.5 | short value proposition |
| `body.default` | IBM Plex Sans, 400, width 100% | 1–1.125rem | 1.55 | paragraphs, max 68ch |
| `label.action` | IBM Plex Sans, 600, width 95% | 0.8125–1rem | 1.15 | buttons and navigation |
| `label.system` | Geist Mono, 500 | 0.7–0.75rem | 1 | indices, dates, carousel status |

Semantic heading level and visual role are separate decisions. On a homepage, the page title is `h1`, major section titles are normally `h2`, and nested component titles are `h3`. Never choose `h3` merely because its default size looks right.

Italic display text is an accent, limited to one short phrase per headline. It uses teal only when the surrounding surface passes contrast requirements.

## Grid, Container and Spacing

- **Maximum content width:** 1480px for the general container; adapted section frames and the story carousel use an explicit 1680px cap.
- **Desktop grid:** 12 columns with 32px preferred gutters at large widths.
- **Tablet grid:** 6 columns.
- **Mobile grid:** 4 columns with 16–24px page insets.
- **Readable text measure:** 48–68ch; campaign captions may be 32–48ch.
- **Section spacing:** 48px compact, 64px standard mobile, 96px standard desktop, 128px immersive desktop. A section marker may add 32px, 64px or 96px before its section at the desktop breakpoint without changing smaller layouts.
- **Origins and Join Us separation:** these sections start 48px below the previous block on mobile/tablet. An unset desktop badge margin defaults to 96px; an explicit Sanity desktop setting still takes precedence. This applies to CMS content as well as the fallback.
- **Component spacing:** use a 4px base rhythm; prefer 8, 12, 16, 24, 32, 48 and 64px.

Do not use vertical space as a substitute for hierarchy. On 390px mobile, a non-interactive repeated item should normally stay below 18rem unless the media itself is the content.

## Shape and Surface Roles

| Role | Radius | Use |
| --- | ---: | --- |
| `radius.indicator` | 2px | progress markers and segmented-control states |
| `radius.action` | 4px | buttons and compact navigation |
| `radius.card` | 4px | repeated service/content tile |
| `radius.base` | 4px | small contained surface |
| `radius.media` | 6px | immersive media/globe passage and overlays |
| `radius.statement` | 6px | footer or singular closing statement |

**Compact-radius decision — 2026-08-12.** The previous 16–56px surface radii and pill actions were replaced by the 2–6px scale above across Renaissance-owned navigation, actions, forms, cards, media, overlays, carousels, filters, diagnostics and footer UI. `rounded-full` is not a rectangular component style; it remains valid only for intrinsically circular status or decorative geometry.

The page background may use the approved low-opacity diagonal pattern. Diagonal streaks are not independent stickers or badges; they either guide an image crop or connect the page atmosphere.

Shadows are state indicators, not decoration. Only floating compact navigation, menus and true overlays may use ambient shadow/backdrop blur.

## Motion System

| Motion | Duration | Easing | Purpose |
| --- | ---: | --- | --- |
| micro response | 160–280ms | ease-out/spring | hover, press, arrow shift |
| content entrance | 500–700ms | `--ease-renaissance` | establish hierarchy on first reveal |
| media transition | 650–800ms | overshoot curve | maintain spatial continuity between stories |
| ambient media | up to 7.5s | linear | subtle image scale only, never required to read content |

Rules:

- Maximum one entrance system and one ambient system per page.
- Section-badge decryption runs once on entry into view by default. Optional looping pauses for 3.2 seconds on the readable label and runs only while visible; reduced motion shows the final readable Sanity label immediately.
- Pause auto-changing content through a visible control.
- `prefers-reduced-motion` removes parallax, autoplay, pointer-following fields, marquee movement and view-transition travel.
- Focus, selection and validation never rely on motion alone.
- WebGL is progressive enhancement. Static color, text and actions remain complete when it fails.

## Responsive Behavior

- **Mobile (<640px):** derive from desktop content, hierarchy and assets; use a 4-column stack, full-width media, compact service list, capped map, modal menu and 44px actions.
- **Tablet (640–1023px):** 6-column grid, avoid ambiguous 3-up cards, retain readable 48–68ch measures.
- **Desktop (≥1024px):** 12-column asymmetry, broad story media, 3-up service grid and controlled negative space.
- **Short landscape (height ≤640px):** navigation and hero actions remain reachable; media height may yield to content.

Every navigable section shell must exist on first render. Heavy children can be deferred, but the stable ID, heading context and minimum layout reservation cannot be deferred.

## Accessibility Contract

- Normal text contrast is at least 4.5:1; large text at least 3:1.
- Touch controls are at least 44 × 44px; desktop text links have at least a 24 × 24px target.
- Visible focus exists on every interactive surface and is not hidden by sticky navigation.
- Modal menus/overlays use a real dialog pattern, Escape, focus containment, background inertness and trigger restoration.
- Carousels expose previous/next, pause/play, active state and reduced-motion behavior.
- Content order in the DOM matches reading order; visual grids do not reorder meaning.
- Meaningful media has specific alt text. Decorative streaks, repeated marquee logos and purely atmospheric media are hidden from assistive technology.
- Page remains usable at 200% zoom and reflows at 400% without horizontal page scrolling.

## Authoring and Governance

- `introBlockTypoSophisticated.renaissanceLayout` may explicitly select `editorial` or `compact` in Sanity. When unset, Stories, Services and People use the compact typography and stacked layout.
- Only Core blocks from `design-system/COMPONENTS.md` are normal Renaissance authoring choices.
- Conditional blocks require a documented page-specific review.
- Compatibility blocks stay hidden from editors unless a cross-site contract explicitly requires them.
- `navPointName` is unique per page, stable across content edits and mapped to an initial-render anchor.
- CTA variants use semantic names (`brand`, `dark`, `glass`, `ghost`). Legacy `violet`, `lime`, `purple` and `blue` names are compatibility aliases, not authoring language.
- Existing PageBuilder block types and data contracts are preserved; Renaissance app-local presentation adapters own the Figma-specific framing and composition.
- `renaissanceSectionBand` is optional, backward-compatible, and the only new schema object introduced by this redesign. It groups following blocks and stores the Sanity-controlled badge label plus optional desktop top spacing, badge animation mode and carousel background tone; it does not replace or mutate the grouped blocks.
- Carousel blocks inside a Renaissance section may use the default dark-green surround or the light paper surround selected by that section marker.
- Join Us actions resolve to `/contact`.
- Sanity may replace fallback content, but it must not replace this system contract.

## Definition of Done

Use `design-system/RELEASE-CHECKLIST.md`. At minimum, every material change requires a passing Renaissance build, fresh desktop/mobile visual evidence, keyboard and reduced-motion checks, verified anchors/routes, no console errors and—when shared platform code changes—confirmation that the existing 1SP build remains intact.
