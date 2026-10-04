# MSM fixes SEO and legal content review

Implemented and checked on 4 October 2026 in `multiseite/stage`, based on `c0364fc992671fd580c0f39ac9b57f29561a240f`. Code and documentation are uncommitted. No Git push or hosted deployment was performed.

## Scope and implementation

The requested sequence was to fix the confirmed defects, remove the homepage globe, complete MSM metadata, check the legal pages, then build and debug the result.

- Added website-image fallback to MSM unit leadership and profiles, and Renaissance referenced portraits. A local Renaissance portrait override still takes precedence; shared images remain the fallback.
- Added `paddingBottom` to MSM preview-control cleaning, preserving authored spacing when Sanity inserts preview annotations.
- Made the optional MSM service carousel tolerate null selections and CMS fetch failures. A failure logs the cause and omits the optional carousel; the independently authored directory remains available.
- Changed `test:component-import` to the existing `tsx` runner so extensionless TypeScript imports resolve.
- Added MSM social title, social description, social image and noindex fields. CMS pages and units use the shared metadata object; case editions expose these fields only for MSM. Profile SEO uses the MSM person edition.
- Centralized MSM title/description, absolute canonical and Open Graph URLs, `en_US`/`de_DE` locales, Twitter cards, image fallback, annotation cleaning and indexing guards. Empty or malformed editorial images fall back safely. Sitemap filtering honors noindex for pages, homepages, units, profiles and MSM case editions.
- Corrected a browser-confirmed existing defect: MSM JSON-LD previously identified its website, organization and several routes as 1SP. The MSM adapter scopes those generated identities and routes to MSM while preserving third-party URLs. The root 1SP generators are unchanged.

Sharing uses existing Cloudinary assets. Videos supply JPEG still frames. The default image is a still from MSM's existing `MSM_VIDEO_WIP_ndnprm` homepage video, at 1200 × 630. No AI image generation was used. An initially attempted Next.js fallback-image route failed on its variable font and was removed from the final change.

## Sanity changes and recovery

Target: project `wu6i3y0h`, dataset `production`, channel `msmWeb`. This dataset is currently staging. Live 1SP reads `dev-dataset`; its content was not modified.

`scripts/msm-release-content.mjs` defaults to dry run. Apply requires `MSM_RELEASE_APPLY=1`, checks the backup checksum and every document revision, then commits an atomic revision-guarded transaction. Post-write assertions compare the intended fields and every unrelated authored field.

| Item | Verified result |
| --- | --- |
| Transaction | `4KuOWceZJja0QqEaHP4TaS` |
| Patched documents | 47 published MSM pages and the existing MSM Units EN draft |
| Page metadata | All 47 published pages have SEO and social titles/descriptions |
| Explicit sharing assets | 37 published pages; other pages use the Cloudinary fallback |
| Homepage removal | EN and DE each contain zero `globeComponent` blocks |
| Draft boundary | The Units draft remains a draft; body and unrelated fields were preserved |
| Legal bodies | All four existing EN/DE legal-page bodies were preserved |
| Field capacity after patch | 1,656 / 2,000, from the live dataset statistics endpoint |

Private recovery files are ignored under `EXPORT/msm-release-2026-10-04/`: `before-1791120622519.json`, `plan.json`, `after.json`, and `receipt.json`. Backup SHA-256: `4f44967a1b5cb13f232d01525b6587728779cab728ec2595a2d0c416dcb4fa18`.

The EN homepage retains nine blocks: header, cases intro, smart carousel, case gallery, intertitle CTA, Media Feature, Units, people gallery, closing intertitle CTA. DE retains eight: header, cases intro, case gallery, intertitle CTA, Media Feature, Units, content section, closing intertitle CTA. The globe renderer remains registered for other authored compositions.

## Comparison with supplied Word copy

The user requested a check against `Legal_msm_digital.docx` and `Data_privacy_msm.docx`. Their prose was treated as source material, not instructions to execute or permission to replace existing legal text. The comparison used paragraph/run text including explicit Word line breaks and normalized whitespace.

