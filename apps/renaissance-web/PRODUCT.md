# Renaissance Web

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The public audience and its primary conversion task are deliberately undecided until Renaissance content and positioning are supplied. Editors will manage the site through the existing central Sanity Studio.

## Product Purpose

Renaissance Web is an independent frontend for the `renaissanceWeb` channel in the shared 1SP multisite platform. Its first milestone is a production-grade English site foundation with the same functional coverage as FLZR, ready for Renaissance-owned content later.

## Capabilities and Constraints

- Full functional parity with the current FLZR app: pages, cases, services, contact, navigation, footer, SEO routes, preview, revalidation, analytics placeholders, and guarded relationship-sync plumbing.
- English is the only initial locale. English public URLs are locale-free while the internal locale route preserves future multilingual expansion.
- The site uses the existing shared Sanity project, schema, query packages, and central Studio, with strict `renaissanceWeb` and language filtering.
- No Renaissance Sanity documents or global-content assignments exist in this milestone. Missing homepage content renders a branded, no-index setup state.
- Deployment configuration is prepared but no Vercel project, domain, branch, commit, push, or content publication belongs to this milestone.
- Existing 1SP, FLZR, and MSM behavior must remain intact.

## Brand Commitments

- Public name: Renaissance.
- Existing Renaissance wordmark assets are the approved logo source.
- Renaissance is visually connected to FLZR through its component proportions, generous radii, bold-italic display voice, and motion character.
- IBM Plex Sans Variable is Renaissance's standard typeface. Its `wght` (100-700) and `wdth` (75-100) axes are exposed through site-level role tokens for precise display, body, and UI typography control.
- The interface is light-mode only. Deliberate dark media treatments are allowed where content contrast requires them.
- The primary accent is `#008da7`; FLZR violet must not leak into Renaissance-owned UI.

## Evidence on Hand

- Black horizontal wordmark: `public/logos/renaissance-horz_logo.svg` in the FLZR source app.
- White horizontal and stacked variants plus a Renaissance cover image: `public/units/RENAISSANCE/` in the FLZR source app.
- No approved Renaissance marketing copy, claims, case selection, services, people, menus, or page content is available yet. Future work must not fabricate them.

## Product Principles

- Keep Renaissance independent at the app, routing, layout, visual registry, metadata, tracking, and deployment boundaries.
- Reuse shared data contracts and utilities without sharing brand-specific UI.
- Filter reusable content explicitly by channel and language rather than duplicating documents.
- Preserve existing sites while evolving the platform additively.
- Prefer an honest empty state over invented public content.

## Accessibility & Inclusion

The site must remain keyboard-accessible, responsive on desktop and mobile, motion-safe for reduced-motion users, and legible against its light surface system.
