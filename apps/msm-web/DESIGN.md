---
name: MSM.digital
description: Angular digital precision with the living MSM mosaic as its signal.
colors:
  paper-black: "#0a0c0d"
  surface-black: "#14181a"
  ink-white: "#f4f4f4"
  signal-cyan: "#03b8d4"
  signal-teal: "#02a8b2"
  signal-magenta: "#d10dab"
  signal-red: "#d61e45"
  signal-orange: "#ed4033"
  signal-amber: "#f5991c"
  form-error: "#ffb8b0"
typography:
  display:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.2rem + 3.5vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  title:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1rem + 2.7vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  body:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.92rem + 0.35vw, 1.25rem)"
    fontWeight: 500
    lineHeight: 1.65
  label:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.12em"
  editorial-heading:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 2.6vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  editorial-copy:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.3vw, 1.25rem)"
    fontWeight: 500
    lineHeight: 1.7
  editorial-support:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.4vw, 1.25rem)"
    fontWeight: 500
    lineHeight: 1.55
  service-hero-title:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  service-hero-subtitle:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.6vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  none: "0"
spacing:
  xs: "0.8rem"
  sm: "1.6rem"
  md: "3.2rem"
  xxl: "6.4rem"
  section: "clamp(4.5rem, 8vw, 8rem)"
  container: "clamp(1.5rem, 4vw, 4rem)"
components:
  selection-card:
    textColor: "{colors.ink-white}"
    rounded: "{rounded.none}"
    padding: "clamp(1rem, 2vw, 1.75rem)"
  mobile-navigation:
    backgroundColor: "rgb(10 12 13 / 90%)"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.none}"
    padding: "0 1.25rem"
  badge:
    textColor: "{colors.ink-white}"
    rounded: "{rounded.none}"
    padding: "1.25rem"
  contact-input:
    backgroundColor: "{colors.paper-black}"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1rem"
  contact-submit:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.paper-black}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.5rem"
---

# Design System: MSM.digital

## Overview

**Creative North Star: "Vast Space"**

MSM.digital feels precise, expansive, and technically alive. The existing homepage is the visual authority: full-bleed real media, Aspekta, angular geometry, hairlines, the living mosaic mark, and MosaicButton establish its identity for a gaming and marketing audience. Preserve the existing hero composition and effects.

The interface is one continuous field. One Medium weight creates hierarchy through scale, spacing, line height, and contrast. Linked Unit cards share the badge drawing signature; badges drag two staggered dotted selections in opposing diagonals, then retain content and four small homepage-style crosses with very dim dotted borders. This is a consolidation of the incumbent world, not a new visual concept.

**Key Characteristics:**

- Full-bleed real media with dark scrims for readable text.
- Square corners, hairline divisions, and exact corner crosses.
- Aspekta Medium throughout MSM-owned text.
- Cube colors as focused brand and interaction signals.
- Existing mosaic effects and purposeful, interruptible transitions.

## Colors

Near-black fields and light ink support real media; the cube palette supplies concentrated color.

### Primary

- **Signal Cyan:** Selection, keyboard focus, active Unit indicators, and the cool facet of the mark.

### Secondary

- **Signal Teal, Magenta, Red, Orange, and Amber:** The incumbent mosaic palette. Preserve its authored facet combinations rather than recoloring the identity.

### Neutral

- **Paper Black:** The page field.
- **Surface Black:** Media fallback and tonal depth.
- **Ink White:** Primary text and high-contrast marks.

Contact errors use **Form Error**, a light warm tone legible on the dark form surface. It is a semantic exception, not an additional decorative mosaic color. Success retains Ink White with a Signal Cyan divider.

**The Signal Rule.** Use cube colors for the mark, mosaic CTA, focus, and active state. Preserve authored imagery and hero effects; do not spread those colors into unrelated decorative surfaces.

## Typography

**Display Font:** AspektaVF (with system sans fallback)
**Body Font:** AspektaVF (with system sans fallback)

**Character:** One family and one Medium weight give MSM a coherent voice. Scale, line height, reading measure, and space create emphasis; headlines remain sentence case and non-italic.

