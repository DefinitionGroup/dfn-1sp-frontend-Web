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

## Current state

- **Phase 1, static parity.** The homepage renders [homepageFallback.ts](data/homepageFallback.ts): P5's copy, archive imagery and editorial project proposals. Sanity pages, menus and site settings for `studioco2Web` come next.
- **Reel.** `public/media/reel.mp4` and `reel-mobile.mp4` are gitignored. Copy them from the prototype's `public/media/` for local work; they move to Cloudinary with the CMS content. Without them the hero shows its poster.
- **Effects drawer.** Public visitors get the defaults in [effects.ts](lib/effects.ts). The drawer and saved settings appear in development, or for the session after opening any URL with `?fx`. Theme and Pause are always available.
- **Indexing.** Pages send `noindex` until site-config names a production domain ([deployment.ts](lib/deployment.ts)).

## Structure

- [SiteProvider](components/SiteProvider.tsx): theme, Pause/reduced motion, effects and dialogs, shared through `useSite()`.
- Sections: [Hero](components/Hero.tsx), [Specimen](components/Specimen.tsx), [WorkSection](components/WorkSection.tsx) (gallery and sentence filter dock), [SiteFooter](components/SiteFooter.tsx).
- [globals.css](app/globals.css): P5's `styles.css` followed by `digital.css`, unchanged apart from fonts loaded through `next/font`.

The visual contract is the prototype's `DESIGN.md` until it moves beside this app.
