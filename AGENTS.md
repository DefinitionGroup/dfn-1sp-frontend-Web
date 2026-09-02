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
- `renaissanceWeb`

`packages/site-config/src/index.ts` is the source of truth for the channel union and per-site runtime configuration. The long-term platform should support more website channels without hardcoding channel lists in many schema and query files.

## Frontend Architecture Direction

- FLZR should become an independent frontend app with its own routing, layout, navigation, SEO, sitemap, robots, tracking, fonts, and page-builder registry.
- Reuse shared logic through packages or clearly separated shared modules.
- Case pages may share the same data contract and logic, but markup and styling can be site-specific.
- Page builders should follow the same pattern across websites, but each website may have a different component set.
- Do not force FLZR through `content1sp`; use a FLZR-specific page-builder field/registry when implementing FLZR pages.

## Renaissance Status

- `renaissanceWeb` is implemented as an independent frontend in `apps/renaissance-web`. It owns its routing and middleware, site shell, navigation, footer, page-builder registry, theme/fonts, SEO metadata, sitemap, robots, tracking, and deployment configuration while reusing shared Sanity contracts and query helpers.
- Renaissance currently supports English only. Public URLs are locale-free; middleware rewrites them to the internal `/en` route. Local development runs on port `3003`.
- The homepage is CMS-first. When its published Sanity page or content blocks are absent, it intentionally renders the production-quality fallback in `apps/renaissance-web/data/homepageFallback.ts`. Verify the active dataset before treating fallback rendering as a code defect.
- The configured public deployment is the Vercel preview at `https://renaissance-1sp-dfn.vercel.app`. No Renaissance production domain is configured in `packages/site-config/src/index.ts`; preview deployments must remain non-indexable until that production boundary is explicitly introduced.
- For Renaissance design or page-builder work, read `apps/renaissance-web/DESIGN.md` and `apps/renaissance-web/design-system/RELEASE-CHECKLIST.md` before editing. Preserve its petrol/teal/sand visual system and its isolated `RenaissancePageBuilder` contract.

## Sanity Rules

- Schema changes should be backward-compatible while 1SP remains on the current app structure.
- If adding website/channel assignment to a global type, apply it consistently across cases, services, people, clients, and units as needed.
- Queries for global content should accept `channel` and `language`.
- Prefer membership checks like `$channel in channel` for channel arrays.
- Pages and menus are website-specific and should continue to be scoped by channel and language.

## Local Sanity Debugging Rule

Before changing code for missing local pages, empty Studio lists, null Sanity results, wrong channel output, or local/prod content mismatches, verify environment and dataset first.

Required first checks:

- Confirm the loaded values for `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, and `NEXT_PUBLIC_CHANNEL`.
- Run `npm run doctor:sanity` or `pnpm doctor:sanity` from the repo root.
- Confirm the queried dataset contains the expected pages, homepage, menus, and global documents for the active channel/language.
- Confirm Studio and frontend are using the same project ID, dataset, and API version.
- Only inspect routing, schema, or GROQ code after env and dataset are verified.

Never infer a code bug from `page === null`, empty Studio assigned lists, or missing channel content until the active Sanity dataset has been checked.

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
- For Renaissance changes, run `pnpm build:renaissance` and verify locale-free routing, the CMS and fallback homepage paths, `/sitemap.xml`, `/robots.txt`, and desktop/mobile rendering. Shared platform changes must also preserve the existing 1SP build.
- When changing global Sanity queries, verify at least one page/case/service/person flow for the affected website channel.