### Hierarchy

- **Display:** The fluid display role in the frontmatter serves heroes and principal headings.
- **Title:** The smaller fluid title role serves the selected Unit and supporting section headings. The selected Unit resolves to 1.75rem on mobile.
- **Body:** Fluid narrative copy uses the frontmatter body role and a maximum measure of 68ch; selected-Unit copy narrows further for the media composition.
- **Label:** The compact uppercase role serves actual descriptors, navigation context, and badge subtitles. It is not permission to add decorative eyebrows above headings.
- **Editorial heading, copy, and support:** Scoped roles for content sections, cases introductions, CTA bands, service directory rows, and contact forms. They retain Medium weight; prose stays within 68ch and support within 48ch. The CMS copy-size option remains supported.
- **Service hero title and subtitle:** Scoped roles for `servicesHeroWithBadge`, with maximum measures of 22ch and 46ch. They do not replace the signature homepage hero typography.

**The One Weight Rule.** MSM-owned text uses Aspekta Medium (500), including strong and bold markup. Embedded canonical 1SP groups retain their presentation boundary; do not restyle their weight as a side effect.

**The Display Discipline Rule.** Reuse the display, title, copy, and label roles. Do not add local bold/normal contrasts or competing display faces.

## Layout

Units and Services card blocks share `SelectionSequence`: one in-view trigger starts the badge at 0ms and cards at 200ms, 400ms, 600ms, and so on in document order. `SelectionFrame` owns the 200ms interval centrally; never reset the index per row. Reduced-motion and immediate keyboard-focus visibility remain supported.

Homepage Units placement is authored in CMS content using `msmUnitsGrid`; the homepage never inserts it automatically. Use `embedded: true` below a hero for section-level headings. The English homepage places it between Services and Team. Editors can reorder or remove the block, and choose all active Units or a manual selection. Introduction copy is optional.

Use a continuous full-width field with the fluid container and section spacing tokens. Unit detail content uses an asymmetric twelve-column layout at desktop, then one vertical sequence on mobile. Reading measure remains constrained inside generous sections.

Units use a two-column grid of individually linked cards on desktop and a single column below 768px, on both the homepage and Units page. Each card contains a real 16:10 image, Unit name, claim, directional arrow, and exploration cue. Every card is one navigation target. Frames have square corners, no shadow, small crosses, and a very dim dotted perimeter. The grid follows a compact brand-and-heading introduction, replacing the former shared image stage and selector strip.

Navigation changes at 768px: a fixed angular mobile bar with a 64px minimum height and 44px minimum-height links replaces the preserved desktop navigation. Real media remains full-bleed; controls and text stay within the container rhythm.

Editorial blocks use `EditorialBlocks.module.css`: an 80rem maximum inner width and fluid section padding (`clamp(3rem, 6vw, 6rem)`). Content sections divide heading and reading column 4/8 from 768px and stack below it. When no heading is authored, desktop prose keeps its right-column alignment. Cases introductions reverse the emphasis to an 8/4 heading/support split. Contact uses a 5/7 split from 1024px and a single sequence below it, with top clearance (`clamp(7rem, 10vw, 10rem)`) for fixed navigation.

## Elevation & Depth

Content planes stay flat at rest. Depth comes from photographs, video, dark scrims, tonal surfaces, crop movement, and the existing refractive desktop navigation. MosaicButton retains its signature shadow, recorded in the sidecar; it is not a template for card shadows.

**The Structural Depth Rule.** Use media, tonal separation, and hairlines for structure. Preserve signature button and desktop glass effects without copying them onto ordinary sections.

## Shapes

Visible corners are square. Radius tokens and the global safeguard resolve to zero. Rectangular media planes, one-pixel rules, the triangular mosaic lattice, and precise cross marks supply the form language.

## Components

### Mosaic Buttons

Reuse Button2/MosaicButton for signature CTAs. Its rectangular lattice, ambient facets, hover response, keyboard treatment, and authored shadow remain intact. The Medium label follows the MSM weight contract. A sidecar preview cannot replace the production mosaic mechanism.

### Selection Cards

