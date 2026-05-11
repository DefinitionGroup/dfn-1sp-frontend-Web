# AGENTS.md

This repository is evolving from a single 1SP website into a multi-site frontend platform powered by one Sanity CMS. Follow these rules when making changes.

## Production Baseline

- The current 1SP website is live. Preserve its existing runtime behavior unless a task explicitly says to migrate or change it.
- Do not change 1SP routing, middleware behavior, canonical URLs, sitemap output, or Vercel deployment assumptions as a side effect of FLZR platform work.
- Prefer additive changes while the platform is being introduced. Keep existing `channel` fields and queries working during migration.
- Do not use a permanent deployment branch per website. Branches are for implementation work; deployments should be app-root/project based.

## Multi-Site Model

- Website-specific content and behavior:
  - pages
  - menus
  - navigation
  - footer
  - page-builder registry
  - layout
  - theme
  - fonts
  - SEO defaults
  - tracking and analytics
  - domains and locale strategy
- Global reusable content:
  - cases
  - services
  - people
  - clients
  - units and shared assets
- Global content must be filtered by website/channel and language. Do not duplicate global documents just to make them appear on another website.
- Use explicit `channel` or future `website` assignment to control where global content is shown.

## Current Website Channels

- `1spWeb`
- `flizrWeb`
- `msmWeb`
- `studioco2Web`

The long-term platform should support more website channels without hardcoding channel lists in many schema and query files.

## Frontend Architecture Direction

- FLZR should become an independent frontend app with its own routing, layout, navigation, SEO, sitemap, robots, tracking, fonts, and page-builder registry.
- Reuse shared logic through packages or clearly separated shared modules.
- Case pages may share the same data contract and logic, but markup and styling can be site-specific.
- Page builders should follow the same pattern across websites, but each website may have a different component set.
- Do not force FLZR through `content1sp`; use a FLZR-specific page-builder field/registry when implementing FLZR pages.

## Sanity Rules

- Schema changes should be backward-compatible while 1SP remains on the current app structure.
- If adding website/channel assignment to a global type, apply it consistently across cases, services, people, clients, and units as needed.
- Queries for global content should accept `channel` and `language`.
- Prefer membership checks like `$channel in channel` for channel arrays.
- Pages and menus are website-specific and should continue to be scoped by channel and language.

## Frontend Design Rules

- Preserve existing website/design-system patterns when working inside the current 1SP site.
- For new branded sites such as FLZR, build a distinct brand experience rather than a generic relabeling of 1SP.
- On branded pages, the brand/product name must be a hero-level signal.
- Avoid generic, overbuilt layouts. The first viewport should read as one composition unless the page is explicitly a dashboard.
- Use expressive, purposeful fonts; avoid default stacks such as Inter, Roboto, Arial, or system fonts for new branded surfaces.
- Use real imagery or context as the main visual anchor. Do not rely on abstract decoration as the main visual idea.
- Keep landing-page heroes focused: brand, headline, short support sentence, CTA group, and one dominant visual plane.
- Do not place cards in heroes. Use cards only where they materially help interaction or comprehension.
- Ensure desktop and mobile load correctly before considering frontend work complete.

## Verification

- For platform changes, verify the existing 1SP build still passes before merging.
- For each new website app, verify its own build, sitemap, robots, canonical URLs, language routing, and tracking configuration independently.
- When changing global Sanity queries, verify at least one page/case/service/person flow for the affected website channel.
