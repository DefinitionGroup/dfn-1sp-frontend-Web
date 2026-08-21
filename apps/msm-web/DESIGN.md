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
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  body:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "AspektaVF, system-ui, sans-serif"
    fontSize: "0.64rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  none: "0"
spacing:
  xs: "0.8rem"
  sm: "1.6rem"
  md: "3.2rem"
  xxl: "6.4rem"
  container: "clamp(1.5rem, 4vw, 4rem)"
components:
  angular-sector:
    backgroundColor: "{colors.surface-black}"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.none}"
    padding: "1.5rem"
  label-signal:
    textColor: "{colors.signal-cyan}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
---

# Design System: MSM.digital

## Overview

**Creative North Star: "Vast Space"**

MSM.digital feels precise, expansive, and technically alive. Full-bleed media creates atmosphere; typography and hairline divisions establish order; the living mosaic mark provides the unmistakable brand signal. The composition is dark-first without becoming generic dark mode because the cube palette, angular geometry, and exact motion grammar carry the identity.

The interface is one continuous field rather than a collection of floating cards. Content is divided by hard edges, scale, and space. Motion arrives quickly and lands exactly, giving the surface presence without turning it into spectacle.

**Key Characteristics:**

- Full-bleed photographic planes with controlled darkening for legibility.
- Sharp, zero-radius geometry and one-pixel structural divisions.
- One unified hero display token plus a disciplined section-title scale.
- MSM cube colors used as signals, not broad decorative washes.
- Ambient mosaic motion and precise reveal transitions.

## Colors

The near-black field and warm white ink hold the composition while the cube palette appears in small, high-salience signals.

### Primary

- **Signal Cyan** (`#03b8d4`): Active labels, focus signals, selection, and the primary cool facet of the MSM mark.

### Secondary

- **Signal Magenta** (`#d10dab`): Secondary mosaic accent and controlled interactive emphasis.
- **Signal Orange** (`#ed4033`): Warm counterpoint inside the mark and occasional authored accent.
- **Signal Amber** (`#f5991c`): Warm facet color reserved for the mosaic family.

### Neutral

- **Paper Black** (`#0a0c0d`): Default page field.
- **Surface Black** (`#14181a`): Tonal separation for sections and interactive media sectors.
- **Ink White** (`#f4f4f4`): Primary text and high-contrast marks.

**The Signal Rule.** Cube colors are scarce signals. Do not turn them into full-section gradients or generic decorative backgrounds.

## Typography

**Display Font:** AspektaVF (with system sans fallback)
**Body Font:** AspektaVF (with system sans fallback)

**Character:** A single variable sans family creates cohesion through weight, scale, and tracking rather than ornamental font pairing. Headlines are confident, sentence case, and never italic.

### Hierarchy

- **Display** (700, `clamp(2.25rem, 1.2rem + 3.5vw, 4.5rem)`, 1.18): Heroes and principal editorial displays use the `headline-display` utility.
- **Title** (600, 1.875–3rem, compact): Unit names and structural section titles.
- **Body** (400, 1–1.25rem, 1.5–1.75): Narrative copy, normally limited to 65–75 characters per line.
- **Label** (700, 0.64rem, 0.14em, uppercase): Navigation microcopy, descriptors, and technical wayfinding.

**The Display Discipline Rule.** Use `headline-display` for heroes and principal displays; use the established title scale for section headings instead of inventing local sizes.

## Layout

The page is a continuous 12-column field with fluid horizontal padding (`clamp(1.5rem, 4vw, 4rem)`). Promotional heroes are full-bleed visual planes. Below them, hard-edged sectors and asymmetric text columns create rhythm without card containers.

Desktop grids commonly split into two or twelve columns. Mobile collapses to one vertical sequence without losing full-bleed media or structural borders. Use generous section separation, compact internal groups, and no horizontal overflow.

## Elevation & Depth

Content planes are flat by default and do not use resting card shadows. Depth comes from photographic planes, tonal black surfaces, dark overlays, scale, clip reveals, and foreground/background motion. The sacred MosaicButton is the explicit exception: its `0 10px 28px rgba(0,0,0,0.45)` shadow lifts the signature CTA above the field.

**The Structural Depth Rule.** Prefer a one-pixel divider, tonal shift, or media crop. The MosaicButton shadow is the deliberate signature exception.

## Shapes

All visible corners are square. Radius tokens resolve to zero and a global safeguard strips incidental rounded utilities. Geometry is built from rectangular planes, hairline borders, the triangular mosaic lattice, and occasional precise clip-path reveals.

## Components

### Mosaic Buttons

- **Shape:** Rectangular, zero radius.
- **Primary:** High-contrast label over the animated triangular mosaic lattice.
- **Hover / Focus:** Facets respond in a localized wave; keyboard focus uses the cyan signal ring.
- **Rule:** Reuse `Button2` / `MosaicButton`; do not approximate the signature CTA.

### Angular Media Sectors

- **Corner Style:** Zero radius.
- **Background:** Paper Black or Surface Black with a full-bleed image.
- **Depth:** Dark overlays and crop movement, never a resting shadow.
- **Border:** One-pixel white at low opacity.
- **Internal Padding:** Fluid container token.

### Navigation

Navigation is a thin fixed layer over the visual field. Labels are compact and neutral; the colorful MSM mark is the brand anchor. Mobile reduces navigation density rather than introducing a separate rounded control language.

### Animated MSM Mark

The cube facets ambiently flip within the approved mark palette and return home. It is the placeholder identity for Units until an editorial Unit mark exists. Reduced-motion users receive the complete static mark.

## Do's and Don'ts

### Do:

- **Do** use full-bleed contextual imagery as the dominant visual anchor.
- **Do** structure lists and grids with hard edges, hairline borders, and spacing.
- **Do** use the animated MSM mark and mosaic CTA as signature brand moments.
- **Do** preserve readable copy measures and strong light-on-dark contrast.
- **Do** make reduced-motion states complete rather than empty.

### Don't:

- **Don't** introduce rounded cards, pills, floating media panels, or soft dashboard tiles.
- **Don't** add generic purple-on-white gradients or ornamental glow effects.
- **Don't** create a new display font, serif voice, or italic headline style.
- **Don't** use cube colors as broad decoration; keep them as signals.
- **Don't** replace the existing button or mark motion with a generic animation.
