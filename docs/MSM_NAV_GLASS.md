# MSM navbar glass — handoff / state of play

Working notes for the MSM floating navbar glass effect, so a fresh session can
pick up without re-deriving. Scope: `apps/msm-web` desktop floating nav
(`md:`+) in `components/menu/FrontNavOverlay.tsx`.

## ✅ RESOLVED (2026-06-26): shipped the SVG `GlassSurface` (path A)

Decision made and implemented. The WebGL liquidGL path (B) was dropped because
its core blocker — `html2canvas` can't snapshot the Cloudinary `<video>` hero
(gotcha #4) — is structural, not a bug. The SVG path renders real blur +
refraction directly over the live video backdrop, which is exactly where the
WebGL lens would have looked empty.

What was done:
- Re-activated the SVG glass: removed the `.msmNavSurface` transparency override
  so `GlassSurface` paints with its default `.svg` class (backdrop-filter +
  edge-highlight box-shadow). The inline `backdrop-filter` fix from gotcha #1
  is the keeper in `glass-surface.tsx`.
- Ripped out the WebGL path entirely: deleted `components/ui/liquid-glass-shader.tsx`,
  `public/liquid-gl.js`, `public/html2canvas.min.js` (~269 KB vendor JS), the
  `liquidGlassLensRef` + lens overlay div + `<LiquidGlassShader>`, and the
  `.liquidGlassLens` CSS rules. No `types/liquid-gl.d.ts` needed (never existed
  in msm-web anyway).
- **Refraction fix (the important one):** the earlier "gotcha #1" inline filter
  was `blur(14px) url(#id) saturate(...)`. That leading `blur(14px)` smeared the
  backdrop into a flat frost *before* the displacement map ran, so there were no
  edges left to refract — the glass read as a dull panel with no visible
  refraction. The aquamed reference applies **only** `url(#id) saturate(...)`
  (no backdrop blur; the filter chain's trailing `feGaussianBlur(displace)` is
  the only softening). Removed the `blur()` prefix (and the now-dead
  `backdropBlur` prop) from `glass-surface.tsx`.
- `msmNavGlassSurfaceProps` is the same shader as the hero card (`menuGlassSurfaceProps`)
  but pushed harder for the nav: **`distortionScale: -340`** (vs preset -255, stronger
  bending) and **`tintOpacity: 0.3`** (vs card's 0.42 — lighter so the glass reads more
  transparent and refraction shows over the darker top strip of the hero). The **dark
  multiply tint still gives the bar its "glass body"** — an earlier attempt that dropped it
  to 0.16 read as a flat milky panel; don't zero it.
- Note: the nav and the hero card use **identical filter params** — the card pops more only
  because it floats over the vibrant lower video, while the nav sits over the often-dark top
  strip. Same shader, different backdrop. Lighter nav tint (0.3) is a small legibility risk
  over very bright frames; bump back toward 0.42 if white menu text ever washes out.

## Why "no refraction" — the content-contrast finding (2026-06-26)

Spent real time here because it's counterintuitive. The SVG filter **works** — proven
by pointing the nav's own `url(#glass-filter…)` at high-contrast stripes in the live
preview: dramatic chromatic refraction with colour fringing, identical in quality to
aquamed's glass cards. Capability probe in this Chromium (Electron/Chrome 148):
`backdrop-filter: url(#svgFilter)` with `feDisplacementMap` renders fine (both
`feTurbulence` and `feImage`+data-URI map displaced test stripes).

So refraction not showing on the bar is **not** a code bug. `feDisplacementMap` can only
bend detail that exists in the backdrop. The MSM home hero frame under the bar is a
**soft, shallow-focus portrait video (bokeh)** — almost no high-frequency detail, so the
displacement has nothing to fringe. aquamed's "extremely nice refractions" are mostly its
**glass CARDS over a sharp, textured diver/fish scene**; its nav refraction is actually
subtle too, reading as glass mainly via the dark tint over a bright textured water surface.

Implications:
- The nav now renders correct smoky glass; refraction will visibly fringe over busy/
  high-contrast content and stay subtle over soft frames. That's inherent to the technique.
- For an aquamed-card-level "wow", apply `GlassSurface` to elements sitting over detailed
  imagery (cards/panels over photos/video with texture), not over a soft hero crop.

Caveat for dark frames: `multiply` black tint can over-darken the bar where the hero is
near-black; the white frost (0.21) + inset white box-shadow keep it legible, but worth an
eye if a hero ever goes fully black behind the bar.

## THE nav-refraction bug — backdrop-root isolation (2026-06-27)

Symptom: the hero glass card refracted beautifully, but the **nav showed no bending at
all** over page content. Root cause (CSS, not a tuning issue): `backdrop-filter` only
samples the page up to the nearest **"backdrop root"** ancestor. A `transform`,
`opacity < 1`, `filter`, or `clip-path` on an ANCESTOR creates one. The nav's entrance/
scroll animation lived on `motion.nav`, which therefore always carried
`transform: matrix(...)` + `clip-path` + animated `opacity` — so the inner `GlassSurface`
filtered the *empty nav group* instead of the page. (The hero card works because its
motion transforms are on its **children**, inside the glass — no transformed ancestor.)

Proven live: removing transform/opacity/clip-path from the `motion.nav` ancestor made the
nav instantly refract a high-contrast test band; putting the same transform/clip/opacity on
the GlassSurface element **itself** kept the refraction (transform on the *same* element as
`backdrop-filter` is fine — only an ancestor isolates). `position: fixed` + `z-index` alone
do NOT isolate.

Fix:
- `glass-surface.tsx`: `GlassSurface` is now `forwardRef` (merges the forwarded ref with the
  internal `containerRef`) so it can be a motion element.
- `FrontNavOverlay.tsx`: `const MotionGlassSurface = motion.create(GlassSurface)`. The
  entrance/scroll animation (initial/animate/transition with scale/clipPath/opacity/y) moved
  ONTO `MotionGlassSurface`; the outer `<nav>` is now a plain fixed positioning wrapper with
  **no** transform/opacity/clip. The settled-state instance uses `initial={false}` so the
  `key` remount (which regenerates the displacement map at unscaled size) doesn't re-flash.
- Verified: nav refracts a test band over arbitrary content; menu links intact; entrance
  animation plays; scroll-hide still works (glass → `opacity 0` + `translateY(-100)` on
  scroll down, back on scroll up). No console/build errors.

Known minor edge: the outer `<nav>` still has `iphone-landscape:scale-70` (a transform), so
on tiny landscape phones the bar re-isolates and won't refract — acceptable for that case.

## Where the effect actually pops — hero glass card (2026-06-26)

Acting on the content-contrast finding: wrapped the **home hero copy** (`pg-Header.tsx`,
`OneSPHeaderStep`) in a `GlassSurface` card using `cardGlassSurfaceProps` (the aquamed
preset). It floats over the full-bleed hero **video**, which carries real high-frequency
detail — so the refraction fringes visibly (chromatic edge-lensing all around the panel),
exactly like aquamed's cards over the diver/fish scene. Verified desktop (1440px) and
mobile (375px), no console errors; the dark tint doubles as a legibility scrim for the copy.

- `backdrop-filter` works over live `<video>` (it's the *WebGL/html2canvas* path that can't
  snapshot video — gotcha #4 — not this one).
- The card is `width="fit-content" height="auto"` capped at `max-w-[min(92vw,640px)]`, so it
  stays content-sized and responsive.
- Reusable pattern for more "wow": drop `GlassSurface` (`cardGlassSurfaceProps`) on any
  panel/card that sits over textured imagery/video. It will read as flat over soft/low-detail
  backdrops — that's inherent, pick busy backgrounds.

Verification note: the Claude preview tab can go `document.hidden` after cross-origin
navigation, which pauses `<video>` autoplay + rAF animations (hero looks black, nav frozen).
Fix is `preview_stop` + `preview_start` for a fresh foregrounded tab — not a code bug.

The notes below are retained as the historical record of how we got here.

## Goal
A glass/refraction effect on the MSM floating navbar, like the prototype in
`/Users/martin/DEV/mhw-web-aquamed` (sibling repo). MSM page is **dark-first**
with **sharp corners** (global `* { border-radius: 0 }`), so the nav must read
as glass on a dark background.

## Two approaches (both have files in the repo right now)

### A. SVG-filter `GlassSurface` (works, currently de-activated)
- `components/ui/glass-surface.tsx` + `glass-surface.module.css`.
- `feDisplacementMap` + `backdrop-filter`. Chromium/Edge only; Safari/FF use a
  CSS blur fallback baked into the component.
- **Currently wrapped around the nav content** (aquamed structure) but rendered
  with `.msmNavSurface` (transparent bg, no shadow) — i.e. effectively disabled,
  acting only as a structural wrapper while the WebGL lens (B) does the work.
- It DID render real blur+refraction earlier (verified on screen) once the
  gotchas below were fixed.

### B. WebGL `liquidGL` lens (current direction, NOT finished)
- `components/ui/liquid-glass-shader.tsx` + `public/liquid-gl.js` (72 KB lib) +
  `public/html2canvas.min.js` (194 KB). Needs `types/liquid-gl.d.ts` (present in
  aquamed at `types/liquid-gl.d.ts`; **verify it exists in msm-web** — it was
  missing in one check).
- Wired in the nav: `liquidGlassLensRef` → a `.liquidGlassLens fixed ... md:block`
  div, `<LiquidGlassShader containerRef={liquidGlassLensRef} targetRef={navRef} />`.
- liquidGL snapshots the page with **html2canvas** and refracts that snapshot in
  WebGL, syncing a lens overlay to the nav's rect.

## Gotchas already discovered (don't repeat these)

1. **~~`backdrop-filter: var(--filter-id) …` computes to `none` in this app.~~**
   **CORRECTED (2026-06-26): this was a misdiagnosis.** A live test in the msm
   preview showed the CSS-var path resolves identically to the literal
   (`backdrop-filter: var(--f) saturate(2)` → `url("#id") saturate(2)`, NOT
   `none`). The component still sets `backdrop-filter` **inline** purely for
   cascade-robustness, but the value must be `url(#id) saturate(x)` with **no
   `blur()` prefix** — the prefix is what was killing the refraction (see the
   RESOLVED section up top). Whatever caused the original "none" reading, it is
   not reproducible now and is not a reason to pre-blur the backdrop.

2. **`light-dark()` frost didn't paint** (computed transparent) — replaced with
   plain white-alpha frost in the module. Don't reintroduce `light-dark()`.

3. **Displacement map captured at wrong size.** The nav entrance animates via
   `scale`/`clipPath` (transforms); `ResizeObserver` can't see transforms, so the
   SVG map was generated at the scaled intro size and never corrected. Mitigated
   with `key={hasInitialAnimationCompleted ? "settled" : "intro"}` to remount the
   surface once settled.

4. **`html2canvas` cannot snapshot `<video>`** (or canvases/WebGL). The MSM home
   hero is a **Cloudinary video** → liquidGL's snapshot over the hero is
   empty/partial there. Cross-origin Cloudinary frames can also taint the canvas.
   This is the likely reason the WebGL lens "isn't there yet." Options: give MSM
   a static/image hero (or poster) behind the nav, register specific elements as
   dynamic, or accept the lens only looks right over static content.

5. A transient `opacity = 03` (invalid octal) typo crept into `glass-surface.tsx`
   defaults during manual edits and broke parsing — should be `0.93`. Watch for it.

## Current wiring (FrontNavOverlay.tsx)
- imports both `GlassSurface` and `LiquidGlassShader`.
- `msmNavGlassSurfaceProps = { ...menuGlassSurfaceProps, ... }`.
- nav content wrapped in `<GlassSurface className={glassStyles.msmNavSurface}>`.
- `.liquidGlassLens` overlay div + `<LiquidGlassShader>` synced to `navRef`.
- The old grey fill + `backdrop-blur-md` were removed from the `motion.nav`.

## Decision for next session
Pick ONE path and finish it:
- **Finish WebGL liquidGL (B):** verify `types/liquid-gl.d.ts` exists; confirm the
  two vendor scripts load; debug the lens sync/init; **solve the video-hero
  snapshot problem** (biggest blocker) — likely swap the hero behind the nav for a
  static image/poster so html2canvas can capture it.
- **OR fall back to SVG GlassSurface (A):** drop `.msmNavSurface` transparency,
  keep the inline backdrop-filter fix; it's lighter, works over the video hero,
  and already rendered correctly.

## Verify visually
`pnpm --filter msm-web dev` (or the preview tool). Desktop viewport; nav is `md:`+.
Look at the top of the home page where the nav overlaps the hero — that's where
refraction reads. Confirm computed `backdrop-filter` on the glass div is NOT
`none`, and check for an error overlay / console parse errors.
