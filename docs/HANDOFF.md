# Whole-project handoff

Reviewed 21 September 2026 against the local checkout; **updated 4 October 2026** with the 21 commits since then, a side-effect review of each and a read-only check of content in the `production` dataset, currently used as staging. This is the entry point for the **entire 1SP multisite platform**, not only service consolidation. Use [the documentation index](README.md) for task-specific guides, [the feature map](PROJECT_FEATURES.md) for implementation locations, and [operations](PROJECT_OPERATIONS.md) for previews, data changes and verification.

The subsequent [MSM implementation and legal-copy review](records/msm/msm-fixes-seo-and-legal-review-2026-10-04.md) records uncommitted fixes, metadata fields, successful builds and the authorized staging CMS mutation. The resolved findings below refer to that follow-up; remaining risks still need their own checks.

## Establish the current state

1. Read [AGENTS.md](../AGENTS.md), this handoff and the target app's design guide when changing its frontend. Several app design guides are now partly stale. See [stale documentation](#stale-documentation-found-4-october).
2. Inspect `git status`, branch and HEAD. At the 4 October update:
   - The worktree is on `multiseite/stage` at HEAD `c0364fc992671fd580c0f39ac9b57f29561a240f`, level with the reviewed `origin/multiseite/stage`. The documentation review and subsequent MSM fixes are uncommitted.
   - The uncommitted work recorded on 21 September (MSM carousel and case motion, the shared membership button, schema wiring, documentation) was committed in `3d2fe05b5`.
   - `origin/main`, the live 1SP site, is `daca0aa48` plus the two Personio hotfix PRs (#140, #141). Stage is 64 commits ahead of `main`. The 4 commits on `main` that stage lacks are patch-equivalent to `34adb3776` and `c0364fc99`, plus their merge commits.
3. Identify the app, channel, language, dataset and published/draft perspective. Verify environment and content with [local Sanity diagnostics](local-sanity-debugging.md) before diagnosing missing content.
4. Find the relevant renderer, schema, query and current editing owner using [the feature map](PROJECT_FEATURES.md). Read dated records only for evidence and rationale.
5. Before publishing or releasing, establish the requested scope and current provider state using [deployment verification](DEPLOYMENT.md). Old approvals recorded in archived runbooks are historical.

Orientation is complete when the target environment, current worktree, content ownership and affected consumers are known. The documentation review itself changed only docs; the subsequent MSM implementation changed code/schema and scoped staging content, as recorded above.

## Platform at a glance

| Website | Runtime | Local port | Channel | Configured locales |
| --- | --- | --- | --- | --- |
| 1SP and embedded Sanity Studio | Root Next.js app | 3000 | `1spWeb` | EN |
| FLZR | `apps/flzr-web` | 3001 | `flizrWeb` | EN, DE, PL |
| MSM | `apps/msm-web` | 3002 | `msmWeb` | EN, DE |
| Renaissance | `apps/renaissance-web` | 3003 | `renaissanceWeb` | EN |
| Studio CO2 | Configuration only; no independent app | — | `studioco2Web` | EN, DE |

Configured locales do not establish translated content completeness. Commands are maintained in [the root README](../README.md); versions in [package.json](../package.json), [the lockfile](../pnpm-lock.yaml) and [.nvmrc](../.nvmrc).

Current stack: pnpm 10 workspace on Node 22, Next.js 16.2 App Router, React 19.2, Sanity 6 with next-sanity 13, Motion React 12 and Cloudinary. Three.js/R3F powers the globe and other parts of the frontend.

The root 1SP app is the established production baseline. Preserve its routing, SEO and deployment behavior when changing shared code. Each newer app owns its shell, routing, theme, page composition and renderer. Shared packages own site configuration, schema, queries, types and utilities. Some app components and API implementations are copied, and some still depend on root modules. For example, root `components/onesp-group`, `components/menu/footerExternalBanner*` and `components/ui/OneSpMembershipButton` render inside the nested apps. Independent app roots do not imply complete code isolation.

### Branches, deployments and datasets

| Item | State on 4 October | Consequence |
| --- | --- | --- |
| `main` | Live 1SP site. Also serves the embedded `/studio` with **main's schema** | Studio opened from the live site lacks every schema added on stage (see [open issues](#side-effects-and-open-issues-found-4-october)) |
| `multiseite/stage` | Integration branch for all four apps; all September work lives here | Git-connected FLZR, MSM and Renaissance projects deploy previews only; nothing beyond 1SP has been promoted |
| Beta tier | `DEPLOYMENT_TIER=beta` added in `ff62c213a`. The 22 September setup notes describe CLI-deployed `1sp-beta`, `flzr-beta`, `msm-beta` and `renaissance-beta` projects on the production dataset | Noindex, robots disallow, `X-Robots-Tag`, no Cookiebot. Provider state was not re-verified in this update |
| Live dataset | Live 1SP currently reads `wu6i3y0h/dev-dataset`; the deployment was switched back | Publishing content in `dev-dataset` can affect live 1SP through its normal cache/revalidation paths |
| Staging dataset | Every local app loads `wu6i3y0h/production`. Despite its name, `production` is currently the staging ground and is intended to become the live dataset later | Publishing here affects apps configured to read `production`, not the current live 1SP deployment. The future dataset switch is a separate release step |
| Hosted Studio | One Studio application registered (2026-07-13). No schema deployed to the Content Lake | Schema state is whatever Studio bundle the editor opens |

The dataset roles above were confirmed by the user on 4 October after switching back. The public 1SP JavaScript bundle also identifies `dev-dataset`. The content inventory below concerns staging `production`; it does not establish the content or drafts currently in live `dev-dataset`.

## Content and editorial ownership

**Keep Globals.** Cases, services, people, clients and global units are reusable identities, filtered by channel and language. Assignment makes an item available to a website; it does not create a separate copy. Pages, menus and settings belong to a website. MSM's `msmUnit` is a separate site-owned model, not the global `unit` type.

- Pages store blocks in unified `content[]`. App-specific builders render those blocks. The Studio help text on `page.content` still mentions legacy per-channel page arrays ([page.ts](../packages/sanity-schema/src/page.ts), around line 153). That text is stale; those fields are no longer in the page schema.
- Cases retain root and website-edition `casesPageBuilder[]`. A later storage change is deferred. Website editions support intentional copy/media/body differences while retaining the shared case identity.
- Case edition “Start from shared content” creates a snapshot, not ongoing synchronization. “Use shared content” removes custom overrides. Custom body/media replace the corresponding shared selection, including intentional empty selections. Publishing the document publishes **all its editions**.
- **People: per-website image (new, `1ab926dc9`).** A person's website edition has an optional *Website image*. Queries resolve `coalesce(siteContent[channel == $channel][0].image, image)`.
  - Use the override instead of changing the shared `image` of anyone assigned to more than one channel. In staging `production`, Ron Draudt has an FLZR image.
  - The 4 October follow-up adds coverage to Renaissance portraits, MSM unit leadership and MSM profiles. Renaissance still prioritizes an explicit local portrait image.
- **Units: footer banner logo (new, `87eac2b0f`).** `footerBannerLogo` supplies a uniform white mark for the 1SP network banner. The banner falls back to `logo`, then `logoColor`. In staging `production`, 10 of 12 units have it; *1SP Agency* and *MSM German* do not.
- Services have different consumers across the sites. [Service content](SERVICE_CONTENT.md) is the editing contract; [the service consolidation handoff](SERVICE_CONTENT_HANDOFF.md) is the proposed work queue. A service reference does not automatically replace page-builder narrative copy.
- Renaissance client collections, portrait and award compositions have site-owned contracts. Do not move or delete Globals merely because one site needs its own display identity; see [shared content](../apps/renaissance-web/docs/shared-content.md).
- Translation uses separate language documents with translation metadata. Configured languages and translation guidelines are implemented foundations; automatic translation/provider rollout is not established by those fields.
- `siteSettings.oneSpMembershipLabel` is still required in Studio and described as a navbar label. Since 25 September only MSM renders it. FLZR and Renaissance use a hardcoded **1SP AGENCY** pill instead.

Approved rewrite copy takes editorial precedence for the scoped migrations. Preserve source mappings and intentional differences. Do not globally overwrite shared fields to resolve a single website's copy discrepancy.

## Site-specific behavior to preserve

### 1SP

The root app also hosts Studio at `/studio`. Its public routes are locale-free, internally rewritten to English; locale-prefixed URLs redirect to clean paths. Optional host-to-channel cookie behavior exists, but per-app deployment configuration remains important. Shared component groups, global galleries, forms, jobs, tracking and compatibility modules have consumers outside the root app.

`main` has only the Personio hotfixes from the September work. Merging stage would bring these shared changes to the live site:

- **Footer banner:** a new 5-column intro grid, the logo at 77% width, an optional headline and per-unit `footerBannerLogo`. No 1SP banner was found in staging `production`; verify live `dev-dataset` before concluding that merging has no visible effect.
- **OneSpScope:** headings inside embedded groups are forced white. No 1SP page in staging `production` embeds a group; live `dev-dataset` was not inventoried here.
- **People:** the per-website image coalesce in team, case-contact and smart-people queries.

`Button2` changes are opt-in (`eyebrow`, `minimenu`) and leave existing 1SP buttons unchanged.

### FLZR

FLZR has its own builder, navigation, visual language and localized routing. Legacy route aliases still matter for inbound links. Service destinations currently use a frontend map: seven service pages and an AI Solutions modal, with long page narratives separate from global service descriptions. Global descriptions also feed structured data. Case categories are a code-owned ID map, independent of service relationships. Do not confuse category filters with CMS channel assignment.

Since 22 September:

- **Navigation:** the green membership button was replaced by a detached black **1SP AGENCY** pill linking to `https://1sp.agency` in a new tab. It stays pinned when the nav idle-hides and sits above the mobile menu. An “A 1SP Agency” line sits under the logo.
- **Cinematic 3 Cards Reveal** (`cinematicBlock3CardsReveal`, FLZR only): a pinned scroll scene from 900×680 up when motion is allowed; normal flow on phones, short viewports and reduced motion. Card and outro links are dereferenced in the page, home and group queries. Used on EN `home` and `agency`.
- **Hero:** `oneSPHeader.headlineBackground` puts violet boxes behind headline lines in `headlineReveal` mode. A missing value counts as **on**, so the existing `headlineReveal` headers on 17 FLZR pages show it without the field being set in Studio.
- **Footer:** simplified to Services (two columns), About us and Legal, with hardcoded EN/DE/PL copy. The previous footer is kept unused in `components/menu/footer-backup-full.tsx`. Removed: the “Start a project” link, logo, DEKRA ISO 27001 badge, statement, Cases and Locations columns. The 1SP footer banner still renders after the footer.
- **Case hero:** an inset rounded frame. Portrait stills take the right-half slot.
- **Case media script:** `scripts/flzr-case-media.ts` replaced stand-in hero media on 31 published EN cases on 22 September; the local `EXPORT/` verification file is not committed. Its later `RETIRE_OWN_VIDEO` step was only dry-run, so Sony, Bose and O2 still have their videos.

English content migration evidence is recorded; this is not a claim that every configured language is migrated or launch-ready. The [conversion plan](FLZR_CONVERSION_PLAN.md) remains proposed and covers **two separate journeys: client enquiries and recruitment**. Its footer and membership-button assumptions are now out of date.

### MSM

The homepage is the visual reference for angular framing, badges, selection sequencing and motion. Preserve the site-owned dark case treatment and block composition.

- **Hero:** authored headlines (`headlineReveal`, used on both homepages) now flicker in word by word (`FlickerWords`). The eyebrow decrypts afterwards and the selection frames dismiss.
- **Decrypt effect:** rotating words keep the `@sacred` `DecryptRotator` decrypt effect.
- **Preview controls:** annotations must be cleaned from control values so drafts choose the same renderer/animation as published content. The uncommitted follow-up adds the previously missing `paddingBottom`.
- **SEO:** the follow-up centralizes metadata, adds editable social overrides and noindex, honors preview guards and uses existing Cloudinary stills. MSM JSON-LD now owns its brand and localized routes. See the [verification record](records/msm/msm-fixes-seo-and-legal-review-2026-10-04.md).

MSM Units own references to cases and people; follow [the relationship decision](../apps/msm-web/docs/adr/0001-unit-owned-shared-content-attribution.md). The Services directory, service carousel, global service editions and service pages are separate consumers, with the duplication documented in the service audit.

Committed since the review (no longer dirty-worktree work):

- **Interactive service carousel** (`interactiveServiceCarousel`): drag, wheel and autoplay; resolved on the server. Used on EN `services` only.
- **Media Feature** (`msmMediaFeature`): background video with brightness control and one MosaicButton CTA. Used on EN and DE homepages.
- **Globe:** the redesign and optional MSM CTA remain available. The requested 4 October staging patch removed the globe block from both EN/DE homepages.
- **Case gallery:** page size is three times the responsive column count, with a minimum of six items; four columns from 1280px. On a single-column phone this means six rows. This also applies to people and unit pages.
- **Case pages:** `CaseReveal` in-view reveals, no minimap, unit logos forced white on the powered-by band.
- **Case tiles:** no services line.
- **Typography:** headlines are now AspektaVF **400** via `--msm-headline-weight`; body copy is 300. `DESIGN.md` still says 500.
- **Footer banner:** the shared 1SP banner renders after the MSM footer (EN and DE footer menus).
- **Content scripts:** `scripts/msm-service-carousel.mjs` and `scripts/msm-home-carousel-order.ts` were applied to EN pages. Neither run is recorded under `records/`. The German pages differ: the DE homepage has no smart carousel or people gallery, and the DE services page has no service carousel or closing Intertitle CTA.

### Renaissance

Preserve petrol/teal/sand styling, site-owned typography and the [design system](../apps/renaissance-web/design-system/README.md). English public URLs are locale-free; explicit English prefixes redirect and unsupported locale prefixes redirect to the homepage.

The homepage is CMS-first with an intentional authored fallback if the expected published page/content is absent. Check the dataset before editing the fallback. Section roles, anchors and navigation targets must remain aligned. Six services are backed by Globals. The case carousel is site-owned; Results use explanatory groups and count-up metrics, and Renaissance case pages omit the Powered by composition while retaining shared relationships.

Since 23 September:

- **Navigation:** the supplied full SVG lockup (`public/logos/renaissance-lockup.svg`: tagline, wordmark, “A 1SP Agency”) replaces the masked wordmark. A detached black **1SP AGENCY** pill (copied from FLZR) replaces the membership button, including in the mobile menu. At 320px the logo, MENU and pill fit without horizontal scroll but touch.
- **Client logos:** a responsive grid of three rows, up to six columns (three on mobile). It is static with six or fewer logos and never duplicates a logo. Marks are 50% larger (28px mobile, 60px desktop). The band background is now white.
- **Embedded 1SP groups:** Aspekta loads without preload, so groups keep the 1SP face.
- **Revalidation:** `[slug]` pages declare `revalidate = 60`, matching home, listings and case pages. `sanityFetch` already defaulted to 60 seconds.

A `newsCTABlock` renderer exists for temporal items; availability in the registry does not imply that a particular homepage currently contains it. Client logos and awards are separate composition concerns. The configured Renaissance deployment URL is a preview; no production domain is configured in site-config.

### Shared integrations

- **Personio:** `34adb3776` and `c0364fc99`, also on `main`. Personio's v2 jobs endpoint now answers 403 “Insufficient scopes”. All four route copies fall back to the XML feed on **any** v2 failure when a feed is configured, and log the reason.
- **Personio side effect:** genuine credential errors are now visible only as warnings. A jobs cache miss attempts v2 before the configured XML fallback; authentication can use a direct token or cached OAuth token. The route still returns 500 without usable credentials, even when an XML feed exists.
- **Jobs block:** unit logos load independently of jobs. The root job-card fallback logo is now `/ci/1sp-fulllogotype-blk.svg`, which exists in all four `public/` directories.

## Changes since the 21 September review

| Date | Commit | Area | Change |
| --- | --- | --- | --- |
| 22 Sep | `3d2fe05b5` | MSM, shared, docs | MSM footer banner and Media Feature, case gallery pagination, service carousel, CaseReveal, `OneSpMembershipButton` + `Button2` minimenu, banner headline, documentation consolidation |
| 22 Sep | `894276672` | FLZR, shared, MSM | Cinematic 3 Cards Reveal, slim FLZR footer, Intertitle CTA `paddingBottom` (FLZR, MSM and Renaissance honour both paddings), MSM tiles without services line |
| 22 Sep | `e19b1a067` | Queries | Dereference cinematic card/outro links |
| 22 Sep | `ff62c213a` | Deployment | `beta` deployment tier and tests |
| 23 Sep | `1eb507401` | MSM | FlickerWords hero, badge frame dismissal, body weight 300, minimap removed, home carousel script |
| 23 Sep | `e84a0cdf5` | FLZR | Inset case hero, portrait stills, case-media script |
| 23 Sep | `328a434cf` | Renaissance, shared | Client logo grid, Aspekta for groups, white headings in `OneSpScope` |
| 23 Sep | `bc5cda7e6` | Tooling | `renaissance-web` entry in `.claude/launch.json` |
| 23 Sep | `1ab926dc9` | Schema, queries | Per-website person image |
| 23 Sep | `ffc90cf5f` | Renaissance | `revalidate = 60` on slug pages |
| 23 Sep | `87eac2b0f` | Schema, shared | Unit `footerBannerLogo` |
| 23 Sep | `32c48ba8e` | Renaissance | Logo marks +50% |
| 25 Sep | `2fad5df82`, `3013e09bb` | FLZR | Detached 1SP AGENCY pill; Motion layout fix |
| 25 Sep | `c411c942d` | MSM | Headlines AspektaVF 400 |
| 25 Sep | `328f7bcea` | MSM, schema | Globe redesign with optional CTA |
| 25 Sep | `6093229fd`, `829d526a6` | Renaissance | Detached 1SP AGENCY pill; SVG lockup |
| 25 Sep | `6c0b18dac` | FLZR, schema | Violet headline background |
| 30 Sep | `34adb3776`, `c0364fc99` | All apps | Personio XML fallback, job-card fallback logo (also PRs #140/#141 on `main`) |

All schema additions are additive. New fields:

- `footerExternalBanner.headline`
- `unit.footerBannerLogo`
- `personWebsiteContent.image`
- `oneSPHeader.headlineBackground`
- `globeComponent.ctaLabel` and `globeComponent.cta`
- `intertitleCTA.paddingBottom`

New block types: `cinematicBlock3CardsReveal`, `msmMediaFeature` and `interactiveServiceCarousel`. The menu banner is now also allowed on `msmWeb`.

## Side effects and open issues found 4 October

Severity: **bug** = wrong today; **risk** = breaks under a plausible condition; **note** = worth knowing. Findings come from code review unless the evidence column says otherwise.

| Severity | Area | Finding | Evidence / next step |
| --- | --- | --- | --- |
| Risk | Studio | Studio served from `main` lacks the three new block types and the new fields. Staging `production` content already uses them (MSM homepages, FLZR home/agency); opening that dataset in main's Studio bundle would show unknown types/fields | Verify the Studio dataset and bundle editors use; use stage's schema when editing those staging documents |
| Risk | Staging drafts | Twelve draft documents in staging `production`: eleven content drafts and one internal preview-secret document. Content drafts include 1SP Home (`drafts.e9c40d17…`, 20 Sep), MSM Units (2 Oct), 1SP `test`, an MSM service, FLZR `TOMS` and navbar menu, a client and four service groups | Review content draft diffs before publishing or the future dataset switch. These staging drafts do not currently publish to live 1SP; drafts in live `dev-dataset` were not checked |
| Resolved, uncommitted | People | Renaissance portraits, MSM leadership and profiles now resolve the website-image override and shared fallback | Query fixtures and affected builds pass; see the follow-up record |
| Resolved, uncommitted | MSM preview | `paddingBottom` is now included in preview-control cleaning | Annotated preview fixture passes |
| Risk | FLZR conversion | The slim footer removed the site-wide “Start a project” enquiry link. Case pages without a contact person now have no enquiry path. The DEKRA badge is no longer rendered anywhere | Confirm the intent; reconcile with the [conversion plan](FLZR_CONVERSION_PLAN.md) |
| Risk | Shared groups | `OneSpScope` forces every group heading white, unlayered. Light-surface blocks allowed in groups (Personio job cards, cards step, dimmed two-tone headings) would show white on light grey | Published group use found in staging `production`: FLZR DE/PL homepage with dark blocks. Check live `dev-dataset` before merging and inspect new light-surface group compositions |
| Risk | FLZR cinematic | Pinning fails if the block sits inside a section band (`.flzr-section-surface` has `overflow: hidden`). Hydration remount shifts layout on desktop. Phones fetch the first video twice in the static layout. Cards are `inert` until revealed (keyboard skip) | Browser-check before promotion; consider guarding placement |
| Risk | MSM motion/SSR | Text is hidden until JS or scroll: the DecryptRotator delay (case h1, hero eyebrow), Media Feature and globe copy at opacity 0, FlickerWords visible→hidden→visible on hydration. Also contradicts `DESIGN.md` (“never hides text behind an opacity gate”) | Browser-check slow-hydration and no-JS behavior |
| Risk | MSM gallery | The server renders 12 cases and mobile drops to 6 after hydration (layout shift). Later pages are absent from server HTML, page state is not in the URL, and pagination also hits people/unit pages | Accept or adjust before promotion |
| Resolved, uncommitted | MSM | Optional service carousel now handles null/invalid selections and catches its CMS fetch failure | Forced-outage harness returns safely; browser carousel navigation passes |
| Risk | MSM globe | Globe now faces `initialPosition.lng`, which also changes the `smartUnitsGlobe` block | Check pages using smart units globe |
| Risk | Deployment | The beta tier skips dataset/channel/site/token validation. A beta project with the wrong `NEXT_PUBLIC_CHANNEL` passes | Check env per beta project when (re)deploying |
| Risk | FLZR content | All 30 replacement case images are 500px wide and now feed og:image, carousels and gallery cards | Source larger files where visible |
| Note | FLZR | `headlineBackground` is effectively on for all existing headers (missing = on). White on `#7c5cff` is about 4.35:1 (AA large text only) | Intended default; verify contrast on long copy |
| Note | Renaissance | The lockup teal `#3e9da7` differs from token `#3b9ca7`. A preloaded Aspekta copy in the footer banner may download alongside the new non-preloaded one | Visual/perf check |
| Note | Blocks | `interactiveServiceCarousel` is not channel-gated in Studio and other sites have no renderer. `paddingBottom` is supported by FLZR, MSM and Renaissance. `msmMediaFeature` is validation-gated | Optional Studio guard for the carousel |
| Note | Code health | `footer-backup-full.tsx` is dead code. `PageWithMapVertical` is no longer used, so MSM `navPointName`/`hideFromNav` fields do nothing. The rotating MSM hero words keep an inline weight of 300 against the 400 headline rule | Clean up when touching these files |
| Resolved, uncommitted | Tooling | `test:component-import` now uses `tsx`, resolving the pre-existing extensionless-import failure | `pnpm test:component-import` passes 5/5 |
| Note | Tooling | `.claude/launch.json` relies on `autoPort` (dev scripts have no `-p`); FLZR is declared on 3000, not 3001 | Cosmetic |

### Verification performed for the initial handoff review

- **Typecheck:** `tsc --noEmit` exits 0 for the root and for each of `apps/flzr-web`, `apps/msm-web` and `apps/renaissance-web`.
- **Tests:**
  - Passing: `pnpm test:deployment` (23/23), `test:presentation`, `test:cta-contract`, `test:flzr-section-bands` and `test:renaissance-section-bands`.
  - Failing: `test:component-import` fails only because of its runner (see above).
- **Staging content:** read-only GROQ queries against `wu6i3y0h/production` established where the new blocks are used, banner and unit configuration, open drafts and the case-media follow-up state. This is not an inventory of live `dev-dataset`.
- **Browser:** Renaissance was checked at 320px.

Not done:

- No app builds were run.
- No hosted deployments, Vercel settings, webhooks or Personio credentials were inspected.
- No motion was verified in a browser beyond the Renaissance nav.

The subsequent implementation ran root/MSM/Renaissance production builds, targeted tests, lint, desktop/mobile browser checks and a revision-guarded staging CMS patch. The [follow-up record](records/msm/msm-fixes-seo-and-legal-review-2026-10-04.md) owns those results and the supplied Word-copy discrepancies. Legal bodies were not replaced by that comparison.

## Operational boundaries and known traps

| Trap | Required distinction |
| --- | --- |
| “Production” means the live site | Dataset name, Vercel environment name and actual public release are separate states |
| Publishing to a dataset named `production` changes live 1SP | Live 1SP currently reads `dev-dataset`; `production` is staging. Publication affects deployments reading the same dataset. Reconfirm these roles at the future cutover |
| Test previews can use any dataset | The `test` tier validates `dev-dataset` and remains strict; it is not a staging-data isolation boundary while live 1SP also reads that dataset. The `beta` tier permits `production` staging previews, accepts only `*.vercel.app`, and skips dataset/channel checks. See [operations](PROJECT_OPERATIONS.md) |
| Studio looks current, so the frontend is current | Source schema, stored schema, Studio bundle (main vs stage), dataset, app deployment and caches are separate |
| Preview query string means draft session is active | Draft Mode must be enabled on the correct app origin; verify cookie/perspective and viewer-token setup |
| Publishing one website edition is isolated | Editions live in a shared document and publish together |
| Changing a shared person's image affects one site | Use the per-website image. Check the person's `channel` array first |
| Every animation comes from one global setting | Apps and blocks have separate motion implementations; verify each affected renderer and reduced-motion behavior |
| Shared documents imply shared visual layout | Queries/contracts are shared; app renderers and page narratives can differ |
| A `feat(<app>)` commit only touches that app | Several September commits changed root components rendered on every host (footer banner CSS, `OneSpScope`) |
| A backup filename proves recoverability | Verify project/dataset, contents, checksum, scope and restore procedure; document-only archives exclude asset binaries. `EXPORT/` is gitignored and local only |
| An old cleanup audit authorizes deletion | Recheck usage and current requirements; archived findings are unresolved evidence until verified |

See [operations](PROJECT_OPERATIONS.md) for Draft Mode, revalidation, integrations, backup boundaries and a focused test matrix.

## Work remaining, by status

| Status | Workstream | Next step |
| --- | --- | --- |
| Committed, needs browser verification before promotion | September MSM, FLZR and Renaissance changes (above) | Work through [open issues](#side-effects-and-open-issues-found-4-october); verify motion, reduced motion, no-JS/slow hydration and desktop/mobile per app |
| Decision needed | Promotion path | Decide when stage merges to `main` (live 1SP and its Studio), when live 1SP switches from `dev-dataset` to the prepared `production` dataset, and when FLZR/MSM/Renaissance get production projects. These are separate release decisions |
| Audited, proposed | Service ownership consolidation | Resolve ownership and pilot MSM; preserve Renaissance references and FLZR modal/page behavior. [Scoped queue](SERVICE_CONTENT_HANDOFF.md) |
| Content follow-up | MSM DE parity; FLZR case-media `RETIRE_OWN_VIDEO`; units without `footerBannerLogo`; FLZR DE/PL footer banner; open drafts | Confirm intent per item; record script runs under `records/` |
| Implemented, uncommitted | Person-image coverage, MSM preview spacing, carousel recovery, import runner, MSM SEO and homepage globe removal | Builds and scoped checks pass; [implementation record](records/msm/msm-fixes-seo-and-legal-review-2026-10-04.md) |
| Editorial reconciliation | Supplied MSM legal and privacy Word files differ from the existing legal bodies | Comparison recorded; select entity scope and German wording before replacing bodies |
| Small documentation fixes | Studio Content help text and `oneSpMembershipLabel` description | Separate scoped edits |
| Documentation debt | App design guides and FLZR conversion docs (below) | Update the owning guides |
| Deferred by user | Attribute optimization Stage 3+ | Refresh live capacity; use [recipe](SANITY_DATA_STRUCTURE_RECIPE.md). Do not replay completed Stages 1/2 |
| Proposed | FLZR conversion improvements | Preserve two journeys; account for the new footer and agency pill. [Plan and source audit](FLZR_CONVERSION_PLAN.md) |
| Foundations plus proposed workflow | Translation | Recheck document coverage, guidelines, deployed schema and provider capability before pilot. [Strategy](SANITY_AGENTIC_TRANSLATION_STRATEGY.md) |
| Unverified | Hosted Studio URL, provider settings, beta projects, webhooks, form/job delivery, live quota and launch readiness | Verify only for the next task's actual target |

The dated service audits record content state on 21 September. The content facts in this update are from 4 October. Neither establishes that there are no drafts or outstanding editorial changes today.

## Stale documentation found 4 October

These owning guides no longer match the code. Code is authoritative until they are updated.

- **MSM `DESIGN.md`:**
  - Font weight is still given as 500; the code uses 300 for body and 400 for headlines.
  - Case cards are described as three columns with a services line.
  - The minimap is still described.
  - Hero effects are described as unchanged, with no mention of FlickerWords.
  - It says reduced motion shows the poster.
  - It does not mention the globe redesign, the CTA accent or the padding fields.
- **Renaissance:**
  - `DESIGN.md` still describes the membership button, the logo and the six-column single-row logos.
  - `design-system/COMPONENTS.md` describes 6×2 logos with duplicates.
  - `design-system/RELEASE-CHECKLIST.md` still names the membership-button exception.
  - Nothing documents the `OneSpScope` white-heading rule or the Aspekta remap.
- **FLZR:**
  - [Conversion plan](FLZR_CONVERSION_PLAN.md) and [source audit](FLZR_CONVERSION_SOURCE_AUDIT.md) assume the green membership button and the footer “Start a project” link.
  - `apps/flzr-web/README.md` does not mention the cinematic block, the footer backup or the case-media script.
- **Shared:**
  - [Footer external banner](footer-external-banner.md) predates MSM support, the headline field and `footerBannerLogo`.
  - [Operations](PROJECT_OPERATIONS.md) has been updated with a beta-tier note; [the feature map](PROJECT_FEATURES.md) has been updated for this handoff.

## Supporting documentation

- [Feature map](PROJECT_FEATURES.md): where each major feature lives and its important quirks.
- [Operations](PROJECT_OPERATIONS.md): environment, preview, cache, integrations, backups and verification.
- [Architecture](ARCHITECTURE.md): content and app boundaries.
- [Service contract](SERVICE_CONTENT.md) and [service work queue](SERVICE_CONTENT_HANDOFF.md).
- [Documentation index](README.md): all maintained guides, proposals, design references and templates.
- [Dated records](records/README.md): migration source, publication and audit evidence.
- [Archived documents](archived/README.md): superseded plans and old procedures.
- [Consolidation report](records/project/project-handoff-review-2026-09-21.md): review scope, moved files, corrections and verification limits.

Keep this handoff as orientation. Update the owning guide for technical detail, the scoped plan for future work and a dated record for completed verification.
