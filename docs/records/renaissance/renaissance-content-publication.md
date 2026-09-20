> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# Renaissance content publication

The user authorized publication on 19 September 2026 after local review. All **225 Renaissance English drafts** were published to Sanity project `wu6i3y0h`, dataset `production`, channel `renaissanceWeb`. Post-publication verification completed at `2026-09-19T16:49:29.670Z`.

Later that day, the approved [global-services migration](../../renaissance-global-services-and-studio.md) published six global services and replaced duplicate Home/Services copy with references. It changed eight documents in a separate guarded transaction. The record below describes the original publication; its fixed manifest now intentionally differs for those two pages.

## Published scope

| Document type | Published |
| --- | ---: |
| Global cases | 66 |
| Global clients | 127 |
| Global people | 19 |
| Pages | 6 |
| Menus | 2 |
| Renaissance client collections | 2 |
| Renaissance awards collection | 1 |
| Renaissance portraits collection | 1 |
| Renaissance site settings | 1 |
| **Total** | **225** |

This created 217 published documents and updated eight existing published documents. **Zero Renaissance drafts remain.** All 11 unrelated drafts and unrelated published documents were preserved. The shared STALKER 2 case retains its existing global identity; its other channel content was compared before and after publication and is unchanged. The existing GSC client and Stefano person gained Renaissance channel membership without changes to their shared copy or artwork.

The published content includes 107 Results groups with 248 metrics, 19 named people, 125 displayed client logos and 10 award logos. The four held logo files remain excluded, as recorded in the implementation notes. The enquiry address is `martin@definition.studio` in Renaissance Site Settings.

## Preview and ordinary viewing

Studio's **Renaissance Preview** enables a browser draft-mode cookie so the local frontend can load unpublished edits. It does not publish those edits. Restarting the frontend can invalidate the session; reopening Preview renews it. **Disable Draft Mode** returns to the published view. Publishing makes the saved content available without that session.

The ordinary local view at <http://localhost:3003> now displays the published rewrite. Home, Services, Cases, About, Clients, Contact, Gamescom 2025 and the shared STALKER 2 page all returned HTTP 200 without preview cookies. Browser verification confirmed the published Gamescom Results groups after disabling draft mode. The sitemap contains 72 URLs: six pages and 66 cases.

The local Next.js cache was explicitly revalidated through its signed revalidation endpoint after publication. Page noindex and `robots.txt`'s `Disallow: /` remain in place. This was CMS publication; no frontend, hosted Studio, stored-schema or domain deployment was performed, and no Git commit or push was made.

## Validation and recovery

- Fresh full dataset export: `EXPORT/renaissance-rewrite-v4/publication/production-before-publish-2026-09-19.tar.gz`.
- SHA-256: `4c238f2018641c74527623777c6e788d495ff2241a93fae70659264e176225ca`.
- Export contains 533 documents, including 244 drafts and eight internal preview-secret documents. All 525 content documents were matched against the live pre-publication inventory. The archive is private and Git-ignored. It contains Cloudinary references, not copies of external media binaries; Sanity reported zero native assets.
- All 225 proposed documents passed the actual compiled schema, including the Cloudinary plugin, with zero errors and zero warnings.
- The server mutation dry run passed. One atomic transaction guarded current draft and published revisions, prevented new-ID collisions, copied the approved payloads, strengthened eligible references and removed the corresponding drafts.
- Post-publication verification compared every published payload with its approved draft, confirmed all 336 reference occurrences resolve, checked other channel case projections, and re-queried published pages, cases, people, logos, awards and settings.

The ignored `EXPORT/renaissance-rewrite-v4/publication/` folder holds the inventory, backup verification, before/after snapshots, exact plan, schema validation, dry-run response, publication result, data verification, signed local cache-revalidation result and HTTP verification. The earlier migration backup and source/metric recovery ledgers remain available.

Historical command for comparing this exact publication against its saved manifest (Home/Services now intentionally differ; use the linked service record for the current migration check):

```sh
RENAISSANCE_PUBLICATION_MODE=verify pnpm exec sanity exec scripts/renaissance-publish-content.ts --with-user-token
```

The authenticated CLI is used without copying its credentials into application configuration. Later editorial changes will intentionally differ from this fixed manifest. The older content and Results audit scripts target the pre-publication draft state; do not rerun them as current publication checks or replay import scripts over subsequent editorial work.