`SelectionFrame` is the shared MSM primitive for cards and badges. It owns in-view detection, two diagonal dotted rectangle draws, moving small crosses, content reveal, and the faint resting border. Reuse this component for future cards rather than copying animation markup. `SelectionCards.module.css` supplies the shared Units and Services grid, media proportions, spacing, and type. Service cards are informational articles with full descriptions and the existing section CTA; Unit cards are direct links. The Services section replaces the former rotating sticky stack with this regular responsive grid.

Each card triggers once at 15% visibility. The right-hand card is offset by 120ms, while each frame retains its internal 180ms diagonal stagger. Images and text fade into the completed frame. The two strokes settle at 16% opacity each (on top of a 45% stroke color), making a quiet persistent perimeter. Keyboard focus immediately reveals the link content; reduced motion renders the complete faint frame and content immediately. Mouse hover gently scales only the photograph and shifts the arrow; touch does not rely on hover.

### Case Tiles

Case galleries reuse `SelectionSequence` and `SelectionFrame`: two diagonal draws with 200ms staggering in document order. Case frames opt into `transientCrosses`; after each 480ms stroke the crosses flicker for 500ms and disappear, leaving the faint perimeter. Existing badges and service/Unit frames retain their resting crosses. Reduced motion shows the case content and faint frame immediately, without crosses or parallax.

Case tiles use content-driven height and a 4:3 media button for the existing preview. The title and the signature `Button2` / `MosaicButton` action link directly to the case. Use one column on mobile, two from 768px and three from 1024px; preserve the editorial title, services and Unit attribution. Filter changes restart the sequence. Keyboard focus reveals content immediately.

### Case Detail Sections

MSM case bodies use a continuous Paper Black field. Shared CMS block names and copy remain intact; legacy light background selections do not control MSM presentation. `CaseSection.tsx` provides the common badge rail and reading column for challenge, solution, results, approach, introduction and case CTA blocks. Challenge and solution occupy separate rows within the same CMS block. Each row has one fine top divider and the same fluid vertical spacing.

From 768px, the badge rail and narrative use a 3/9 grid within the 88rem outer container; below it, the badge stacks before the copy. Section badges are 10–12rem squares on desktop and 8rem on mobile, using the existing two-draw animation. A badge uses its authored label when supplied, otherwise the section title. When the label is the title, it is the semantic h2; do not repeat the title in the narrative. Distinct authored titles and subtitles remain visible. Copy stays within 65ch, at 1.7 line height and 82% Ink White.

The full-bleed case hero retains its bottom-aligned title and Unit badge (10rem desktop, 7rem mobile). Quotes, metric values and diagrams remain in the reading column. Case CTA buttons align to that same column. Text-only results are content-driven; authored background media remains supported. Optional powered-by/contact content uses dark surfaces too. The minimap collects only case sections.

### Case Motion

Case heroes reuse the homepage `DecryptRotator` headline mechanic, with a 700ms reveal cap and 60ms start offset. The component reserves the final text geometry and exposes one stable screen-reader label. Homepage defaults and rotating timing remain unchanged.

`CaseReveal` observes each reading unit independently: challenge/intro copy, actual Portable Text paragraphs, approach list items, results copy, quote and attribution, metric labels, and CTA/contact text and actions. CaseSection enables content targeting; it never animates both a container and its descendants. Numeric count-ups and badge drawing keep their own existing behavior. Hero text and contact media use direct-child targeting.

Each item plays once when it enters 15% inside the viewport (inset capped at 120px). Use a 12px upward settle, 600ms gentle curve (`0.25, 0.1, 0.25, 1`), and 90ms stagger among items entering together, capped at 270ms. Offscreen items wait for their own intersection, including later paragraphs in a long solution. Resize recalculates the inset. Native Web Animations animate transform and opacity from readable server HTML; keyboard focus settles the local sequence immediately, and reduced motion cancels it. Avoid word-by-word effects on long case paragraphs.

Case media has no pixel texture, entrance zoom, parallax or heavy blur. A 450ms fade and a static dark scrim keep the full-bleed image steady and text legible. Video plays only while in view, pauses offscreen, and uses its poster for reduced motion or playback failure. Existing badge drawing and mosaic button behavior remain unchanged.

