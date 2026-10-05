# MSM Contact social links — 5 October 2026

The Contact page's plain rich-text links are replaced in drafts by the reusable `msmSocialLinks` page-builder object. The user explicitly requested the new component; the existing rich-text section has no structured service/icon selection.

Editors can set the section heading, service, optional label, destination URL, new-tab behavior and navigation settings. Supported services are Messenger, WhatsApp, Facebook, Instagram and LinkedIn. MSM renders Phosphor service icons with visible labels, the established split editorial layout, cyan hover/focus, 48px link targets and reduced-motion support.

The user's follow-up adds a Content color selector for White plus nine colors from the existing MSM cube palette. White uses MSM Ink White (`#f4f4f4`) and is the initial value for new blocks and the fallback when an existing block has no color. Heading, icons and labels use the selected token; focus/hover retain the established cyan interaction signal. Cyan was selected in the English draft through Studio and verified in the browser, then restored to explicit White. The German draft uses the White fallback. Final verification permits only this explicit White addition alongside the reviewed conversion.

## CMS scope and recovery

- Verified project `wu6i3y0h`, staging dataset `production`, API version `2025-09-16` using the Sanity doctor before mutation. Live 1SP's `dev-dataset` was not changed.
- Created `drafts.msm-page-contact-en` and `drafts.msm-page-contact-de`; each replaces only `content[_key=="contact-channels"]`. The existing block key and link item keys are retained.
- All five original URLs, link order, labels and new-tab settings are preserved, including the English/German LinkedIn URL encoding difference.
- Full source-document backups, reviewed plan, checksum, transaction receipt, after snapshot, extracted schema and verification are in the ignored `EXPORT/msm-contact-social-links-2026-10-05/` directory. The migration helper is `scripts/msm-contact-social-links.mjs`; `--verify` is read-only. Re-running apply requires a fresh review/plan and must not overwrite the original backup.
- Transaction: `4KuOWceZJja0QqEaHRX0Im`. Verification confirms unrelated content and both published documents are unchanged. Native draft creation updates `_system.base` to the source published revision; this expected metadata change is checked explicitly.

## Verification and release boundary

- MSM and root 1SP production builds passed; focused ESLint and `git diff --check` passed. Sanity schema extraction succeeded.
- Authenticated local draft preview checked at 1280px desktop and 390px mobile. All five service icons and original destinations are present; mobile scroll width equals viewport width and links fit. Keyboard focus renders a 2px cyan outline.
- Local Studio shows the new block, editable service/label/URL/new-tab fields, sortable link items, the standard draggable page-builder block and Edit/Remove controls.
- Color verification: choosing Cyan in Studio renders all five icons/labels and the heading as `rgb(3, 184, 212)`; restoring White renders `rgb(244, 244, 244)`. Builds, lint and schema extraction were rerun after the palette addition.
- Screenshots: `/private/tmp/msm-contact-social-links-desktop.png` and `/private/tmp/msm-contact-social-links-mobile.png`.
- Source remains local. No frontend or Studio deployment, schema-store deployment, commit, push or page publication was performed for this change. Deploy the MSM renderer and updated Studio together before publishing the two converted drafts: the previous renderer ignores unknown block types.

The local dev build changed the draft-mode session identifier, so Presentation was used to refresh authenticated preview. A separate temporary preview tab was used for responsive verification and then closed; the temporary viewport override was reset.
