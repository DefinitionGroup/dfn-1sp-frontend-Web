# MSM Contact: existing page-builder composition

The MSM Contact route now uses the app's existing `[locale]/[slug]` route and `MsmPageBuilder`. The dedicated Contact route was removed. No new block types or route-level assembly are required.

## Editor location and composition

- Studio: **MSM → English (EN) → Pages → Get in touch → Content**.
- English document: `msm-page-contact-en`; German: `msm-page-contact-de`.
- Project `wu6i3y0h`, dataset `production`, channel `msmWeb`. The live 1SP dataset and Contact route were not modified.
- Four existing blocks: `oneSPHeader`, `contentSection` for company details, `contentSection` for contact links, and `galleryPeopleStep` for people.
- Copy, hero media, CTA, company details, contact links, people selection and section order are edited in those blocks. People remain references to shared documents, editable through the existing reference editor.
- The existing people renderer now honors the block's badge text/subtitle, retaining its previous defaults when fields are absent.
- The legacy `contactForm` field remains in the shared page schema. MSM's raw route does not consume it; edit the Header block for the page headline and support text.

Root `AGENTS.md` now requires existing blocks first and explicit approval before a custom composition, new block, or route-level assembly when an existing block cannot satisfy a concrete requirement.

## CMS migration and recovery

`scripts/msm-contact-pagebuilder.ts` provides a dry run and an explicit apply mode. The apply compares the complete current documents against the reviewed plan, uses revision guards, and updates only `content` in one transaction. Both published locale documents and the existing English draft were converted; the draft was not published by the migration.

- Transaction: `q3TmcawVlts6ghyzOCx87I`.
- Before/plan/after/receipt: ignored `EXPORT/msm-contact-pagebuilder-2026-10-05/standard-*.json`.
- At migration verification, all nine companies and five contact links were retained for each locale, with 13 English and 12 German people references.
- Subsequent English company copy changed in a separate Studio editing session during verification. Those newer changes were left untouched; the migration backup retains all original company details.
- The temporary bespoke Contact schema types were removed. Extracted/stored default schema verified identical with 139 types, revision `9xwYgO7OlTajAgagjrJh1R`, updated `2026-10-05T12:53:13Z`. Previous stored schema was backed up in the same export folder.

## Verification and delivery boundary

- `pnpm doctor:sanity`: correct staging project/dataset and MSM content scope.
- Focused ESLint and `git diff --check`: passed.
- `pnpm --filter @1sp/msm-web build`: passed.
- Root `pnpm build`: passed.
- Local English Contact at 1280 px and 390 px: hero, company text, all five contact links and all 13 people render without horizontal overflow or a Next.js runtime error overlay.
- German Contact at 390 px: correct title and all nine companies render without horizontal overflow or an error overlay.
- Hosted Studio: verified MSM navigation, four recognized blocks, editable company rich text and people references, draggable block containers and Remove controls. No content was intentionally changed through the verification UI.
- Studio proof: `/private/tmp/msm-contact-standard-studio.png`.

This correction is applied to local source and staging CMS. The Contact source changes are not yet committed, pushed or deployed to MSM beta. The existing hosted Studio already supports these standard blocks.
