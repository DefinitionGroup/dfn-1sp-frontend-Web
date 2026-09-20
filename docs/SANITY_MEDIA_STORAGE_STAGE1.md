# Cloudinary storage cleanup — stage 1

Completed 20 September 2026 on project `wu6i3y0h`, dataset `production`.

**Official Sanity count: 1,991 → 1,751 / 2,000 attributes.** This frees 240 combinations and leaves 249 available (12.45% capacity).

Only `created_by`, `uploaded_by`, `folder_id` and `asset_folder` were removed from stored `cloudinary.asset` objects. The migration removed 1,539 field occurrences across 201 documents: 172 published records and 29 drafts. It did not publish drafts. Each patch was guarded by its document revision and used only `unset` operations.

Full before/after comparisons confirm every other field remains identical, including URLs, asset identity, dimensions, duration, delivery version, tags, custom metadata, alt text, focal settings and content. Unrelated documents are unchanged. No assets were moved or deleted in Cloudinary; upload requests can still specify `asset_folder` to organize that library.

## Preventing recurrence

- `sanity/components/CloudinaryStorageInput.tsx` wraps the local Studio input pipeline. It sanitizes asset replacement, array insertion and nested pasted values, while passing other field patches through. It performs no cleanup writes on mount.
- `packages/utils/src/cloudinary-storage.ts` provides the same four-field policy for imports and the migration.
- The Renaissance seed importer no longer copies `asset_folder` into stored metadata and sanitizes cloned assets. The MSM/Renaissance rewrite uploaders already construct payloads without these four fields, so their Cloudinary upload-folder parameters remain intact.

This guard is active in the local Studio build. No hosted Studio deployment was made. Older deployed Studios and external API/raw dataset imports can still reintroduce provider fields until they use the same policy. A Sanity schema alone cannot enforce this on all external writes.

## Verification and recovery

- Fresh archive: `EXPORT/production-before-media-stage1-20260920.tar.gz`, 965 exported documents, archive parsing and SHA-256 verification passed; hash sidecar saved. This protects the state immediately before cleanup. The prior named `EXPORT/msmcontent-migration.tar.gz` also remains available.
- Six focused storage/visual-editing tests pass. They cover single and array patches, nested values, idempotence, unrelated fields, middleware forwarding and preview configuration.
- Root TypeScript check and 1SP/Studio production build pass.
- Local Studio and MSM draft preview load after restart. The header's Cloudinary editor retains its Select/Remove controls, and its video loads at 1920×1080 (`readyState=4`, no media error). No asset was replaced during browser verification; selection/insertion patch handling is covered by the focused tests.
- Migration verification: [verification.json](../outputs/media-storage-stage1-20260920/verification.json). Fresh API statistics: [live-stats.json](../outputs/media-storage-stage1-20260920/live-stats.json).
- Protected raw before/after snapshots and exact unset paths are in ignored `EXPORT/media-storage-stage1-20260920/`. The executable migration is `scripts/cloudinary-storage-migrate.ts`; it defaults to dry-run and requires `CLOUDINARY_STORAGE_APPLY=1` for writes.

Do not restore the full archive over subsequently edited production content. If rollback is needed, restore only the removed provider fields from the saved snapshot, with fresh revision guards. Backups preserve Cloudinary references; they do not contain Cloudinary-hosted media binaries.

Stage 2 (broader metadata removal or composition restructuring) has not started. Globals, editions, document types and block layouts remain as before.
