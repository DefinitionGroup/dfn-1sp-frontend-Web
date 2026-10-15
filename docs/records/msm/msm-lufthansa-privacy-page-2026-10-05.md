# Lufthansa MR Showroom privacy page

Created the English MSM page at `/privacy-policy-for-lufthansa-mr-showroom` using the supplied policy and the existing Disclaimer presentation. The trailing-slash URL redirects to the app's standard slash-free route. On the final production domain its canonical is `https://www.msm.digital/privacy-policy-for-lufthansa-mr-showroom`.

## Content and presentation

- Preserved all 67 supplied paragraphs/list items, including the June 20, 2023 update date, company address, email and website link. Only headings and emphasis were added; Markdown links and bullets became Portable Text links and lists.
- Segmented into 13 editable `contentSection` blocks: Overview; Interpretation and Definitions; Collecting; Use; Retention; Transfer; Delete; Disclosure; Security; Children's Privacy; Links; Changes; Contact. Definitions, Personal Data, Usage Data, Sharing, Business Transactions, Law Enforcement and Other Legal Requirements use nested H3 headings.
- Reused `servicesHeroWithBadge` with an H1, Lufthansa MR Showroom subtitle and no CTA, matching the existing legal-page shell. Existing section typography, hairlines, two-column desktop layout and mobile stacking remain in use.
- Added page-specific metadata. No navigation/footer links, schema, shared queries, routing or frontend components changed.

The supplied attachment's SHA-256 is `3fc2b62125cbb8080653ec9c8a61cdd2fc358ae5849017e4bc9cba43f0045403`. The source-to-Portable-Text comparison matched every paragraph verbatim after removing only Markdown syntax.

## CMS boundary and recovery

The active MSM app environment and root Sanity doctor confirmed `wu6i3y0h`, `production`, API version `2025-09-16`, channel `msmWeb`, English. `production` currently serves as MSM staging; live 1SP's `dev-dataset` was untouched.

Created published staging document `page-msm-privacy-policy-for-lufthansa-mr-showroom-en` in transaction `q3TmcawVlts6ghyzOCpk2S`. All authored fields were compared with the saved document after creation. No existing document was changed.

The checked-in content is [the page document](../../../apps/msm-web/data/lufthansa-mr-showroom-privacy-page.json). [The creation script](../../../scripts/msm-lufthansa-privacy-page.mjs) defaults to a dry run, guards route/document/draft collisions, compares the saved plan's source hash before applying, and uses create-only semantics. An identical existing document is a no-op; any differences stop the script. Plan, Disclaimer snapshot, resulting document and receipt are ignored under `EXPORT/msm-lufthansa-privacy-page-2026-10-05/`.

## Verification and delivery

- `pnpm doctor:sanity --channel msmWeb --language en`, creation-script ESLint and `git diff --check` passed.
- `pnpm --filter @1sp/msm-web build` passed compilation, TypeScript and static generation. Existing middleware and Sanity image-builder deprecation warnings remain.
- Development and built-production servers returned HTTP 200 for the page, sitemap and robots. The new page appears in the sitemap, contains the complete policy and has the expected canonical.
- Browser inspection covered desktop at 1440 × 1000, mobile at 390 × 844 and narrow mobile at 320 × 812, with no horizontal overflow. Inspected hero, section headings, definitions/bullets and contact links. Built-production browser logs reported no errors.
- No hosted deployment, production-domain cutover, Git commit or push was performed.

## Subsequent header video

At the user's request, the header now uses `mainVideo` from the English Lufthansa case `aa740986-0fc9-4b83-9ef1-54ed9745041b` (`mixed-reality-takes-off-with-lufthansa`): Cloudinary asset `Zuckerberg_Inflight_n6u4ue`. The existing hero renderer supplies full-bleed cover cropping, a dark readability scrim, muted looping inline playback, viewport pause and a poster for reduced motion. Parallax stays disabled.

The staging patch changed only `content[_key=="hero"]`, guarded by revision `q3TmcawVlts6ghyzOCpk2S`; the resulting revision is `9xwYgO7OlTajAgagjrAQ5d`. The local page JSON matches the new header. The 13 policy sections and all other document fields were compared with the backup and remained identical. Recovery evidence is `header-before.json`, `header-after.json` and `header-receipt.json` in the same ignored export folder.

Browser verification at 1440 × 1000 and 390 × 844 confirmed the selected video loaded (`readyState: 4`), played, stayed muted and looped, with no horizontal overflow. Desktop/mobile crops and readable title/subtitle were inspected. This content-only follow-up did not change renderer code or perform a deployment.
