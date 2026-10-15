# Renaissance Case Carousel

The new `renaissanceCaseCarousel` block adapts Renaissance’s interactive Stories carousel for global case studies. Its visual reference is the existing Stories media stage, teal stepped overlay, typography and orange navigation signal. Both components share `CarouselTextOverlay`; the new block owns case selection and accessible playback controls.

## Use in local Studio

1. Open a Renaissance page and its **Content** array.
2. Add **Renaissance Case Carousel**.
3. Select up to 12 cases and drag them into the intended order.
4. Optionally enable automatic slide advancement or supply a unique navigation-point name. When a Renaissance Section already owns the anchor, leave the block’s navigation name empty.
5. Preview, then publish the page when ready.

Cases remain in **Globals**. The picker restricts cases to Renaissance, the page language and the case publication flag. The page query resolves the selected references in order and applies the existing website-edition rules for title, subtitle, description, image and video. Empty custom media remains empty; unsuitable or missing references are omitted. Case links always use Renaissance’s locale-free `/cases/<slug>` routes. No inline duplicate case copy is stored.

## Interaction

Previous/next buttons, arrow keys and horizontal swipe change cases. Controls remain outside the animated slide so keyboard focus survives navigation. Automatic slide changes are off by default; when enabled, they occur every seven seconds and pause on hover or keyboard focus. A persistent Pause control stops media and automatic advancement. Video stops offscreen and in hidden tabs. Reduced motion uses posters and immediate transitions. A single case has no previous/next controls; an empty selection renders nothing.

Long copy determines the stage height, and controls reserve their own space. Videos use optimized mobile/desktop sources and a still-image poster. Failed playback falls back to the image; failure of one alternative source does not discard another playable source.

## Local preview and verification

Open <http://localhost:3003/dev/case-carousel>. It exercises the actual PageBuilder and reference projection with five real cases. Standard, reduced-motion and automatic-slide modes are available. This preview performs no CMS writes, is excluded from the sitemap and returns 404 outside development.

Validation includes six schema/query/mapping tests, five existing service regression tests, focused ESLint, Renaissance and 1SP production builds, desktop/mobile inspection, keyboard navigation, automatic advancement, pause, reduced-motion posters and case-detail routing. Existing homepage content is unchanged; this work adds an authoring option rather than placing a new block on a published page.

```sh
pnpm exec tsx --test scripts/renaissance-case-carousel.test.ts scripts/renaissance-services.test.ts
pnpm build:renaissance
pnpm build
```
