# React LCP Optimization: Hero Video Pattern

> A practical guide to optimizing Largest Contentful Paint (LCP) when your hero section uses a poster image → video crossfade pattern in a Next.js / React SSR application.

---

## The Problem

A common hero pattern renders a full-screen background video with a poster image fallback. The poster image is the LCP element — it's the largest visible paint on the initial viewport. If not handled carefully, the video element competes with the poster for bandwidth, delays the paint, and causes jittery playback.

### Typical symptoms

| Symptom | Root Cause |
|---------|-----------|
| Slow LCP (2-4s+) | Video `<source>` elements parsed during poster load, stealing bandwidth |
| Jittery video playback | `preload="auto"` tries to buffer entire video while simultaneously decoding |
| Poster stuck on reload | Cached image `onLoad` fires before React hydrates |
| Seconds-long delay before video starts | `preload="none"` delays all downloading until `play()` is called |

---

## The Solution: Poster-Paint-Gated Video Mount

The core idea: **don't mount the `<video>` element until the poster image has painted.** This ensures the poster gets 100% of the browser's resources during the LCP window, then the video loads immediately after.

### Timeline

```
0ms    → Component mounts. NO <video> in DOM.
0ms    → Poster <img fetchPriority="high" loading="eager"> starts loading.
~200ms → Poster paints → LCP ✅
~200ms → img.onLoad fires → requestAnimationFrame → posterPainted = true
~216ms → <video preload="metadata"> mounts → browser downloads headers
~216ms → autoPlay triggers progressive streaming
450ms  → Reveal animation settles → crossfade to video
```

---

## Implementation

### Step 1: Track when the poster has painted

```tsx
const [posterPainted, setPosterPainted] = useState(false);
```

### Step 2: Set `posterPainted` via the poster's `onLoad` + `requestAnimationFrame`

The `requestAnimationFrame` is critical — it ensures we're past the paint frame that the browser reports as LCP. Anything after that callback is definitionally **outside** the LCP window.

```tsx
<img
  src={posterUrl}
  fetchPriority="high"
  loading="eager"
  onLoad={() => {
    // Wait one animation frame so the browser has committed
    // the poster paint (= the LCP frame).
    requestAnimationFrame(() => setPosterPainted(true));
  }}
  onError={() => setPosterPainted(true)} // Fallback: don't block video forever
/>
```

### Step 3: Handle the cached image race condition ⚠️

**This is the most commonly missed step.**

In SSR (Next.js), the `<img>` is rendered in the server HTML. If the image is cached, the browser fires the native `onload` event **before** React hydrates and attaches the `onLoad` handler. Result: `posterPainted` never becomes `true`, and the video never mounts.

Fix: after mount, check if the image is already `complete`:

```tsx
useEffect(() => {
  if (posterPainted) return;

  // Find the poster image in the DOM
  const img = containerRef.current?.querySelector(
    'img[fetchpriority="high"]'
  ) as HTMLImageElement | null;

  // If the image loaded before React hydrated (from cache),
  // the onLoad handler was never called. Catch it here.
  if (img?.complete && img.naturalWidth > 0) {
    requestAnimationFrame(() => setPosterPainted(true));
  }
}, []); // Runs once after hydration
```

### Step 4: Conditionally mount the `<video>` element

```tsx
const shouldMountVideo = posterPainted;

return (
  <div>
    {/* Poster — always in the DOM, the LCP element */}
    <picture>
      <img ... />
    </picture>

    {/* Video — only enters the DOM after poster has painted */}
    {shouldMountVideo && (
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"  // ← Not "auto", not "none"
      >
        <source src={videoUrl} />
      </video>
    )}
  </div>
);
```

### Step 5: Ensure play effects re-fire when the video mounts

Since the `<video>` mounts asynchronously (after `posterPainted` flips), any `useEffect` that calls `video.play()` must include `shouldMountVideo` in its dependency array. Otherwise, the effect fires before the video exists and never re-runs:

```tsx
useEffect(() => {
  if (!revealComplete || !videoRef.current) return;
  videoRef.current.play().catch(() => {});
}, [revealComplete, shouldMountVideo]); // ← shouldMountVideo triggers re-run
```

### Step 6: Smooth crossfade with CSS transitions

Instead of snapping between poster and video, use CSS opacity transitions:

```tsx
{/* Poster: fades out when video is ready */}
<img
  className={`transition-opacity duration-500 ${
    videoReady ? "opacity-0" : "opacity-100"
  }`}
/>

{/* Video: fades in when ready */}
<video
  className={`transition-opacity duration-700 ${
    videoReady ? "opacity-100" : "opacity-0"
  }`}
/>
```

---

## The `preload` Attribute: Picking the Right Value

| Value | Behavior | When to use |
|-------|----------|-------------|
| `"none"` | Downloads nothing until `play()` is called | ❌ Too slow — video takes seconds to start |
| `"metadata"` | Downloads headers + first frame (~50-100KB) | ✅ Best balance — fast start, no bandwidth waste |
| `"auto"` | Buffers the entire video eagerly | ❌ Too aggressive — causes jitter, steals bandwidth |

**Always use `preload="metadata"`** for hero videos. The browser downloads just enough to know the dimensions and duration, then `autoPlay` triggers progressive streaming where the browser's own buffering logic manages the download/decode balance.

---

## Bonus: Reducing Bundle & Hydration Cost

### Dynamic import non-essential components

Heavy animation libraries (e.g., `motion-plus`) used for typewriters or decorative elements should be dynamically imported to keep them out of the critical JS bundle:

```tsx
import dynamic from "next/dynamic";

const TypewriterRotator = dynamic(
  () => import("../ui/TypewriterRotator"),
  {
    ssr: false,
    loading: () => (
      // CLS-safe skeleton matching the real component's dimensions
      <div style={{ height: "1em", visibility: "hidden" }}>&nbsp;</div>
    ),
  }
);
```

### Skip unnecessary IntersectionObservers

If a component already knows it should animate immediately (it's the hero), don't waste cycles setting up viewport detection:

```tsx
const nullRef = useRef(null);

const { isInView } = useRobustInView(
  animateImmediately ? nullRef : ref, // null ref = no observer created
  { once: true }
);
```

---

## Checklist

- [ ] Poster `<img>` has `fetchPriority="high"` and `loading="eager"`
- [ ] Server-side `<link rel="preload">` tag in `<head>` for the poster image
- [ ] `<video>` is NOT in the initial DOM — gated by `posterPainted`
- [ ] `onLoad` + `requestAnimationFrame` sets `posterPainted`
- [ ] Cached image race handled with `useEffect` + `img.complete` check
- [ ] `preload="metadata"` on the video (not `"auto"` or `"none"`)
- [ ] Play effects include `shouldMountVideo` in dependency arrays
- [ ] `transition-opacity` on both poster and video for smooth crossfade
- [ ] Heavy animation libraries dynamically imported (`ssr: false`)
- [ ] No unnecessary IntersectionObservers on above-the-fold components

---

## References

- [web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp)
- [MDN: HTMLMediaElement.preload](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preload)
- [Next.js: dynamic imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- Implementation: [`HeroVideoComp.tsx`](../components/pagebuilder/Fragments/HeroVideoComp.tsx)
