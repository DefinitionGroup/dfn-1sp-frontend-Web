# MSM beta smoke test — Claude handoff

Verified on 6 October 2026. MSM metadata, public assets, Cookiebot integration and the shared Studio are committed, pushed and deployed to beta. Metadata checks passed on all 176 public routes. After the user authorized the beta hostname in Cookiebot, the real banner and consent controls worked. Rejection, acceptance, selective consent and withdrawal passed. The cookie declaration awaits the vendor's first scan; German pages currently receive English vendor UI.

## Current release

Repository: `/Users/martin/DEV/1SP-dfn-1sp-frontend`, branch `multiseite/stage`. Runtime source: `87c29f49ea051e7bba940cb73042c9abdb5d2029`, verified on GitHub with `git ls-remote`. The handoff and documentation updates follow in a documentation-only commit and do not require another deployment.

| Change | Commit |
| --- | --- |
| Full metadata implementation and populated CMS fields | `2ac0308ae` |
| Seven public brand/email assets, separate commit as requested | `d028b7a54` |
| MSM Cookiebot banner and editable privacy declaration | `f96146c4d` |
| Enable Cookiebot on beta while preserving beta indexing/tracking guards | `87c29f49e` |

| Target | Verified READY deployment | Assigned URL |
| --- | --- | --- |
| MSM frontend | `dpl_7HoiwWR3yQEdU4Y2CNtFs842zEHR` — [immutable build](https://msm-beta-fnk5ke4yq-definition-groups-projects.vercel.app) | [MSM beta](https://msm-beta.vercel.app) |
| Shared embedded Studio | `dpl_8KtzJCYNfhG1jWaEG4fMDro9KyUy` — [immutable build](https://1sp-beta-6gsgm3ivm-definition-groups-projects.vercel.app) | [Studio](https://1sp-beta.vercel.app/studio) |

Both provider builds and alias assignments succeeded. Provider `target=production` means the production environment of these **beta projects**, not the live 1SP project. The builds came from isolated Git archives of the runtime commit, including the assets. Provider commit metadata uses the short SHA `87c29f49e`.

## Boundaries and CMS state

- MSM and shared Studio use Sanity `wu6i3y0h/production`, currently staging. Live 1SP uses `dev-dataset` and was not deployed or migrated in this release.
- Beta remains non-indexable; production Google Analytics stays disabled. Cookiebot runs on beta and production; the dedicated test lane suppresses it. Existing Vercel Analytics/Speed Insights behavior is separate from the Google Analytics guard.
- This release does not launch `msm.digital` or `www.msm.digital`, establish editorial/legal approval, or enable indexing.
- The stored default schema was backed up, updated and re-read: 140 types, revision `9xwYgO7OlTajAgagjxQ865`, updated `2026-10-06T11:23:42Z`. Only `contentSection` changed, adding optional `showCookieDeclaration`.
- Metadata is populated for 48 pages, 98 cases, 8 units and 22 people: 176 documents/routes, with 162 reciprocal translated routes. See the [metadata implementation record](msm-metadata-implementation-2026-10-06.md) for resolver behavior, content transaction, backups and earlier image checks. Its deployment table describes the earlier release; the table above supersedes it.
- EN/DE privacy declaration sections were already published in transaction `9xwYgO7OlTajAgagjwiSPN`. This smoke test did not republish page content or change editor drafts.

## Latest verification

- 48 focused Cookiebot, deployment-tier, metadata, case-edition and MSM content tests passed; focused ESLint and diff checks passed.
- Both Vercel builds passed compilation, TypeScript and static generation. MSM generated 132 static routes; the catalogue also includes dynamic routes.
- Fresh hosted crawl: **176/176 passed**, including titles, descriptions, canonical, OG/Twitter, server HTML language, translation links, beta noindex and JSON-LD. Sitemap contained exactly 176 expected unique URLs. Eight Facebook/browser user-agent samples passed.
- All seven deployed PNG/SVG assets returned HTTP 200 and matched the local committed files by SHA-256.
- Cases API returned 52 EN and 46 DE cases. Primary routes, privacy pages, sitemap, robots and Studio returned HTTP 200; missing page/case returned 404. Beta responses retained non-indexing headers.
- EN/DE HTML contains exactly one synchronous Cookiebot banner script with the MSM domain-group ID and correct culture, without async/defer. Google Analytics loader was absent.
- Hosted browser: desktop Cases opens with ArrowDown and searching Acer returns one project. Mobile menu and case filtering work at 390px; English home and German privacy page had no horizontal overflow. Desktop home at 1440px had no horizontal overflow. No console errors were recorded on the checked frontend tabs.
- EN privacy has one declaration script; navigating to Disclaimer removes it; returning through a client-side link mounts one again. DE privacy also mounts one. After account authorization, both render the real vendor's first-scan-in-progress message, without an unauthorized-domain error or mocked report.
- Real Cookiebot consent flow passed: Deny left Preferences/Statistics/Marketing off; Allow all enabled all three; reopening settings showed the stored state; withdrawal disabled all three. Mobile selective consent enabled Preferences while Statistics/Marketing remained off, followed by withdrawal. Google Analytics stayed absent. These UI checks do not establish the classification/blocking of every third-party resource; that requires the completed vendor scan.
- Authenticated deployed Studio shows populated homepage SEO fields, effective search/sharing preview and indexing controls. Privacy → Content → Cookie declaration → Edit exposes **Show Cookiebot declaration**, checked, with the beta-aware description. Edit/Remove are available. No field was changed or published during this check.

## Remaining action: Cookiebot scan and localization

Domain-group ID: `2c30619b-98e9-4d03-945d-095454bad8e5`, owned in `apps/msm-web/lib/cookiebot.ts`. Initially the vendor rejected `MSM-BETA.VERCEL.APP`; the user then added the hostname and the browser checks confirmed authorization. Cookiebot's [Domain Aliases guide](https://support.cookiebot.com/hc/en-us/articles/360006523374-What-are-Domain-Aliases) covers staging configuration. Earlier direct endpoint checks rejected `msm.digital` and `www.msm.digital`; verify their current account configuration separately before any launch.

1. After Cookiebot's first scan completes, verify the actual cookie inventory on both privacy pages. Current declaration text: “Under construction: The website is currently being scanned for cookies for the first time.” Completion requires a rendered report, validated resource classification and consent blocking, with no scan placeholder or authorization error.
2. Check German language availability/settings in the Cookiebot account. The frontend emits `data-culture="DE"` on German routes, but the real mobile banner/settings and scan placeholder were English. Verify German vendor copy after configuration; preserve beta noindex and Google Analytics suppression.
3. Account configuration or scan completion needs no commit or deployment. If implementation changes are necessary, test them and deploy MSM/Studio only when their source changed. Record the new evidence in a dated follow-up.

## Evidence, reproduction and recovery

Private ignored evidence: `EXPORT/msm-smoke-2026-10-06/` contains `source.json`, `audit.json`, `metadata-crawl.json`, `http-smoke.json`, `alias-smoke.json`, `browser-smoke.json`, extracted schema, schema backup and receipt. Earlier metadata and Cookiebot backups are in the corresponding dated `EXPORT/` folders. These are local evidence, not committed artifacts.

```sh
node --env-file=apps/msm-web/.env --import tsx --test scripts/msm-cookiebot.test.ts scripts/deployment-tier.test.mjs scripts/msm-metadata.test.ts scripts/case-website-content.test.ts scripts/msm-content.test.ts
python3 scripts/msm-metadata-crawl.py --origin https://msm-beta.vercel.app --audit EXPORT/msm-smoke-2026-10-06/audit.json --output EXPORT/msm-smoke-2026-10-06/metadata-crawl-repeat.json --beta --workers 4
git ls-remote origin refs/heads/multiseite/stage
```

Deployment scope is `definition-groups-projects`: MSM project `msm-beta` has root `apps/msm-web`; shared Studio project `1sp-beta` has root `.`. The checkout's default `.vercel` linkage belongs to the live root project: use explicit isolated project configurations for any later beta deployment. Retain beta env values and assign only the two beta aliases.

Previous beta targets for alias-only rollback: MSM `msm-beta-cwt17n9yt-definition-groups-projects.vercel.app` (`dpl_CZmCu2BiBcvvBBZZUEiLMywWMZYR`); Studio `1sp-beta-3m2ifqoyr-definition-groups-projects.vercel.app` (`dpl_6S8bmetepxcnemxWoYRu1Y5RxYGM`). Alias rollback does not undo CMS metadata or schema changes. Restore only guarded fields against current revisions to preserve later editorial work.

Local cached `origin/multiseite/stage` can lag because pushes report a local ref-lock permission error after the remote succeeds. Verify the remote SHA directly before concluding that anything remains unpushed.
