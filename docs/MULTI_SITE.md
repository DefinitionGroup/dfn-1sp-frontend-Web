# Multi-site contract

This codebase is being prepared to power multiple websites from a single Sanity
backend, each deployed to its own Vercel project. This document captures the
**Phase 0** state — what is configurable per deployment today, and the rules
that future PRs must follow so the architecture stays multi-site-clean.

For the long-form rationale and full roadmap (Phases 0–6), see the chat
discussion that produced this document. This file is the working contract.

## Channels

The Sanity dataset stores per-channel content. Known channels:

| Channel        | Default brand        |
|----------------|----------------------|
| `1spWeb`       | 1SP                  |
| `msmWeb`       | MSM                  |
| `studioco2Web` | Studio CO2           |
| `flizrWeb`     | Flizr                |

Channel values live in `lib/site-config.ts` (`KNOWN_CHANNELS`). Add new
channels there first — type-safety in the rest of the codebase keys off this
list.

## Resolving the active channel

A deployment knows which channel it serves through three mechanisms, in this
order of precedence:

1. **`NEXT_PUBLIC_CHANNEL` env var** — primary mechanism for
   one-deployment-per-brand setups. Set this in each Vercel project.
2. **`channel` cookie** — written by middleware when
   `NEXT_PUBLIC_HOST_CHANNEL_MAP` is configured (multi-host deployments), or
   set manually for local development.
3. **`DEFAULT_CHANNEL`** (`1spWeb`) — fallback so the historical 1SP behavior
   is preserved when no env or cookie is set.

### Use the right helper for the context

| Context                                  | Helper                                | Module                    |
|------------------------------------------|---------------------------------------|---------------------------|
| Server component, route handler          | `await getChannel()`                  | `@/lib/server-channel`    |
| `generateStaticParams`, build-time, edge | `getChannelFromEnv()`                 | `@/lib/site-config`       |
| Middleware                               | `resolveChannelFromHost(host)`        | `@/lib/site-config`       |

**Never** read `process.env.NEXT_PUBLIC_CHANNEL` directly in feature code —
go through the helpers so behavior stays consistent.

## Per-deployment env vars

All defaults preserve current 1SP behavior. Override per Vercel project:

| Variable                              | Purpose                                                | Default                                 |
|---------------------------------------|--------------------------------------------------------|-----------------------------------------|
| `NEXT_PUBLIC_CHANNEL`                 | Pin this deployment to a Sanity channel                | _(unset → falls through to cookie)_     |
| `NEXT_PUBLIC_HOST_CHANNEL_MAP`        | Comma-separated `host:channel` pairs for multi-host    | _(empty → middleware is pass-through)_  |
| `NEXT_PUBLIC_SITE_NAME`               | Brand name in metadata + Open Graph                    | `1SP Agency`                            |
| `NEXT_PUBLIC_SITE_SHORT_NAME`         | Short brand name in nav UI                             | `1SP`                                   |
| `NEXT_PUBLIC_SITE_DESCRIPTION`        | Default meta description                               | _(1SP description)_                     |
| `NEXT_PUBLIC_SITE_DEFAULT_TITLE`      | Root `<title>`                                         | `1SP Agency \| People-Powered Brand Engagement` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`       | Google Analytics ID (empty disables GA)                | `G-JTERFZC7J4`                          |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`| Search Console verification token                      | _(1SP token)_                           |
| `NEXT_PUBLIC_LOGO_LIGHT`              | Logo path used on dark backgrounds                     | `/ci/1sp-fulllogotype.svg`              |
| `NEXT_PUBLIC_LOGO_DARK`               | Logo path used on light backgrounds                    | `/ci/1sp-fulllogotype-blk.svg`          |
| `NEXT_PUBLIC_LOGO_ALT`                | Logo `alt` text                                        | `1SP Logo`                              |
| `NEXT_PUBLIC_SITE_URL`                | Canonical site URL (existing; used by sitemap & OG)    | `https://www.1sp.agency`                |

