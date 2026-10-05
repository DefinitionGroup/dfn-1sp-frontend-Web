# MSM navigation refinement — 4 October 2026

The approved scope was to improve MSM's mobile menu and Work/Cases discovery, informed by The Set's dropdown and the 1SP mobile menu. This extends the incumbent MSM world: Aspekta Medium, square geometry, dark fields, fine rules, cyan interaction signals, and the refractive desktop bar remain the visual authority.

## Comparison

| Surface | Before | Implemented |
| --- | --- | --- |
| Mobile menu | Compact disclosure beneath the fixed bar | Full-screen native modal dialog with MSM.digital identity, ruled destinations, contact/Agency footer, safe-area padding, and a subtle faceted mosaic shader |
| Cases discovery | Separate case-gallery overlay | Shared case browser in a desktop dropdown and mobile accordion, with project/client search, Unit filtering, result feedback, and direct case links |
| All cases | Opened the gallery overlay on case-detail routes | Navigates to the locale's `/cases` route from the browser and desktop case-detail bar |
| Desktop shell | Refractive glass navigation | Preserved glass treatment with hover/activation disclosure, keyboard entry, and adjacent case preview |

Implementation is confined to `apps/msm-web/components/menu/FrontNavOverlay.tsx`, `CaseBrowser.tsx`, `MobileNavigation.tsx`, `MenuShader.tsx`, and `Navigation.module.css`. No shared platform or CMS edits were made for this refinement.

## Verification and disposition

The MSM production build and targeted ESLint passed. Existing browser evidence checked desktop navigation and mobile at 390 × 844 and 320 × 568, with no horizontal overflow. Search by project/client and Unit filtering worked; All cases navigated to `/cases`. Mobile focus containment, Escape/focus restoration, page scroll locking, and closure at the desktop breakpoint were checked. Desktop ArrowDown entered search and Escape restored trigger focus.

Review captures are retained under `.impeccable/review/`: `desktop.jpg`, `user-831.jpg`, `mobile.jpg`, `mobile-cases.jpg`, and `mobile-320.jpg`. The finish review disposition was **ship**: typography, material, and ground matched MSM and the approved request was fulfilled without material fixes. This record describes local implementation and verification; it does not establish a hosted deployment.

The subsequent All cases arrow-spacing fix reserves a fixed icon column and increases horizontal padding. Browser measurements at 320px, 390px, and 1440px confirm a 21px inset between the icon and button edge; the 320px dialog retains no horizontal overflow. `all-cases-spacing.jpg` captures the corrected desktop control.

## Documentation boundary

`apps/msm-web/DESIGN.md` now records the full-screen mobile dialog and desktop case browser. `PRODUCT.md`, the palette, the shared typography ramp, and `.impeccable/design.json` remain unchanged. Navigation-specific type sizes outside the existing ramp remain local component values; they are not promoted to system tokens. Pre-existing static mobile-navigation sidecar approximations are not repaired as part of this ordinary extension.

## Subsequent typography and mosaic updates

MSM's local monospace classes and case-pagination font declaration now use Aspekta. The MSM-only theme also maps the legacy monospace token to Aspekta for shared renderers. Font weights, sizes, tracking, and shared 1SP source are unchanged.

The menu background now renders perspective triangle geometry through a Three.js vertex/fragment shader. It imports the existing MosaicButton palette and follows its alternating lattice, staggered half-turns, lift, and settling curves. The dialog reveals diagonally from top-left to bottom-right over 320ms; the mosaic completes its opening sweep in about 2.4 seconds before entering slow 24-second facet cycles. A dimmed canvas keeps the foreground legible. The renderer uses one merged geometry, runs at up to 30fps with DPR capped at 1.25, pauses when hidden, and releases its GPU resources on close. Reduced motion presents the complete static mosaic.

The updated MSM production build passed, including TypeScript. Targeted shader/navigation lint passed; the typography files retain four pre-existing static-component warnings in `pg-2ColContentSection.tsx`, with no lint errors. Rendered footer labels and corner markers resolve to Aspekta, and the legacy token resolves to the same family.

The final built preview was checked at 390 × 844 and 320 × 568: the dialog and canvas fill the viewport with no horizontal overflow. Consecutive captures show the facets changing orientation while the navigation stays still. Communications filtering returned 29 projects and searching Acer returned one. Escape and close release the page lock and restore the Menu trigger's focus; reopening creates one shader canvas. Desktop at 1440px retains no horizontal overflow and the footer Contact label resolves to Aspekta. No shader or runtime errors were logged. The final dimmed view is captured in `.impeccable/review/mobile-mosaic-3d-final.jpg`.
