# Renaissance shared content trial

## Editorial model

Studio: Renaissance → English → Shared content → Portrait grids / Award logo walls.

- `renaissanceSharedPortraits` contains one existing `renaissancePortraitGrid` object.
- `renaissanceSharedAwards` contains one existing `renaissanceAwardLogoWall` object.
- Shared documents own images, names, ordering and the awards headline.
- `renaissanceSharedContentReference` places a shared document in a page. The page owns placement and surrounding section styling.
- Site Settings chooses the default portrait and award documents independently. A People section automatically uses these when it has no corresponding explicit local block or shared reference.
- Existing inline blocks remain supported. Explicit portraits replace only the portrait default; explicit awards replace only the awards default.
- Without configured defaults, old hardcoded content remains a compatibility fallback. A configured but unresolved reference is omitted rather than replaced with legacy images.
- Shared references are restricted by channel and language in both the picker and query. This first trial supports Renaissance English.

## Editor workflow

1. Create or open a shared document. Edit its existing media fields and publish it.
2. In Site Settings, select the default Portrait Grid / Award Logo Wall and publish settings.
3. Other placements: insert Renaissance Shared Content into a page and select the document.
4. Publishing shared changes updates every reference through the same page query. The Renaissance revalidation endpoint invalidates page caches for both shared types. Hosted webhook delivery still depends on deployment/provider configuration.
5. The read-only Used by field lists published direct references and People pages inheriting the default. Reopen the document to refresh it; draft-only placements are not listed.

## Trial and verification

`pnpm exec sanity exec scripts/seed-renaissance-shared-content.ts --with-user-token` is read-only by default. Add `-- --apply` to create the trial in `wu6i3y0h/dev-dataset` only. It checks scope, refuses conflicting existing defaults or drafts, backs up affected documents to a verified gzip file, uses revision-guarded atomic writes, and re-queries the result. Existing shared content is never overwritten.

The trial reuses today's five portrait slots and eight award-logo slots. It does not modify homepage content, production data, or other channels. The duplicate portrait and repeated award assets are preserved; their final editorial names and images can be corrected centrally.

Tests: `pnpm exec tsx --test scripts/renaissance-shared-content.test.ts`, CTA/schema tests, Renaissance section tests, Renaissance build and root 1SP build. Query fixtures verify one central change on two pages, explicit references, independent local overrides, missing references and channel/language isolation.

Source code, hosted Studio schema, frontend deployment and dataset content are separate release steps. The trial data can exist before deployment; the currently deployed renderer continues using its previous behaviour until released.

## Trial result — 2026-09-11

Created and verified `renaissance-shared-portraits-en` and `renaissance-shared-awards-en` in `dev-dataset`; selected both in `site-settings-renaissanceWeb-en`. The real homepage query resolves five portraits and eight awards from these documents. Desktop/mobile rendering and both application builds passed, together with the five focused shared-content tests and existing CTA/section tests.

Local frontend: http://localhost:3016/ . Local Studio: http://localhost:3333/studio (Sanity sign-in required for the editor walkthrough). Hosted Studio/schema and frontend releases have not been performed.
