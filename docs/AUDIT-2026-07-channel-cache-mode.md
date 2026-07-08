# Site Audit — Channel filtering, mode-drop, stale cache, performance

**Date:** 2026-07-08
**Branch:** `multisite/flzr`
**Scope:** Whole public site (`app/(site)`), the page-builder blocks, and the
`@1sp/sanity-queries` data layer. Triggered by two production incidents on the
1SP site (Smart People not updating; Cases gallery showing the wrong set) and a
request to harden the multisite (flzr / msm) channels before they go live.

## Requirements being enforced

1. **Channel isolation (critical):** Cases, People, and Services must render
   only when assigned to the *active channel* of the site being viewed.
2. **Selection mode integrity:** Blocks with `auto` vs `manual` selection must
   honour the editor's choice and never silently fall back to the other mode.
3. **Cache freshness:** Published CMS changes must reach the live site via
   tag-based revalidation without indefinite staleness.
4. **Performance:** No redundant fetches or avoidable work on the render path.

## How the data flows (context)

- Each request resolves its channel with `getChannel()` (`NEXT_PUBLIC_CHANNEL`
  env → `channel` cookie → default). Pages pass `channel` into
  `getPageBySlug(slug, channel, language)`.
- `PAGE_QUERY` resolves *inline* references with the real `$channel`
  (e.g. `selectedCases[$channel in @->channel]->{…}`) — these are correct.
- Several blocks additionally **re-fetch** their data in their server component
  (to get more fields, pagination, or auto lists). Those re-fetches take a
  `channel` prop — and that is where the isolation breaks.

---

## Findings

| ID | Sev | Area | Summary |
|----|-----|------|---------|
| BUG-1 | **Critical** | Channel | `PageBuilder` never forwards `channel`; every re-fetching block defaults to `"1spWeb"`. On flzr/msm the galleries fetch 1SP content. |
| BUG-2 | **Critical** | Channel | `ServicesGalleryFilteredBlock` uses `getAllServices()` (`SERVICES_QUERY`, **no channel filter**) → services from all channels. |
| BUG-3 | High | Mode-drop | `CasesGalleryFilteredWithPaginationBlock` ignores `selectionMode`/`selectedCases` entirely — always renders the auto (all-cases) list. Manual curation is silently dropped. |
| BUG-4 | Medium | Mode-drop | `CasesGalleryFilteredBlock` falls back to **auto (all cases)** when a manual selection resolves to zero items after channel filtering. Should render empty, not everything. |
| BUG-5 | Low | Channel/People | `SMART_PEOPLE_QUERY` is hard-wired to `smartPeoplePromo1SP == true` (a 1SP-only schema flag, hidden for non-1SP people) and has no `language` filter. Smart People cannot be curated on flzr/msm, and cross-language duplicates are possible. Schema-level follow-up. |
| PERF-1 | Low | Perf | `PAGE_QUERY` dereferences `selectedCases` for `casesGalleryFiltered` / `…WithPagination`, but the blocks ignore that payload and re-fetch. Wasted projection. |
| BUG-6 | Low | Cache | Base `client.ts` sets `useCdn: true` with a misleading comment. Only affects direct `client.fetch`; render reads already force `useCdn:false` via `fetch.ts`. Cosmetic/defensive. |

### Already fixed (prior commits this session)

- **Stale cache root cause:** `fetch.ts` now forces `useCdn: false` for server
  reads so `revalidateTag` + 60s TTL are honoured (was stacking Sanity's CDN
  under Next's Data Cache). Shipped in `fix(sanity): disable CDN for tagged
  server reads…`.
- **Missing ISR fallback:** `app/(site)/[locale]/[slug]/page.tsx` now exports
  `revalidate = 60`, matching the other routes.

---

## Detailed notes

### BUG-1 — channel not threaded through PageBuilder
`PageBuilderProps` exposes only `language`. Blocks are dispatched as
`<Block {...block} language={language} />`. No block schema stores a `channel`
field, so the blocks fall back to their `channel = "1spWeb"` default. Affected
re-fetching blocks: `SmartCarousel` (auto), `SmartPeople`, `CasesGalleryFiltered`
(both modes), `CasesGalleryFilteredWithPagination`, `ServicesGalleryFiltered`.
**Fix:** add `channel` to `PageBuilderProps`, thread it from all five page
routes and the nested (deferred) `PageBuilder`, and pass `channel={channel}` to
each channel-aware block. Widen block `channel` prop types that omit
`flizrWeb`.

### BUG-2 — services ignore channel
`getAllServices(language)` → `SERVICES_QUERY = *[_type=="services" && language==$language]`.
A channel-aware variant already exists: `getAllServicesForChannel(channel,
language)` → `SERVICES_BY_CHANNEL_QUERY`. **Fix:** switch the block to the
channel-aware function and accept a `channel` prop (delivered by BUG-1).

### BUG-3 — pagination gallery drops manual mode
`CasesGalleryFilteredWithPaginationBlock` always calls `getAllCases`. **Fix:**
mirror `CasesGalleryFilteredBlock`: resolve `selectedIds` from `selectedCases`
(`_ref ?? _id`), and when `selectionMode === "manual"` use
`getCaseStudiesByIds(ids, channel, language)`, preserving order.

### BUG-4 — manual → auto fallback on empty
Both case blocks gate the manual path on `selectedIds.length > 0`. When channel
filtering legitimately removes every selected case, the block renders the full
auto list instead of nothing. **Fix:** branch on `selectionMode === "manual"`
alone; an empty manual selection yields an empty grid.

---

## Fix / commit sequence (small increments)

1. `docs`: this audit document. *(this commit)*
2. `fix(channel)`: thread `channel` through `PageBuilder` → blocks + pages (BUG-1).
3. `fix(channel)`: `ServicesGalleryFilteredBlock` uses channel-aware query (BUG-2).
4. `fix(pagebuilder)`: pagination cases gallery honours manual selection (BUG-3).
5. `fix(pagebuilder)`: manual case selection no longer falls back to auto (BUG-4).
6. *(optional)* perf/cosmetic cleanups (PERF-1, BUG-6).

Each step is committed independently so it can be reviewed and reverted in
isolation, and cherry-picked to `main` / `multisite/msmdesign`.

## Verification

- `pnpm build` / typecheck after the code changes.
- Per channel (`NEXT_PUBLIC_CHANNEL`), confirm galleries only show
  channel-assigned cases/services/people.
- Confirm a manual selection renders exactly the curated set (and empty when
  nothing matches the channel), and auto renders the full channel list.

## Out of scope / follow-ups

- BUG-5 (per-channel Smart People promo flag + language filter) — needs a schema
  decision; tracked here for a separate change.
- `selectedUnits[]->` / `selectedClients[]->` inline projections are not
  channel-filtered (units/clients), unlike cases/services. Lower priority.
