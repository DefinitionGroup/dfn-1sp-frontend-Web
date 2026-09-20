> Completed-work record, classified 2026-09-20. Counts, verification and pending items describe the recorded run, not a live status check or instructions to replay it. See the [documentation index](../../README.md).

# Cloudinary storage cleanup — stage 2

Completed 20 September 2026 on `wu6i3y0h / production`.

**Official attributes: 1,751 → 1,592 / 2,000.** Stage 2 frees 159 combinations; stages 1 and 2 together free 399. There are now 408 spare (20.4%), with usage at 79.6%.

## Exact scope

Removed 2,331 field occurrences across 231 records (201 published records and 30 drafts), using one revision-guarded, unset-only transaction. No drafts were published. Full before/after comparison verified that all other values, document identities, compositions and unrelated documents remain unchanged.

| Additional field | Observed occurrences | Policy |
| --- | ---: | --- |
| `_version` | 475 | Remove only plugin marker `1`; preserve unknown versions. This is separate from the retained Cloudinary delivery `version`. |
| `bytes` | 496 | Remove the stored provider size. |
| `created_at` | 490 | Remove the provider timestamp. Sanity document timestamps remain. |
| `access_mode` | 488 | Remove only `public`; preserve other values. |
| `access_control` | 382 | Remove only empty arrays; preserve restrictions. |

The existing four-field stage 1 policy remains. All rules are limited to `cloudinary.asset` objects. URLs, delivery version/type, IDs, dimensions, duration, derived assets, tags, metadata, display names, filenames, context, alt text and focal settings remain intact. Cloudinary-hosted assets and their access settings were not modified.

## Compatibility and prevention

The installed `sanity-plugin-cloudinary` 2.0.7 writes the candidate fields but does not read them for picker preselection, image/video/raw previews or diff previews. Picker preselection uses `public_id`, `type` and `resource_type`; preview uses URLs, derived assets, format, resource type and display name. No frontend/query consumer of the removed fields was found in the repository audit.

The shared storage policy covers local Studio single selection/replacement, array insertion and nested pasted values. A direct change from restricted to public clears the old stored access mode instead of silently retaining it. The Renaissance seed importer applies the same policy to new and copied assets. Current MSM/Renaissance content uploaders already use minimal payloads.

The historical `flzr-content-drafts.mjs` importer is explicitly restricted to `dev-dataset` and still constructs older metadata. Do not repurpose it for production without applying the shared storage policy. Older hosted Studios and arbitrary API/import writers also require the policy; no hosted Studio was deployed in this stage.

## Capacity check

Run `pnpm doctor:sanity-capacity` to read fresh official dataset statistics. It reports project, dataset, count, limit, headroom and an 80% warning threshold. Stale/missing statistics fail instead of being presented as current capacity.

For a CI or migration preflight gate, use:

```sh
pnpm doctor:sanity-capacity -- --fail-on-warning
```

The command is read-only. This adds a repeatable check, not a scheduled monitor. Local path-count simulations remain estimates; official statistics are authoritative. See [Sanity attribute limits](https://www.sanity.io/docs/content-lake/attribute-limit).

## Backup, evidence and recovery

- Fresh protected archive: `EXPORT/production-before-media-stage2-20260920.tar.gz` — 963 documents, parsed successfully, SHA-256 sidecar verified.
- SHA-256: `9f02d36e3fb1a26bb1ee695fe28757e6a0e12e2dcbe068d1613d5c1afeeb10c4`.
- Private snapshots and exact unset paths: `EXPORT/media-storage-stage2-20260920/`. Raw content stays ignored by Git.
- [Migration verification](../../../outputs/media-storage-stage2-20260920/verification.json), [fresh capacity result](../../../outputs/media-storage-stage2-20260920/capacity.json), [media delivery checks](../../../outputs/media-storage-stage2-20260920/media-checks.json).
- Eight storage/preview tests pass, including actual installed plugin preview rendering before/after cleanup, shared URL helpers, replacement/insertion patches, restricted access preservation and unchanged editorial data.
- Root TypeScript check and 1SP/Studio production build pass.
- Ten sampled image/video URLs across all five channels return HTTP 200 with media content types. All stored media URLs and rendering metadata were also verified unchanged by the full document comparison.
- Local Studio loads the MSM draft's 11 blocks. The header media preview loads at 1920×1080, `readyState=4`, with no media error, and Select/Remove controls remain available. Clicking Select created the Cloudinary library iframe, but its interactive contents did not render during this check. Actual picker selection/replacement/insertion was therefore verified at the patch boundary in tests, not by changing production content through the browser.
- The MSM frontend draft homepage renders its rewritten headline and a 1280×720 hero video with `readyState=4` and no media error. The embedded Presentation view remained loading during the check; the direct draft URL worked.

For another migration, explicitly set `CLOUDINARY_STORAGE_BACKUP` to a verified archive and `CLOUDINARY_STORAGE_OUTPUT` to a fresh directory under `EXPORT/`, then run `pnpm exec sanity exec scripts/cloudinary-storage-migrate.ts --with-user-token`. Default behavior is dry-run; `CLOUDINARY_STORAGE_APPLY=1` enables guarded writes. Existing recovery snapshots cannot be overwritten by a second apply.

If rollback becomes necessary, restore only removed fields from the protected before snapshot with fresh document revision checks. Do not overwrite later editorial changes with a full dataset restore. The archive preserves references, not Cloudinary media binaries.

Globals, channel editions and case/page composition storage were not restructured.
