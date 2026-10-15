> Historical implementation record, preserved 2026-09-21. Counts, field locations, publication claims and pending items below describe that run. Current editing instructions are in [the services guide](../../SERVICE_CONTENT.md); the [cross-site audit](../sanity/service-content-ownership-audit-2026-09-21.md) verifies later production state. Do not replay mutation scripts from this record.

# Renaissance global services and Globals browser

Implemented on 19 September 2026, after checkpoint commit `7c1976322` (`feat(renaissance): implement and publish v4 content rewrite`). The service migration is published to `wu6i3y0h/production`, scoped to `renaissanceWeb/en`. The Studio changes run locally; this follow-up did not deploy a Studio or frontend, push Git, or commit its own implementation.

## Service ownership

Renaissance now uses six global `services` documents. Four reuse existing identities; two were added where the existing inventory had no matching service. The v4 rewrite remains authoritative for Renaissance. Other channels retain their shared names, copy, media, relationships and ordering.

| Renaissance service | Global document | Copy source | Storage |
| --- | --- | --- | --- |
| Go-to-market Communication Planning | `f6eea649-36bb-4398-907d-7df055747982` | F11 / F18 | Renaissance website edition of Go-to-Market & Sell-Through Support |
| Earned PR Campaign Planning | `93e175b0-cfe2-4918-bedd-e4893c27e79a` | F8 / F19 | Renaissance website edition of Video Games PR & Communications |
| Product Management & Support | `service-product-management-support-en` | F10 / F20 | New global document, Renaissance assignment |
| Paid & Organic Influencer Planning | `f172b651-99a4-4471-94c6-1ac402a109eb` | F9 / F21 | Renaissance website edition of Influencer & Creator Partnerships & Talent Management |
| Paid Media Planning & Buying | `service-paid-media-planning-buying-en` | F23 | New global document, Renaissance assignment |
| Event Management & Production | `d118cc4d-59f7-44a2-9ebd-64fffd1f773f` | F24 | Renaissance website edition of Experiential & Live Event Marketing |

The **Website content** tab can override service name, short copy, full description, tag label, deliverables, ordering, background media and icon for an assigned channel. Unset copy inherits the shared fields. Media has an explicit inherit/custom choice; custom with empty media deliberately displays no media. Cloudinary image/video, alt text and focus controls use the existing service fields. Publishing a global service publishes its complete draft, including every website edition.

Six Home cards and six Services page sections now reference these global documents. They no longer store duplicate service copy. The cards use `name`, `introText` and background media; the page sections use `name` and the full `serviceDescription`. The existing service order, section keys and core-service anchors remain stable; Home now adds Paid Media and Events after the four core services in a three-column desktop grid. The partner-network heading (F22) and Events section heading remain page-owned. Existing inline blocks and the fallback homepage remain supported. Missing or incorrectly scoped referenced services are omitted rather than displaying stale inline copy.

PR and creator videos were moved from the Home cards into the appropriate service editions. The original Renaissance Events and Paid Amplification videos were recovered from the pre-rewrite export and assigned to their services. Product Management and Go-to-market have no Renaissance-specific artwork; these fields remain empty and editable. Media availability does not change the text-based Services page layout.

## Editing in Globals

The title **Globals** remains. Case Studies, People, Clients and Services now open a single browser pane with:

- Channel choices for All channels, Unassigned and each configured website.
- A language selector, text search, document count and paginated results.
- All assigned channel names on each document row; channel-specific case/service titles when filtering to that channel.
- One neutral four-square icon for services in Globals, native lists and reference previews. Website service artwork remains stored and rendered independently.
- Creation defaults for the selected language and channel. All channels or Unassigned creates a document without website assignment; All languages disables creation until a language is chosen.

Website sections retain their **Assigned …** shortcuts to the same global documents. Existing language-pane bookmarks remain supported. Units and Service Groups keep their existing organization.

**Unassigned** means a missing, null or empty channel array. It does not mean unused, unpublished or safe to delete. In the default Drafts view, a draft takes precedence before filtering: removing its channel assignment moves it to Unassigned even if the published version retains an assignment. The browser follows the Studio's Published/release perspective when selected. It listens for content changes and offers retry on errors.

