# Footer External Banner (1SP and FLZR)

`footerExternalBanner` renders a full-width background video with a poster, a large logo, eyebrow, text, lime CTA, unit links and optional copyright.

## Add it in Sanity

- For every 1SP page: open the **1SP Footer menu → Footer → Footer External Banner** and populate the object.
- For an individual page: add **Footer External Banner** in the Page Builder. Use either placement to avoid displaying it twice.
- FLZR supports the same block in its Page Builder and Footer menu. It renders with the canonical 1SP branding and unit catalog. The block can also be added to a shared **1SP Component Group** and referenced by a FLZR page.
- For every FLZR page: open **FLZR → English → Menus → Footer → Footer → Footer External Banner**. This shared placement renders after the FLZR footer. Remove page-level copies to avoid duplicates. Each language uses its own Footer menu.
- Select the background video and optional poster through Cloudinary. Without a custom logo, the existing white/lime 1SP Agency logo is used. Configure the CTA text and destination explicitly.
- Unit buttons use each active unit's existing logo and CTA. There is no item limit. Units without a logo display their name; those without a usable link display as non-interactive entries.

Units are filtered by language and channel. For backwards compatibility, unassigned legacy units are included only for `1spWeb`; units explicitly assigned to other channels are excluded. The current English development catalog includes 11 entries, including the parent 1SP Agency.

The component uses five columns on desktop, three on tablet and two on mobile. Video playback is deferred until near the viewport, paused outside the viewport and controllable with a pause/play button. Reduced-motion preferences show the poster and disable entrance/hover movement, including when the preference changes while the page is open.

## Integration and release

- Client component: `components/menu/footerExternalBanner.tsx`
- Server data wrapper: `components/pagebuilder/server/FooterExternalBannerBlock.tsx`
- Schema: `packages/sanity-schema/src/1SP/Components/footerExternalBanner.ts`

The existing footer remains enabled. The English FLZR banner is configured in the shared Footer menu in `dev-dataset`; its previous homepage copy was removed. Hosted Studio, stored Sanity schema and frontend deployment are separate release steps. No production dataset or frontend deployment was changed.
