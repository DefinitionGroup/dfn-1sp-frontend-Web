# MSM beta and shared Studio release — 5 October 2026

All nine pending source, test and guide files were committed as `a06fb0be7dbbf17446a0b9f1e6e9cab5db24e7c1` on `multiseite/stage` and pushed to origin. `git ls-remote` independently confirmed the full SHA after Git could not update its local remote-tracking lock.

The desktop Cases browser now centers beneath its trigger, retaining a 16px viewport gutter. Its outer border is removed; a soft shadow accompanies a 300ms eased fade from 16px below. Reduced motion skips displacement. Studio also includes the MSM Unit assignments panel, which edits unit drafts without publishing them or storing a duplicate relationship on cases.

## Deployments

| Target | URL | Deployment | Result |
| --- | --- | --- | --- |
| Complete MSM app | https://msm-beta.vercel.app | `dpl_Dma5mr8Ut4nk9mSYwvAS8ZEAAcHg` | READY |
| Root app and shared embedded Studio | https://1sp-beta.vercel.app/studio | `dpl_8UjvUad58jEBAZJN7uWPbmZv8oQT` | READY |

Both Vercel deployments independently report the full source SHA above. The existing projects are not Git-linked, so they were deployed explicitly through the authenticated CLI. Their existing app roots, beta tier, aliases and environment settings were preserved. Both use Sanity `wu6i3y0h/production` as staging. No custom-domain launch or dataset cutover was performed.

The stored default schema was deployed separately to that dataset and re-read for exact equality with the extracted 139-type source schema. Verified revision: `q3TmcawVlts6ghyzOClgBN`, updated `2026-10-05T11:22:15Z`. The schema listing was empty before deployment; its empty pre-deployment inventory and extracted schema are saved in ignored `EXPORT/msm-release-2026-10-05/`.

The standard schema CLI aborted in native Rolldown, including outside the sandbox. Schema extraction succeeded; deployment used the installed Sanity CLI's authenticated `updateSchemas()` API and verified the resulting stored schema. No page, case or unit content was published during release.

## Verification

- MSM and root 1SP production builds passed, including TypeScript.
- Focused ESLint and `git diff --check` passed.
- All 11 unit-assignment tests and 23 deployment tests passed.
- Hosted desktop dropdown: exact center alignment, zero outer border, expected soft shadow, keyboard opening and 52 loaded cases.
- Hosted 390px mobile menu and Cases accordion opened with all 52 cases available.
- Homepage, Cases, Services, Contact, Units, German homepage, Acer case detail, sitemap, robots and shared Studio returned HTTP 200. Beta responses retain `noindex`; robots disallows crawling.
- Signed-in hosted Studio opened the Acer case and displayed all four MSM unit choices, published membership, review links, Reload assignments and the disabled Save unit drafts button before any edits.

The initial release exposed an existing `intertitleCTA` block that was invalid for the shared case-builder list. The follow-up below resolves that mismatch. Verification did not save assignments or publish units.

## Acer CTA schema follow-up

Source commit `14abb0b1ecdcc271c229be09f514b605887934ae` adds `intertitleCTA` to the shared `caseStudy.casesPageBuilder` list and its TypeScript union. The website-edition list and MSM renderer already supported the block. The root production build, focused ESLint and diff checks passed; extraction changed only the `caseStudy` type.

The commit was pushed to `origin/multiseite/stage` and independently checked with `git ls-remote`. Root Studio deployment `dpl_5NakdnBKnnWwDnD6mtTgsQ9xkosd` is READY at https://1sp-beta.vercel.app/studio; provider metadata confirms that full source SHA. MSM does not need another frontend deployment for this schema-only fix.

The stored schema in staging `wu6i3y0h/production` was backed up and updated through the installed Sanity CLI API, then verified against the extracted 139-type schema. New revision: `q3TmcawVlts6ghyzOCpYFa`, updated `2026-10-05T11:52:33Z`. Backups and extracted schema remain in ignored `EXPORT/msm-release-2026-10-05/`.

Hosted Studio verified Acer's published “Let’s talk” CTA opens with its content fields and appears as a valid block. The editable case builder's add-item menu includes “Intertitle CTA”. A fresh Studio session was needed to observe the updated bundle. Studio and MSM's Acer route return HTTP 200 with beta non-indexing headers. Acer's published document and revision `e08bcd09-7ff4-4fb1-b24f-d52dd7d229d4` remain unchanged; no content or assignments were saved or published.

## Final coordinated case-contact and social-links release

After the other agent finished, all pending changes were committed and pushed to `origin/multiseite/stage`. The final deployed source is `fcea22dfc9f199b76dd3ecad9a9b60f083bfc1e6`, including the earlier `f0b01900c` and `8b3191b61` changes. `git ls-remote` independently confirmed the final SHA. Both deployments used an isolated `git archive` of that commit.

| Target | URL | Deployment | Result |
| --- | --- | --- | --- |
| MSM beta | https://msm-beta.vercel.app | `dpl_7tGteLdoy6QHC5fSupD1QnPVbBnF` | READY |
| Shared embedded Studio | https://1sp-beta.vercel.app/studio | `dpl_67wLQhdfG9tTSCMYSZp612UvVGzM` | READY |

The provider confirms the same full source SHA on both deployments and the expected project IDs and aliases. MSM was deployed first, followed by Studio. The existing beta environments continue to use staging `wu6i3y0h/production`; live 1SP remains untouched.

The final 140-type schema, including `msmSocialLinks` and its Content color selector, was deployed through the installed Sanity CLI's authenticated schema API after the standard CLI again aborted in native Rolldown. The previous schema was backed up before writing; the stored result was re-read and verified for exact structural equality. Verified revision: `q3TmcawVlts6ghyzODa015`, updated `2026-10-05T16:22:43Z`. Backup and final extracted schema are in ignored `EXPORT/msm-contact-social-links-2026-10-05/`.

Hosted verification:

- MSM homepage, Cases, English/German Contact, Lufthansa privacy page, case API, sitemap and robots return HTTP 200. Beta indexing restrictions remain in place.
- Acer renders Kirsten Hücker's connected-person email; imported Lufthansa renders Camillo Stark's. Both case sections omit imported unit logos. Acer's contact section also omits the redundant Contact label and legacy duplicate contact CTA.
- Shared Studio, sitemap and robots return HTTP 200. Signed-in hosted Studio opens the English Contact draft and recognizes the social-links block. Its editor displays sortable links, editable section heading and Content color selector with White and all nine MSM palette choices.
- The final social-links agent record documents passing MSM/root builds, focused lint, schema extraction and desktop/mobile verification after the palette addition. Earlier focused contact/Globals tests and deployment checks also passed.

English and German social-links conversions remain drafts. This release did not publish page content or change people/unit assignments. The public Contact pages continue to use their existing published content until the drafts are published separately.
