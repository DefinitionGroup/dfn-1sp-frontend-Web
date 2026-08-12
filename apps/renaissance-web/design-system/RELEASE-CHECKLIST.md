# Renaissance Release Checklist

Use this checklist for every new or changed Renaissance page. A page is not complete because it builds; it is complete when the user journey, responsive behavior and system contracts have been verified.

## Content and brand

- [ ] Renaissance is a hero-level signal in the first viewport.
- [ ] The page has one primary user job and one primary conversion.
- [ ] All claims, dates, client names and metrics are approved and sourced.
- [ ] No FLZR violet, 1SP-specific styling or generic default font leaks into Renaissance UI.
- [ ] Real game, person or place imagery is the main visual anchor.
- [ ] Alt text describes meaningful content; decorative repetitions use empty alt text.

## Structure and Pagebuilder

- [ ] Every block is Core or has passed its Conditional gate in `COMPONENTS.md`.
- [ ] Every visible section has one purpose and a semantic heading.
- [ ] Heading order is logical independent of visual size.
- [ ] Every `navPointName` is unique, slug-stable and present in the initial document shell.
- [ ] Invalid or incomplete CTAs render nothing rather than `href="#"`.
- [ ] Empty Sanity data has a deliberate omission/setup/fallback state.

## Interaction and accessibility

- [ ] All actions work with keyboard only.
- [ ] Focus is visible on paper, media, dark and glass surfaces.
- [ ] Modal/overlay states trap focus, support Escape, inert the background and restore trigger focus.
- [ ] Touch targets are at least 44 × 44px; desktop text targets are at least 24 × 24px.
- [ ] Moving content can be paused/stopped and honors `prefers-reduced-motion`.
- [ ] User-triggered carousel/tab changes expose selected/current state.
- [ ] Body text contrast is at least 4.5:1; large text and non-text controls meet their applicable minimums.
- [ ] Page remains understandable at 200% zoom and reflows at 400% without horizontal page scrolling.

## Responsive QA

- [ ] 390 × 844 mobile: no overflow, clipped text or hidden actions.
- [ ] 768 × 1024 tablet: grid and type roles transition intentionally.
- [ ] 1440 × 1000 desktop: composition reads as one system, not disconnected blocks.
- [ ] Short landscape ≤640px high: navigation, hero actions and overlays remain reachable.
- [ ] Mobile services use the compact pattern where cards are non-interactive.
- [ ] Mobile global-reach media is capped and concrete locations are immediately scannable.

## Performance and resilience

- [ ] Hero media is preloaded only when it is the LCP candidate.
- [ ] All non-hero images use responsive optimized sources with explicit `sizes`.
- [ ] Video has poster, muted autoplay where allowed, plays-inline behavior and reduced-motion fallback.
- [ ] WebGL/canvas is progressive enhancement with a static fallback and does not block content.
- [ ] Navigable section shells are not removed by lazy rendering.
- [ ] No layout shift occurs when deferred sections, fonts or media load.
- [ ] Browser console has no errors and all visible media loads.

## Routes, SEO and data

- [ ] Canonical URL and metadata match the Renaissance domain/locale strategy.
- [ ] Sitemap and robots output are verified independently for this app.
- [ ] Homepage, menus, footer and global content all use `renaissanceWeb` and the active language.
- [ ] Studio and frontend use the same project ID, dataset and API version.
- [ ] `pnpm doctor:sanity` has been checked before diagnosing missing content as a renderer issue.
- [ ] Primary contact, legal and company routes return the intended content/state.
- [ ] Consent UI is verified on an authorized preview/production domain; a localhost Cookiebot warning is not accepted as production evidence.

## Required evidence

- [ ] Fresh desktop screenshot: hero and one below-fold proof section.
- [ ] Fresh mobile screenshot: hero, open menu and one dense content section.
- [ ] Keyboard walkthrough: navigation, overlay, carousel/tabs and primary CTA.
- [ ] Reduced-motion walkthrough.
- [ ] Fresh-load deep-link test for every navigation anchor.
- [ ] Renaissance build passes, and platform-level changes also preserve the existing 1SP build.
