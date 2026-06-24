# MSM channel launch (`msmWeb`)

Operational plan + checklist for standing up the **MSM** site as channel #3,
following the FLZR (Phase 4) pattern. Companion to
[`MULTI_SITE.md`](./MULTI_SITE.md) (which marks MSM as Phase 6).

## Strategy

A channel = its own Next app under `apps/`, pinned via `NEXT_PUBLIC_CHANNEL`,
sharing the single Sanity dataset and `@1sp/*` packages. Content is filtered by
the `channel` array field on each document.

**MSM app is cloned from `apps/flzr-web`** (the proven Phase-4 app — monorepo
packages, locale-free URLs, EN/DE/PL i18n, unified `page.content`), not from the
legacy root 1sp app.

## Already in place (no work needed)

- `SITE_CONFIGS.msmWeb` in `packages/site-config/src/index.ts` — name "MSM",
  locales `en`+`de`, **placeholder** logo/SEO (to be replaced in Phase B).
- `msmWeb` in `websiteChannelOptions` (Studio channel dropdown).
- MSM desk in Studio — `sanity/structure.ts` (`createChannelStructure(... "msmWeb" ...)`),
  language order DE→EN.
- Existing MSM-tagged Sanity content: **1 case** ("Mixed Reality Takes Off with
  Lufthansa", EN only), **9 people**. No pages, no menu, no services/clients/units.

## Phases

| Phase | What | Needs | Status |
|---|---|---|---|
| A | Brand inputs (logo, colors, fonts, SEO, domain) | from stakeholder | ✅ received (logo + palette + dark-first + Aspekta + www.msm.digital) |
| B | Update `SITE_CONFIGS.msmWeb` with real brand/SEO/domain | A | ✅ done (domain + logo; SEO copy still TODO) |
| C | Scaffold `apps/msm-web` (clone flzr-web, retarget to msmWeb) | — | ✅ done — builds green |
| D | Theming (brand tokens, logo, dark-first) | A, C | ✅ done |
| E | Sanity content skeleton (EN+DE pages + menus, unified `content`) | C | ✅ done — published to dev-dataset |
| F | Local verification (`pnpm --filter msm-web dev` smoke test) | C–E | ⏳ build green; live dev smoke pending |
| G | Deploy: Vercel project @ `apps/msm-web`, env vars, domain | F | ⏳ (ops) |

## Brand inputs (Phase A — received)

- **Logo**: `/Users/martin/Desktop/msmlogo.svg` → multi-colour isometric cube mark (square 26×26).
  Placed at `apps/msm-web/public/units/MSM/msm_logo.svg` and `public/ci/msm-logo.svg`.
- **Palette** (from brand swatches): cyan `#03B8D4` (primary), teal `#02A8B2`/`#028FA3`,
  magenta `#D10DAB`, purple `#91198E`, maroon `#8F0031`, red `#D61E45`, orange `#ED4033`, amber `#F5991C`.
  Defined as `--color-msm-*` tokens in `globals.css`; `--color-brand-lime/orange/pink` repointed to MSM.
- **Mode**: dark-first (`dark` class on `<html>`; `--color-msm-paper` dark, `--color-msm-ink` light).
- **Font**: AspektaVF (same as 1SP) — already wired.
- **Domain**: `https://www.msm.digital` → set in `SITE_CONFIGS.msmWeb.domains.production`.

## Phase E — content created (dev-dataset, published)

Pages (channel `msmWeb`, `navbarVariant: dark`, one `sublineComponent` placeholder each):
`msm-page-{home,cases,services,contact}-{en,de}` (8). Home pages have `isHomepage: true`.
Menus: `msm-menu-navbar-{en,de}` (Cases/Services/Contact links). Translation links:
`msm-tmeta-{home,cases,services,contact}` join en↔de in Studio.

### Still open
- [ ] **SEO copy**: `SITE_CONFIGS.msmWeb.seo` still placeholder ("MSM" / "MSM website.") — needs final copy.
- [ ] **Page content**: pages hold placeholder `sublineComponent` text — editors replace with real
      hero / cases-gallery / services-gallery blocks in Studio.
- [ ] **Footer menu** not created (footer shows fallback); add a `Footer` menu per locale when ready.
- [ ] **Live dev smoke test** + Vercel project (Phase G).
- [ ] `apps/msm-web/.env` carries inherited FLZR secrets — rotate/scrub before public commit.

## Phase A — brand inputs required

1. Logo — light + dark SVG → `apps/msm-web/public/ci/`
2. Brand colors — primary/accent (hex or oklch) → replace in `globals.css`
3. Fonts — keep AspektaVF or ship MSM `.woff2`/`.ttf` → `app/fonts/`
4. SEO — real `defaultTitle` + `defaultDescription`, optional GA id
5. What "MSM" stands for (SEO copy / alt text)
6. Production domain → `NEXT_PUBLIC_SITE_URL` + Vercel

## Phase C — scaffold checklist (DONE)

- [x] `rsync` `apps/flzr-web/` → `apps/msm-web/` excluding build artifacts
- [x] `package.json`: `@1sp/flzr-web` → `@1sp/msm-web`
- [x] `vercel.json`: `--filter flzr-web` → `--filter msm-web`
- [x] Token transforms (`flizr`/`flzr`/`Flzr`/`FLZR` → msm family), incl. `@flzr/*` alias → `@msm/*`
- [x] Renamed `FlzrSiteWrapper.tsx`→`MsmSiteWrapper.tsx`, `FlzrPageBuilder.tsx`→`MsmPageBuilder.tsx`
- [x] Renamed asset dir `public/units/FLZR/` → `public/units/MSM/` (logo + cover-image)
- [x] `.env`/`.env.example`: `NEXT_PUBLIC_CHANNEL=msmWeb` (`.env` was inherited+transformed from FLZR)
- [x] Wired `generateStaticParams` locales to channel config (`getSiteConfig(getChannelFromEnv()).locales`)
      — MSM now pre-renders only `/en`+`/de`, not `/pl`. Fixed in page/cases/services/contact.
- [x] `pnpm install` + `pnpm --filter msm-web build` → green (21/21 pages, Lufthansa case renders)

### Phase C — still open (carry into D/E)
- [ ] Resolve `@/lib/*` cross-app reach into the root app (hero-utils, structured-data) — FLZR debt inherited.
- [ ] `apps/msm-web/.env` carries **real secrets inherited from FLZR** (Sanity/SMTP/Clerk/Cloudinary)
      and points at `dev-dataset`. Rotate/scrub before any public commit; set real values per Vercel env.
- [ ] `MsmSiteWrapper.tsx` still has FLZR-derived footer copy ("Independent MSM website shell.") and
      logo path `/units/MSM/msm_logo.svg` — placeholder asset; replace in Phase D.
- [ ] `FrontNavOverlay.tsx` brand-logo branching (`isMsmChannel`) still keyed to the cloned logic — review in D.

## Phase G — deploy

- New Vercel project rooted at `apps/msm-web`; install/build commands per `vercel.json`.
- Env: `NEXT_PUBLIC_CHANNEL=msmWeb` + `NEXT_PUBLIC_SANITY_*` + secrets.
- Domain wiring. `NEXT_PUBLIC_HOST_CHANNEL_MAP` only needed for multi-host deploys.
- Phase 5 webhook fan-out deferred (single webhook revalidates all — harmless).

## Open questions

1. **Lufthansa case** — add DE translation, or launch EN-only?
2. **Page content** — author real MSM copy, or scaffold placeholder blocks for editors?
3. **Globe / 3D units** — MSM has 0 units; keep `SmartUnitsGlobe` or drop from scaffold?

## Notes / risks

- MSM needs **no schema changes** (channel value already exists), so the TypeGen
  path debt in MULTI_SITE.md shouldn't bite.
- Sanity writes (Phase E) are the only irreversible step — create as drafts, publish on review.
