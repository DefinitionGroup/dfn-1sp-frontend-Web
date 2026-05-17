# Multisite Platform Plan

## Goal

Build FLZR as an independent production-grade frontend while keeping the current live 1SP website stable. The same platform should later support MSM, Studio CO2, and additional websites from one Sanity CMS.

## Current Decision

Use one repository and one Sanity platform, with separate frontend apps per website.

Target direction:

```txt
apps/
  flzr-web/
  msm-web/
  studioco2-web/
  1sp-web/          # migrate later, not first

packages/
  site-config/
  sanity-queries/
  case-components/
  tracking/
  ui/
```

The existing 1SP app should stay in place until the FLZR architecture is proven.

## Content Ownership Model

Website-specific:

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
- domains
- locale strategy

Global reusable content:

- cases
- services
- people
- clients
- units and shared assets

Global content is selected per website through channel or website assignment and filtered by language.

Example query pattern:

```groq
*[_type == "caseStudy" && $channel in channel && language == $language]
*[_type == "services" && $channel in channel && language == $language]
*[_type == "person" && $channel in channel && language == $language]
```

## Website Channels

Initial channels:

- `1spWeb`
- `flizrWeb`
- `msmWeb`
- `studioco2Web`

Long-term, the platform should avoid repeating this list manually in many files. A central site config, and possibly a Sanity `website` document, should become the source of truth.

## Non-Breaking Rules For 1SP

- Keep current 1SP app structure and deployment behavior intact during FLZR foundation work.
- Do not change 1SP middleware, public URLs, canonical URLs, sitemap, or robots behavior as part of the first FLZR milestone.
- Keep current `channel` fields and existing 1SP queries working.
- Add fields and query helpers before replacing existing fields.
- Verify 1SP build separately from FLZR before merging.

## Recommended Implementation Phases

### Phase 1: Foundation, Additive Only

- Add this plan and repo operating rules.
- Confirm global content channel support for cases, services, and people.
- Add missing `flizrWeb` options where needed.
- Add or prepare service channel assignment if services are not yet website-selectable.
- Add central site config for current channels.
- Keep existing 1SP frontend untouched except for shared config imports if needed.

Acceptance criteria:

- 1SP still builds and uses its current routes.
- Sanity can assign FLZR to all global content types required for launch.
- FLZR platform work has a documented source of truth.

### Phase 2: FLZR App Shell

- Add an isolated FLZR frontend app shell.
- Configure FLZR routes and language support for `en`, `de`, and `pl`.
- Add FLZR layout, navigation, footer, theme, fonts, SEO defaults, sitemap, robots, and tracking placeholders.
- Add a FLZR page-builder registry.
- Fetch FLZR pages and menus from `flizrWeb`.

Acceptance criteria:

- FLZR app can render at least homepage and one dynamic page from Sanity.
- FLZR has independent metadata, sitemap, robots, and layout.
- 1SP app behavior remains unchanged.

### Phase 3: Global Content Reuse

- Add shared query helpers for cases, services, people, and clients.
- Build FLZR listings for global content filtered by `flizrWeb` and language.
- Reuse case data contracts from 1SP where possible.
- Allow case page markup/styling to differ per website without changing global content structure.

Acceptance criteria:

- FLZR can display only assigned global content.
- No duplicated case/service/person documents are required for FLZR.
- Shared case logic is isolated from 1SP-specific presentation.

### Phase 4: Deployment

- Create a separate Vercel project for FLZR.
- Point it at the FLZR app root.
- Configure separate environment variables.
- Attach the FLZR domain.
- Configure FLZR tracking independently.
- Run production-like preview verification.

Acceptance criteria:

- FLZR deploys independently.
- 1SP deployment remains independent.
- FLZR canonical URLs, hreflang, sitemap, and robots are correct for its domain.

### Phase 5: MSM / Studio CO2 / 1SP Migration

- Use FLZR as the proven pattern.
- Scaffold MSM and Studio CO2 app shells using the same site config and global content rules.
- Migrate 1SP into `apps/1sp-web` only after the platform shape is stable and preview-verified.

Acceptance criteria:

- New website app setup is repeatable.
- Shared packages reduce duplication without forcing identical design.
- 1SP migration is deliberate, previewed, and reversible before production cutover.

## First Engineering Step

Start with an additive audit and patch:

1. Confirm current channel fields for `caseStudy`, `services`, `person`, `client`, and `unit`.
2. Add `flizrWeb` where the schema is missing it.
3. Add website/channel selection to services if missing.
4. Add a small `site-config` module with current website keys, languages, and placeholders.
5. Update query helpers to support FLZR without changing existing 1SP behavior.

This should be a small foundation change, not a frontend redesign.

## Open Questions

- Should services use the existing `channel` array naming, or a future `websites` reference field?
- Should a Sanity `website` document become the long-term source of truth for domains, languages, and tracking?
- Should FLZR use locale-prefixed public URLs or locale-free default-language URLs with localized alternates?
- Which tracking systems are required per website at launch?
- Which case page components are shared logic only, and which are shared markup?