Per-site assets that editors should be able to change without a redeploy
(localized contact info, social URLs, locations) belong in Sanity, not in env
vars. Phase 1 will introduce a `siteSettings` channel-scoped document for
this.

### Example: deploying site #2

In the Vercel project for the second brand:

```
NEXT_PUBLIC_CHANNEL=msmWeb
NEXT_PUBLIC_SITE_NAME=MSM
NEXT_PUBLIC_SITE_SHORT_NAME=MSM
NEXT_PUBLIC_SITE_DESCRIPTION="..."
NEXT_PUBLIC_SITE_DEFAULT_TITLE="MSM | ..."
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_LOGO_LIGHT=/ci/msm-logo.svg
NEXT_PUBLIC_LOGO_DARK=/ci/msm-logo-dark.svg
NEXT_PUBLIC_SITE_URL=https://www.msm-agency.com
```

The logo files need to exist in `public/ci/`. Until logos move to Sanity (see
Phase 1), each site's logo SVGs must be committed to the repo.

## Multi-host deployments (optional)

For preview/staging environments that serve multiple brands from one Next.js
app, set:

```
NEXT_PUBLIC_HOST_CHANNEL_MAP="msm.staging.example:msmWeb,studioco2.staging.example:studioco2Web"
```

Middleware then writes the `channel` cookie based on the incoming Host
header. Production sites should prefer separate deployments and skip the host
map.

## Rules for new code

1. **Never hardcode a channel string.** Always go through `getChannel()` or
   `getChannelFromEnv()`. The audit will fail PRs that introduce new
   `"1spWeb"` / `"msmWeb"` literals outside `lib/site-config.ts` and
   `KNOWN_CHANNELS`.
2. **Never hardcode brand strings** (site name, GA ID, logo paths, default
   description) in components. Use `SITE_BRAND` from `lib/site-config.ts`.
3. **Filter Sanity queries by channel** when fetching channel-scoped content
   (pages, menus). The existing `$channel` parameter pattern in
   `sanity/lib/queries.ts` is the contract.
4. **Static generation must filter by the active channel.**
   `generateStaticParams` should call `getChannelFromEnv()` and pass it to
   slug-listing helpers.
5. **API routes** that accept a `channel` should default to
   `getChannelFromEnv()`, not a literal.

## Known Phase-0 debt (intentional)

These are tolerated in Phase 0 because removing them requires schema or
component changes that belong to later phases:

- **Per-channel content arrays on `page.ts`** (`content1sp`, `contentMSM`,
  `contentStudioCO2`, `contentStudioFlizr`). Refactored in **Phase 1**.
- **Component prop defaults of `channel = "1spWeb"`** in `SiteWrapper`,
  `ContactForm`, `FrontNavOverlay`, smart-data components, server block
  wrappers. Callers now always pass an explicit channel; the defaults are
  legacy fallbacks. Removed when callers are audited as exhaustive.
- **`PageBuilder` is a static switch.** Refactored to a registry in
  **Phase 2** for true per-site component swapping.
- **`getSmartPeople` channel union type** still hardcodes three channels.
  Will use the `Channel` type from `site-config` in Phase 1.
- **`INTERACTIVE_CAROUSEL_FIELD_MAP` in `lib/sanity/queries.ts`** still falls
  back to `"1spWeb"` for unknown channels. Fine until Phase 1 schema cleanup.

## Phase 0 changes (this commit's scope)

- Added `lib/site-config.ts` (pure) and `lib/server-channel.ts` (server-only).
- Replaced literal `"1spWeb"` in all page routes and API route defaults.
- Wired `app/layout.tsx` metadata + GA ID through `SITE_BRAND`.
- `middleware.ts` resolves channel from host when
  `NEXT_PUBLIC_HOST_CHANNEL_MAP` is set; no-op pass-through otherwise.
- `getAllPageSlugs` and `getAllPageSitemapSlugs` filter by active channel.
- Mobile menu (`HamburgerGradientMenu`) logo paths from `SITE_BRAND`.