| Source | SHA-256 |
| --- | --- |
| `Legal_msm_digital.docx` | `495b3b55fe5c85ff9447fdaefd2f1a87304fb571b6850b80e73a07a07b2f41e2` |
| `Data_privacy_msm.docx` | `454fb48bb1debec0d4cb5f051fdb600b3c952c3628fb417dc2389318ec3c30e8` |

Existing routes are `/disclaimer`, `/privacy-policy`, `/de/disclaimer` and `/de/privacy-policy`. No page creation or copy from 1SP was necessary. All four return HTTP 200 and occur in MSM's sitemap.

| Topic | Supplied copy | Existing MSM CMS copy | Assessment |
| --- | --- | --- | --- |
| Disclaimer company details | Holding company plus Channel Marketing, Communications, Technology Systems, AR / VR Labs and MSM.digital AB | Contains these six entities, with matching register/VAT numbers, addresses and directors | Material company facts agree; presentation and labels differ |
| Additional entities | Does not list 1SP Shared Services, Brandmates or 1SP Southern Europe | Lists all three | Different entity scope; replacement would remove these entries |
| Responsible party and disputes | DDG introduction, named content responsibility under MStV, consumer arbitration statement | General responsible-content heading; lacks the supplied named responsibility and dispute text | Source sections missing |
| Disclaimer sections | Website content, external links, copyright, professional advice, availability, liability, governing law, changes and contact | Short copyright/external-link notice | Most supplied disclaimer wording is absent |
| Year and AI notice | Includes AI-generated-content notice and `1SP Agency 2026` | Body copyright remains 2025; supplied AI notice absent | Does not match the supplied copy |
| Privacy controller introduction | “1 Who we are”, GDPR controller wording, holding address/email and five MSM entities | Older holding-only introduction and data-protection-officer contact | Missing supplied controller wording and company list |
| Privacy remainder | File contains only 24 nonempty paragraphs, approximately 560 text characters | EN contains approximately 30,000 text characters and DE approximately 47,000 | Supplied file is an introduction, not a complete replacement policy |
| Language | Both supplied files are English | EN and DE pages exist | No authoritative German replacement was supplied |

No legal-body update was applied as part of this comparison. A subsequent reconciliation should use the supplied English disclaimer as the replacement only after its entity scope is selected, update the privacy controller introduction while preserving the remainder and data-protection contact, and resolve the German text separately.

## Verification

- Production builds passed for root 1SP, MSM and Renaissance after the final shared changes. Existing middleware and image-url deprecation warnings remain nonblocking.
- The MSM/content/metadata, case-edition and Renaissance-content suites passed 32/32. Component import passed 5/5. The earlier combined deployment-tier, Renaissance-content and Renaissance shared-content run passed 21/21.
- ESLint passed for the changed MSM routes, metadata helpers, carousel and schema fields. Production builds also ran their TypeScript checks.
- A direct server-component harness forced null/invalid selections, a foreign channel, a CMS outage and an empty response. Each returned safely; the outage logged once.
- A sitemap fixture excluded noindex homepages, pages, cases, units and profiles while preserving MSM pages flagged only on another website. A fresh beta process confirmed the preview canonical origin and noindex guard.
- Local production-server checks covered EN/DE home, legal pages, services, contact, cases, unit detail, service detail and case detail. They checked canonical URLs, Open Graph/Twitter tags, sharing images and MSM JSON-LD. Sitemap and robots were checked independently.
- Browser checks at 1440 × 1000, 390 × 844 and 320 × 812 found no horizontal overflow on the reviewed homepage, legal and services views. The carousel rendered six linked items and advanced from page 0 to 1. No browser page errors were reported in these checks.
- Existing Cloudinary sharing image returned HTTP 200, `image/jpeg`, 1200 × 630.

This verifies the local branch and the scoped staging CMS mutation. Hosted deployments, current provider configuration, webhook delivery, analytics consent behavior and full no-JS/reduced-motion behavior were not re-certified. The remaining handoff risks and the Word-copy reconciliation remain separate work.