### Framed Badge

A single in-view trigger at 15% visibility runs once per mount. Two pairs of small monospace + glyphs match the homepage's `font-mono text-xs` corner markers (14px in the current MSM type scale). In the first pair, one cross anchors the top-left and the other drags to the bottom-right, pulling out a dotted selection rectangle. A second pair repeats the action from top-right to bottom-left, staggered by 180ms. The crosses translate with the moving corners and never scale.

Each pair appears 80ms before its 480ms drag. The first drag runs from 80–560ms; the second from 260–740ms, both with the existing Vast bezier. Rectangle strokes remain 1px with rounded 1px/3px dots. Each border dims to 16% opacity over 160ms starting 40ms after its drag completes. Content fades in without moving or scaling from 740–980ms. The final state retains the four small crosses, content, and a very dim dotted border.

Badges are always square (1:1) at every breakpoint. Small, medium, and large sizes cap at 10rem, 12rem, and 15rem, shrinking to fit their parent. The mark and copy remain vertically arranged; container-relative type, mark size, and padding fit the square. Badge content is positioned inside the square so it cannot stretch the frame. This badge-only constraint does not apply to content cards. Reduced motion skips both selections and immediately shows content plus four stationary crosses, with very dim dotted borders. Absolute decoration and clipped drag planes prevent layout shifts and horizontal overflow.

### Navigation and Text Links

The mobile bar uses a near-opaque Paper Black field, a fine bottom rule, a small MSM logo, and compact links. The active destination is cyan. Keep the existing desktop refractive navigation and its effects. MSM-owned interactive elements receive a cyan 2px focus outline with 5px offset.

Unit cards are single direct links with a cyan SVG arrow. Hover moves the arrow diagonally over 180ms; the complete card is keyboard accessible and readable without hover.

### Animated MSM Mark

Preserve the approved animated cube mark. It represents Units until editorial Unit logos exist. Its reduced-motion state is complete and static; do not approximate the identity with arbitrary triangles.

### Conditional Editorial Sections

Render Cases and People only from actual Unit assignments. The inspected content currently provides four Units and no assigned Cases or leaders; this absence does not justify invented cards, names, or projects.

### Editorial Content and Cases Introduction

`contentSection` keeps authored rich text intact on the dark page field. A fine top rule separates the 4/8 heading-and-prose composition; paragraphs, lists, quotations, and inline links retain readable spacing. Copy uses light ink at 82% opacity, with cyan list markers, link underlines, and quotation rules. Strong markup emphasizes contrast while retaining Medium weight. `casesIntro` uses a larger Ink White heading and smaller cyan support; both stack on mobile.

`EditorialReveal` keeps text readable at first paint (`initial={false}`), then settles it upward by 12px on first entry with a non-bouncing spring (`visualDuration: 0.35`). It never hides text behind an opacity gate. Reduced motion targets the complete static state; shared stagger helpers also remove child delay and stagger waits.

### Service Hero with Badge

`servicesHeroWithBadge` is a full-bleed media plane with bottom-aligned copy and the existing square badge. Its height is content-driven above a fluid minimum (`clamp(30rem, 68svh, 52rem)`). From 768px the badge occupies the right column; on mobile it follows the copy in the normal flow. Authored CTA details and list items remain present when supplied. Preserve these content slots and the badge mechanism rather than inventing overlays or additional labels.

`HeaderImageVideoComp2` applies its dark scrim immediately; the service hero uses 60% opacity. It retains a stable video element and poster, plays only while visible without reduced motion, and pauses otherwise. Optional parallax spans 0–10% of the media height and stops under reduced motion. This supporting-media behavior does not replace the separate signature homepage hero effects.

### Media Feature

`msmMediaFeature` is one reusable framed passage for feature moments such as hashtaglove. The frame draws itself with the case tile selection signature (two dotted selections dragging opposite corners, crosses that dismiss), then its content fades in: a full-bleed background video behind a darkening scrim whose strength editors set in Studio (video brightness, 10–100), with a bottom legibility ramp. The copy then rises in sequence: eyebrow, headline on the editorial scale, support copy within 46ch, and one MosaicButton whose eyebrow line carries the "Let's talk" label. No hover interaction, no telemetry; reduced motion shows the poster and renders the copy immediately.

