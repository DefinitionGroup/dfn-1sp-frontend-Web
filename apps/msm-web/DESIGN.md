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

**The One Weight Rule.** MSM-owned text uses Aspekta Medium (500), including strong and bold markup. Embedded canonical 1SP groups retain their presentation boundary; do not restyle their weight as a side effect.

**The Display Discipline Rule.** Reuse the display, title, copy, and label roles. Do not add local bold/normal contrasts or competing display faces.

## Layout

Units and Services card blocks share `SelectionSequence`: one in-view trigger starts the badge at 0ms and cards at 200ms, 400ms, 600ms, and so on in document order. `SelectionFrame` owns the 200ms interval centrally; never reset the index per row. Reduced-motion and immediate keyboard-focus visibility remain supported.

Homepage Units placement is authored in CMS content using `msmUnitsGrid`; the homepage never inserts it automatically. Use `embedded: true` below a hero for section-level headings. The English homepage places it between Services and Team. Editors can reorder or remove the block, and choose all active Units or a manual selection. Introduction copy is optional.

Use a continuous full-width field with the fluid container and section spacing tokens. Unit detail content uses an asymmetric twelve-column layout at desktop, then one vertical sequence on mobile. Reading measure remains constrained inside generous sections.

Units use a two-column grid of individually linked cards on desktop and a single column below 768px, on both the homepage and Units page. Each card contains a real 16:10 image, Unit name, claim, directional arrow, and exploration cue. Every card is one navigation target. Frames have square corners, no shadow, small crosses, and a very dim dotted perimeter. The grid follows a compact brand-and-heading introduction, replacing the former shared image stage and selector strip.

Navigation changes at 768px: a fixed angular mobile bar with a 64px minimum height and 44px minimum-height links replaces the preserved desktop navigation. Real media remains full-bleed; controls and text stay within the container rhythm.

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
