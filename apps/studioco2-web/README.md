# Studio CO2 Web

Independent frontend for `studioco2Web`, adapted from the P5 prototype (`1sp-studioco2-proto/p5`). English only; public URLs are locale-free and rewritten to the internal `/en` route. [Site-config](../../packages/site-config/src/index.ts) is authoritative for channel, locale and SEO defaults.

## Run locally

From the repository root:

```sh
pnpm dev:studioco2
pnpm build:studioco2
pnpm start:studioco2
```

Local frontend: `http://localhost:3004`. Copy `.env.example` to `.env.local`; root environment files do not configure this app.

## Content model

Studio CO2 pages use their own page-builder blocks (schema in `packages/sanity-schema/src/STUDIOCO2/`); each is valid only on `studioco2Web` pages:

| Block | Section |
| --- | --- |
| `studioco2Hero` | Reel, headline, copy, primary action, reel player and optional full-film link |
| `studioco2Specimen` | Statement headline with weight slider and optional inline image |
| `studioco2Capabilities` | Think / Make / Move panels; directly after a specimen they share its section |
| `studioco2CasesStack` | Selected work as stacked `studioco2CaseStackCard` references, plus the filter dock |

Cards reference shared cases. Title, summary and media come from the case's Studio CO2 website version; the dock filters by that version's **discipline** (Experiences, Content, Design) and the case's shared **sector**. Case pages (`/cases/[slug]`) render the shared case body blocks `challengeAndSolution`, `approachSection` and `resultsMetrics`. Footer contact details come from Site Settings → Contact.

Queries live in [lib/queries.ts](lib/queries.ts), not in the shared page queries. Draft mode (`/api/draft-mode/enable`), visual editing and the Studio's "Studio CO2 Preview" are wired; `/api/revalidate` accepts signed publish notifications.

## Current state

- **CMS content.** The published homepage is `page-studioco2-home-en` and contact comes from `site-settings-studioco2Web-en`. Four cases are assigned to Studio CO2 (Microsoft, Logitech | Anker, Marshall, EA). The first three carry P5's card title, summary and still in their Studio CO2 version and keep the case's own video; EA uses its shared copy and media. P5's media is in Cloudinary under `1sp/STUDIOCO2/Homepage-v1`. See the [Phase 3 record](../../docs/records/project/studioco2-phase3-content-2026-10-27.md).
- **Fallback.** If the homepage is unpublished or empty, or its query fails, [homepageFallback.ts](data/homepageFallback.ts) renders P5's copy, archive imagery and editorial project proposals in the same block shapes. Contact falls back the same way when Site Settings has no email. The fallback's `public/media/reel.mp4` and `reel-mobile.mp4` are gitignored; copy them from the prototype's `public/media/` for local work.
- **New slugs render on demand.** Cases and pages published after a deploy render on first request (1h ISR). Keep `dynamicParams` off the `[locale]` layout; it would turn them into static 404s on Vercel.
- **Effects drawer.** Public visitors get the defaults in [effects.ts](lib/effects.ts). The drawer and saved settings appear in development, or for the session after opening any URL with `?fx`. Theme and Pause are always available.
- **Indexing.** Pages send `noindex` until site-config names a production domain ([deployment.ts](lib/deployment.ts)).
- **Navigation** is code-owned (Work, Studio, Get in touch) because navbar menus cannot hold section anchors.

## Structure

- [SiteProvider](components/SiteProvider.tsx): theme, Pause/reduced motion, effects and dialogs, shared through `useSite()`.
- [Studioco2PageBuilder](components/Studioco2PageBuilder.tsx) maps blocks through [lib/content.ts](lib/content.ts) adapters to the sections: [Hero](components/Hero.tsx), [Specimen](components/Specimen.tsx), [Capabilities](components/Capabilities.tsx), [WorkSection](components/WorkSection.tsx). [SiteHeader](components/SiteHeader.tsx) and [SiteFooter](components/SiteFooter.tsx) frame every page; [CaseBody](components/CaseBody.tsx) renders case pages.
- [globals.css](app/globals.css): P5's `styles.css` followed by `digital.css`, then the page-header and case-page additions.

The visual contract is the prototype's `DESIGN.md` until it moves beside this app.