### Intertitle CTA Band

`intertitleCTA` is a compact text-and-action band between fine horizontal rules. Copy and the existing MosaicButton sit together on desktop and wrap into a vertical sequence on mobile. Supporting copy stays within 52ch. Preserve authored labels and destinations; use the existing button variant rather than a new CTA style. Press feedback translates the action by 2px over 100ms and becomes static for reduced motion.

### Service Directory

`MsmServiceDirectory` uses individually linked horizontal rows divided by hairlines. From 768px each row arranges an optional 16:10 source thumbnail, text, and cyan arrow in a 3/8/arrow grid. Mobile places the thumbnail above the text and arrow. One complete row is one navigation target; its title, description, and exploration label remain visible without hover. Fine-pointer hover scales only the image to 1.035 over 400ms and moves the arrow diagonally by 4px over 180ms; reduced motion removes these transforms.

This row pattern belongs only to the service directory. Existing Units and Services selection grids continue to use `SelectionFrame`, `SelectionCards.module.css`, and their badge-first sequence.

### Contact Form

The contact block uses a Surface Black field and angular Paper Black inputs with a 35%-opacity Ink White border. Inputs retain a 16px text size, a 3.25rem minimum height, visible labels, and cyan focus/caret treatments; the textarea is at least 11rem tall and vertically resizable. The form sits directly in the layout without a raised panel or shadow.

The submit action uses Signal Cyan with Paper Black text, a 3rem minimum height, Ink White hover fill, and subtle 2px press feedback. Submission keeps the existing content and request behavior: the form announces busy state, errors use `role="alert"`, and success uses `role="status"`. Keep form feedback readable on the dark surface and preserve the global keyboard focus outline. Reduced motion removes submit transitions and press translation.

## Do's and Don'ts

### Do:

- **Do** preserve the existing homepage, real media, hero effects, mark, and mosaic CTA as visual authority.
- **Do** use Medium text with scale, spacing, and contrast for hierarchy.
- **Do** use square geometry, hairlines, and crosses with precise alignment.
- **Do** keep Unit selection explicit, keyboard-accessible, and usable on mobile.
- **Do** show complete static content immediately for reduced motion.
- **Do** show editorial Cases and People only when actually assigned.

### Don't:

- **Don't** introduce a new visual world, random concept seed, or external reference direction.
- **Don't** add bold/normal weight variation to MSM-owned text.
- **Don't** introduce rounded cards, pills, or floating media panels.
- **Don't** add redundant eyebrows to identify an already named Unit or section.
- **Don't** replace signature hero, button, or mark effects with generic approximations.
- **Don't** invent imagery, Unit logos, Case assignments, or leadership content.

### Interactive Service Carousel

`interactiveServiceCarousel` is an MSM PageBuilder block with an ordered array of Globals service references. The server resolves MSM/language assignments, channel presentation overrides and the service's explicit MSM page relationship. Missing or unassigned services and services without a destination are omitted; shared documents are never duplicated.

The horizontal rail shows three angular media cards on desktop, two on tablet, and one plus the next card edge on mobile. A Motion transform track supports elastic touch/mouse dragging (0.18 edge resistance), horizontal trackpad scrolling, arrow controls and focused-rail arrow/Home/End keys. All movement settles onto measured card stops with a spring (stiffness 180, damping 24, mass 1); native scroll snap is disabled. Autoplay advances one stop every 5.5 seconds, reversing at either end. It pauses while the rail is hovered, focused or dragged, outside the viewport, in a hidden tab, or through the pause control. Reduced motion disables autoplay and animated settling. Cards reuse SelectionFrame's two-draw, transient-cross animation and Button2. The selected visible card alone plays its video; stable video elements pause/resume without reloading. The pause control also pauses previews, and reduced motion uses posters. Focus remains on navigation controls; tabbing reaches the actual service links. The full service directory stays below this curated introduction.