## Publication and recovery

- A fresh private content snapshot is saved at `EXPORT/renaissance-global-services/before.json`. It excludes internal `_.**` documents and preview secrets; it includes all content documents and their media references, not external media binaries.
- Snapshot SHA-256: `570ff14bb1d6f8dd5bd53df5eb51ce86fc65285419836a5f1f2d57b449a78534`.
- The earlier full export remains at `EXPORT/renaissance-rewrite-v4/publication/production-before-publish-2026-09-19.tar.gz`.
- Eight documents were published atomically: four existing services, two new services, Home and Services. Existing revisions and new IDs were guarded. No affected document had an outstanding draft.
- All eight proposed documents passed the compiled schema, including Cloudinary, with zero errors. The Sanity server mutation dry run passed before applying.
- Verification at `2026-09-19T17:44:12.943Z` found six services, four with Renaissance media, four Home references and six Services references. Unrelated documents and drafts were unchanged. Other-channel service projections matched their prior values, excluding expected modification timestamps and the added Renaissance membership.

The ignored `EXPORT/renaissance-global-services/` directory contains the snapshot, exact mutation plan, schema validation, dry-run response, transaction result, verification, signed local revalidation and HTTP checks. The plan is a historical migration: do not replay it over subsequent editorial work.

```sh
RENAISSANCE_SERVICES_MODE=verify pnpm exec sanity exec scripts/renaissance-services-migrate.ts --with-user-token
```

The earlier 225-document publication manifest is now historical: Home and Services intentionally differ following this migration. The original service verification is also historical after the six-service homepage follow-up below.

## Six-service homepage follow-up

At 2026-09-19T18:48:01.254Z, all six existing global Renaissance services were published on Home with six distinct videos. No service documents were duplicated. The Services page already referenced all six and needs no additional sections.

- Product Management uses the existing Measurement & AI data-analysis film.
- Go-to-market uses the existing storefront/launch film, explicitly selected in its Renaissance custom-media edition.
- Paid Media and Events retain their existing videos and gain short homepage descriptions derived from the approved copy. Paid Media retains the trusted-partner qualification.
- The homepage uses three columns on desktop, two on tablet and one on mobile. Its inline fallback snapshot contains the same six resolved cards and media.

Five existing documents were updated with revision guards after compiled-schema validation and a Sanity server dry run. A fresh content snapshot and all evidence are in the ignored `EXPORT/renaissance-home-six-services/` directory. Snapshot SHA-256: `34420fa773d8f7b7eb83183c3eea00da799848a4c10e9e15f00990e081f6421d`. Verification confirmed six published Home references, six Services-page references, six distinct available videos, and unchanged service projections for all other channels. Unrelated content documents were unchanged.

The current follow-up baseline can be checked with:

```sh
RENAISSANCE_SIX_SERVICES_MODE=verify pnpm exec sanity exec scripts/renaissance-home-services-complete.ts --with-user-token
```

Like earlier manifests, it will report subsequent editorial differences rather than replaying changes.

Follow-up verification passed: root TypeScript, Renaissance production build, five service contract tests, exact fallback snapshot comparison, cookie-free Home and Services responses, locale-free routing, sitemap and robots. Desktop and mobile browser checks showed all six video elements loaded without media errors, with no horizontal overflow.

## Validation

- Nineteen focused tests cover service editions, media inheritance/empty media, Home/page references, invalid targets, inline fallback compatibility, draft-aware Globals filters, pagination, creation defaults and existing case editions.
- Root and Renaissance TypeScript checks and both production builds passed.
- Local browser verification covered shared service editing and media fields, Renaissance case/people/client/service lists, search, Unassigned, and responsive Home/Services rendering.
- Cookie-free requests to Home, Services, Gamescom 2025, sitemap and robots returned 200; `/en` redirects to `/`. The sitemap retains 72 URLs. Noindex and `Disallow: /` remain.

Review [Globals Services](http://localhost:3000/studio/structure/globals;services) and [Renaissance Services](http://localhost:3003/services) locally.
