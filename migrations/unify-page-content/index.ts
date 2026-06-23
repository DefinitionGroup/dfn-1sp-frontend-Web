/**
 * Phase 1A — unify page content arrays into a single `content` field.
 *
 * For each page document, copies whichever per-channel legacy content array
 * holds data (keyed by the document's `channel`) into the new `content`
 * field. The legacy field is left intact for safe rollback and for
 * backward-compat reads from any deployment that hasn't been updated yet.
 *
 * Idempotent: re-running is safe because `setIfMissing` is a no-op when
 * `content` is already populated.
 *
 * ## Prerequisites (do NOT run this until all are true)
 *
 *  1. `platform/multisite-monorepo` is merged to `main`.
 *  2. Main has been deployed to Vercel (production app reads
 *     `page.content` via GROQ coalesce — added in Phase 1A PR 2).
 *  3. The schema with the new `content` field AND `readOnly` flags on the
 *     legacy fields has been deployed to Studio (`sanity deploy`).
 *
 * Running this migration before main has been updated will not break
 * anything (legacy fields remain unchanged), but it will not deliver any
 * editor or frontend benefit until the deploy is live.
 *
 * ## Usage
 *
 *   # Dry-run (default) — shows what would change without writing:
 *   pnpm sanity migration run unify-page-content
 *
 *   # Real run:
 *   pnpm sanity migration run unify-page-content --no-dry-run
 *
 * ## Rollback
 *
 *   A reverse migration would `unset('content')` on the affected pages.
 *   The legacy `content<Channel>` fields are untouched by this migration,
 *   so frontend code reading them continues to render correctly even if
 *   the migration is reverted.
 */

import { defineMigration, at, setIfMissing } from "sanity/migrate";

const CHANNEL_TO_LEGACY_FIELD = {
  "1spWeb": "content1sp",
  msmWeb: "contentMSM",
  studioco2Web: "contentStudioCO2",
  flizrWeb: "contentStudioFlizr",
} as const;

type Channel = keyof typeof CHANNEL_TO_LEGACY_FIELD;

type PageDoc = {
  _id: string;
  _type: "page";
  channel?: string;
  content?: unknown;
  content1sp?: unknown;
  contentMSM?: unknown;
  contentStudioCO2?: unknown;
  contentStudioFlizr?: unknown;
};

export default defineMigration({
  title: "Phase 1A — unify page content arrays into `content`",
  documentTypes: ["page"],

  // Only touch pages that don't yet have `content` set AND have at least
  // one legacy field populated.
  filter: `_type == "page" && !defined(content) && (defined(content1sp) || defined(contentMSM) || defined(contentStudioCO2) || defined(contentStudioFlizr))`,

  migrate: {
    document(doc) {
      const page = doc as PageDoc;

      // Idempotency guard — should be caught by `filter` too.
      if (page.content !== undefined) return;

      const channel = page.channel as Channel | undefined;
      if (!channel || !(channel in CHANNEL_TO_LEGACY_FIELD)) {
        // Unknown / missing channel — skip.
        return;
      }

      const legacyField = CHANNEL_TO_LEGACY_FIELD[channel];
      const legacyData = page[legacyField as keyof PageDoc];

      // Empty / missing legacy data — nothing to migrate.
      if (legacyData === undefined || legacyData === null) return;

      return at("content", setIfMissing(legacyData));
    },
  },
});
