# Renaissance Web

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Games-industry developers, publishers and senior communications teams looking for an experienced PR partner. The primary conversion task is to start a direct conversation with Renaissance; editors manage the site through the existing central Sanity Studio.

## Product Purpose

Renaissance Web is the independent `renaissanceWeb` frontend in the shared 1SP multisite platform. The homepage presents Renaissance as a senior, human-first communications partner for the games industry and turns the supplied wireframe and Taster material into a resilient, editorial web experience.

## Capabilities and Constraints

- Full functional parity with the current FLZR app: pages, cases, services, contact, navigation, footer, SEO routes, preview, revalidation, analytics placeholders, and guarded relationship-sync plumbing.
- English is the only initial locale. English public URLs are locale-free while the internal locale route preserves future multilingual expansion.
- The site uses the existing shared Sanity project, schema, query packages, and central Studio, with strict `renaissanceWeb` and language filtering.
- The active development dataset currently contains no Renaissance homepage documents. A production-quality local composition built from registered Pagebuilder blocks is used until an editor publishes Sanity homepage content; Sanity remains authoritative.
- Deployment configuration is prepared but no Vercel project, domain, branch, commit, push, or content publication belongs to this milestone.
- Existing 1SP, FLZR, and MSM behavior must remain intact.

## Brand Commitments

- Public name: Renaissance.
- Existing Renaissance wordmark assets are the approved logo source.
- Renaissance has its own editorial visual language: large compressed headlines, full-bleed game imagery, diagonal light streaks, flat colour planes and controlled motion.
- IBM Plex Sans Variable is Renaissance's standard typeface. Its `wght` (100-700) and `wdth` (75-100) axes are exposed through site-level role tokens for precise display, body, and UI typography control.
- The interface is light-mode only. Deliberate dark media treatments are allowed where content contrast requires them.
- The approved palette is Petrol Blue `#245e66`, Renaissance Teal `#99bbba`, Off White `#dbe5e5`, Sand `#edeae1` and White `#ffffff`; FLZR violet must not leak into Renaissance-owned UI.

## Evidence on Hand

- Supplied homepage wireframe: `1SP_WORLD SERIES_2026_RENAISSANCE_Wireframe_v2.pdf`.
- Supplied brand and content Taster: `taster RENAISSANCE_PP_V4 1 (2).pptx`.
- Existing wordmarks and cover art in `public/logos/` and `public/units/RENAISSANCE/`.
- Approved Taster copy for positioning, services, founder profile and the Romeo Is A Dead Man and Yooka-Re-Playlee campaign stories. Unsupported performance metrics must not be invented.

## Product Principles

- Keep Renaissance independent at the app, routing, layout, visual registry, metadata, tracking, and deployment boundaries.
- Reuse shared data contracts and utilities without sharing brand-specific UI.
- Filter reusable content explicitly by channel and language rather than duplicating documents.
- Preserve existing sites while evolving the platform additively.
- Use the supplied messaging as the factual boundary and prefer omission over invented claims or metrics.

## Accessibility & Inclusion

The site must remain keyboard-accessible, responsive on desktop and mobile, motion-safe for reduced-motion users, and legible against its light surface system.
