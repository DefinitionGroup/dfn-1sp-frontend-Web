# Studio CO2 Phase 3 content — 27 October 2026

Content for `apps/studioco2-web`, written to Sanity project `wu6i3y0h`, dataset `production`, which the live sites share. Approved by Martin on 26–27 October 2026. Safeguards: one revision-guarded write per case, editions appended rather than replaced, a check for open drafts first, a new Cloudinary folder with overwriting off, and a before/after diff of the other sites' queries.

## Media

Seven P5 files were uploaded to Cloudinary `dsu07dnes`, asset folder `1sp/STUDIOCO2/Homepage-v1`, public IDs `studioco2/homepage-v1/*`, with `overwrite=false`. The folder and prefix were empty beforehand.

| Public ID | Source | Used for |
| --- | --- | --- |
| `reel`, `reel-mobile`, `hero-poster` | P5 `public/media/` | Homepage hero |
| `work-halo` (800×500) | P5 `work-04.webp` | Microsoft card, Move capability |
| `work-racing-sim` (800×500) | P5 `work-01.webp` | Logitech \| Anker card |
| `work-dial` (800×500) | P5 `work-03.webp` | Marshall card, Make capability |
| `work-studio` (800×500) | P5 `work-05.webp` | Specimen inline image, Think capability |

P5's Minecraft image (`work-06.webp`) was not uploaded: it is Microsoft work, and each case appears only once in the stack. No larger originals of the P5 stills were found.

## Documents

| Document | Change |
| --- | --- |
| `47689e31-…` Microsoft | `studioco2Web` added; `sector: Gaming`; Studio CO2 edition appended after the MSM edition: P5 "Play, made physical." copy, discipline Experiences, custom media = P5 still + the case's own video |
| `6a089d9d-…` Logitech \| Anker | `studioco2Web` added; `sector: Consumer Electronics`; edition: P5 "Inside the game." copy, Content, P5 still + own video |
| `c63fd10a-…` Marshall | `studioco2Web` added; `sector: Audio`; edition: P5 "Every detail, amplified." copy, Design, P5 still + own video |
| `bde833e7-…` EA | `studioco2Web` added; `sector: Gaming`; edition with discipline Content only (no P5 card exists, so copy and media inherit) |
| `aa740986-…` Lufthansa | `studioco2Web` removed; its 1SP and MSM assignments and MSM edition unchanged |
| `page-studioco2-home-en` | New Studio CO2 homepage: hero, specimen, capabilities, cases stack (Microsoft, Logitech \| Anker, Marshall, EA) |
| `site-settings-studioco2Web-en` | New: contact details from P5, membership label `proud member of` |

Each case was patched to a draft created from its checked published revision, inspected, then published with the draft revision as a guard. The homepage and Site Settings were created as drafts and published the same way. No drafts or release versions existed beforehand.

Backup of the five cases as published before the change: `EXPORT/studioco2-phase3/before-2026-10-27T00-06-12-251Z.json` (local, gitignored, mode 600).

## Verification

- Between full published snapshots taken before and after, only the seven documents above changed (884 → 886 documents; contact submissions excluded).
- All 41 shared and app-local queries were run for `1spWeb`, `msmWeb`, `flizrWeb` and `renaissanceWeb` in English and German, for every page and case slug (5,936 evaluations with groq-js). The only result that changed was the cross-site case slug list, which the 1SP case routes and sitemap and the FLZR sitemap filter by their own channel. Each site's own case set is unchanged (1SP 21, MSM 98, FLZR 36, Renaissance 66). Run for `studioco2Web`, the same diff found 10 changed result sets, so it does detect changes.
- Side effect: `_updatedAt` moved for the five cases, so their 1SP sitemap `lastModified` dates (and two MSM cases' timestamps) show 27 October 2026.
- Local dev server against production: CMS homepage, cards in stack order linking to case pages, filter dock with three disciplines and three sectors (Audio → 1 case), case pages with Studio CO2 copy, discipline, sector and video, next case in stack order, Lufthansa 404, contact from Site Settings.
- The test site's homepage refreshed on its own (1h ISR). Its new case pages returned Vercel's static 404 because the `[locale]` layout set `dynamicParams = false`. Fixed in the app layout. A local production build now marks the case and page routes `fallback: null` and renders cases that were not prerendered.

## Open

- The live Studio (`main`) does not have the Phase 2 schema yet. Editors there see unknown-field warnings for `sector`, `discipline`, the Studio CO2 blocks and `studioco2Contact`; removing those fields would delete Studio CO2 data only.
- EA has no Studio CO2 card copy or still. Discipline choices for EA (Content) and Logitech | Anker (Content, from P5's racing-sim card) are editorial defaults.
- P5 stills are 800×500; they serve as video posters on case pages.
