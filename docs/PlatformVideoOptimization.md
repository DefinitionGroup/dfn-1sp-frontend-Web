# Hero & Carousel Video: Performance, Caching & Bandwidth Deep-Dive

> A component-level audit of every video path in the codebase — what's wasting bandwidth, what's hurting performance, and exactly how to fix each one.

---

## Table of Contents

1. [Current State: Component-by-Component Audit](#current-state)
2. [Problem 1: Carousel Videos Are Wasteful](#problem-1-carousel-videos-are-wasteful)
3. [Problem 2: Preload Strategy Is Only Half-Done](#problem-2-preload-strategy-is-only-half-done)
4. [Problem 3: No Video Preloading Between Carousel Slides](#problem-3-no-video-preloading-between-carousel-slides)
5. [Problem 4: No Duration Cap or Loop Optimization](#problem-4-no-duration-cap-or-loop-optimization)
6. [Problem 5: Browser Caching Is Not Leveraged](#problem-5-browser-caching-is-not-leveraged)
7. [Improvement Plan](#improvement-plan)
8. [Implementation: Responsive Carousel Videos](#implementation-responsive-carousel-videos)
9. [Implementation: Preload Next Slide](#implementation-preload-next-slide)
10. [Implementation: Video Duration Cap](#implementation-video-duration-cap)
11. [Implementation: Edge Video Proxy](#implementation-edge-video-proxy)
12. [Advanced: HLS Adaptive Streaming](#advanced-hls-adaptive-streaming)
13. [Priority Matrix](#priority-matrix)

---

## Current State

### Video Component Inventory

There are **3 components** that render `<video>` elements. Each has different optimization levels:

| Component | File | Usage | Responsive? | Poster? | Pause off-screen? | Preload? |
|-----------|------|-------|-------------|---------|-------------------|----------|
| **HeroVideoComp** | `Fragments/HeroVideoComp.tsx` | pg-Header hero | ✅ 4 variants | ✅ srcSet + picture | ✅ IntersectionObserver | ✅ `<link rel="preload">` |
| **HeaderImageVideoComp2** | `Fragments/pg-HeaderImageVideoComp2.tsx` | Section heroes | ✅ 2 variants (mobile/desktop) | ✅ srcSet + picture | ✅ IntersectionObserver | ⚠️ Only when `isHero` |
| **InteractiveCarousel** | `Fragments/pg-InteractiveCarousel.tsx` | Carousel slides | ❌ Single 1440w | ⚠️ Poster fallback only | ⚠️ `useInView` basic | ❌ None |
| **SmartCarousel (data)** | `data/data-InteractiveCarousel.tsx` | Smart carousel | ❌ Single 1920w(!) | ❌ None | ❌ No pause | ❌ None |

### Bandwidth per page view (estimated)

```
HOMEPAGE (typical)
──────────────────
Hero video (HeroVideoComp):
  - Phone portrait:  ~1.5 MB (360w, eco, 9:16)
  - Desktop:         ~6-10 MB (1280w, good quality)
  - Poster images:   ~100 KB (srcSet responsive)
  = Total: 1.6 – 10.1 MB depending on device

Smart Carousel (5 case studies):
  - Active slide:    ~15-25 MB (1920w, good quality, no mobile variant!)
  - ALL 5 videos:    75-125 MB if all slides auto-rotate
  = Total: 15 – 125 MB (!!)

Interactive Carousel (if present):
  - Active slide:    ~10-18 MB (1440w, good quality)
  - ALL slides:      50-90 MB if all auto-rotate
  = Total: 10 – 90 MB

Page total (worst case): ~225 MB of video bandwidth per visit
```

> [!CAUTION]
> The **Smart Carousel** is serving 1920w video to ALL devices including phones. This single component is likely responsible for the majority of your Cloudinary bandwidth bill.

---

## Problem 1: Carousel Videos Are Wasteful

### Smart Carousel (`data-InteractiveCarousel.tsx`)

```typescript
// Line 224 — no responsive variants, no mobile optimization
<motion.video
  src={optimizedVideoUrl(active.video, { maxWidth: 1920 })}
  // ...
  loop autoPlay muted playsInline
/>
```

**Issues:**
1. **`maxWidth: 1920`** — way too large. Even on a 1440p monitor, 1920w video is overkill for a background with a 0.7 opacity overlay
2. **No mobile variant** — a phone downloads the same 1920w video
3. **No poster image** — video starts loading immediately, no lightweight placeholder
4. **No `preload` attribute** — browser will start downloading the full video immediately
5. **All 5 slides auto-rotate every 5 seconds** — but each slide triggers a new `<video>` element mount with full download

### Interactive Carousel (`pg-InteractiveCarousel.tsx`)

```typescript
// Line 170 — better but still not responsive
<motion.video
  src={optimizedVideoUrl(active.video, {
    maxWidth: 1440,
    quality: "good",
    autoCodec: true,
  })}
  preload="metadata"
/>
```

**Issues:**
1. **`maxWidth: 1440`** — still too large for most viewports
2. **No mobile variant** — same video for phone and desktop
3. **Has poster fallback** ✅ — but only as a separate `<img>` when `!isInView`
4. **No preloading of next slide** — user sees a loading delay on every transition

---

## Problem 2: Preload Strategy Is Only Half-Done

The **hero** has excellent preloading via `HeroPreloadLinks`:

```tsx
// In page.tsx — server component renders <link> tags
<HeroPreloadLinks
  heroPosterDesktop={posterDesktop}
  heroPosterMobile={posterMobile}
  heroPosterDesktopSrcSet={srcSetDesktop}
  // ...
/>
```

But the **carousel** has zero preloading. When the carousel auto-rotates to the next slide, the browser must:
1. Start a new HTTP connection to Cloudinary
2. Download ~10-25 MB of video
3. Buffer enough to start playback

This means **2-5 seconds of blank/frozen content** between slides on slower connections.

---

## Problem 3: No Video Preloading Between Carousel Slides

Both carousel components mount a single `<video>` element for the active slide. When the slide changes, the previous video is unmounted and a new one is mounted:

```typescript
// AnimatePresence remounts the entire slide div including <video>
<AnimatePresence initial={false} custom={direction}>
  <motion.div key={currentIndex}>
    {active.video && <motion.video src={...} />}
  </motion.div>
</AnimatePresence>
```

**Every slide transition = full video download from scratch.** There's no prefetching of the next slide's video.

---

## Problem 4: No Duration Cap or Loop Optimization

Background hero/carousel videos are typically 10-30 seconds. But Cloudinary allows you to **trim** videos via URL transforms:

```
/upload/du_8,so_0/   → first 8 seconds only
```

A 30-second video at 1280w good quality might be 15 MB. Trimmed to 8 seconds, it's ~4 MB. The user never notices because it loops.

This is currently **not used anywhere** in the codebase.

---

## Problem 5: Browser Caching Is Not Leveraged

Cloudinary CDN sets `Cache-Control` headers, but:

1. **Each transform URL is unique** — `q_auto,f_auto,vc_auto,ac_none,w_1920` produces a specific cached variant on Cloudinary's CDN
2. **Browser disk cache** works for repeat visits — but the user's browser must have visited the exact same transform URL before
3. **No edge proxy** — every page view re-fetches from Cloudinary CDN. Even though Cloudinary has edge nodes, there's extra latency vs. serving from your own domain's CDN
4. **No Service Worker** — a SW could cache video segments for instant replay on repeat visits

---

## Improvement Plan

### Quick wins (minimal code changes)

| # | Action | Bandwidth Saved | Files Changed |
|---|--------|----------------|---------------|
| 1 | **Cap SmartCarousel to `maxWidth: 1280`** (was 1920) | ~30-40% | `data-InteractiveCarousel.tsx` line 224 |
| 2 | **Add mobile variant to carousels** | ~60-70% on mobile | Both carousel components |
| 3 | **Add `preload="none"` to carousel videos** | Prevents eager download of non-visible slides | Both carousel components |
| 4 | **Add poster image to SmartCarousel** | Prevents video-as-LCP, instant visual | `data-InteractiveCarousel.tsx` |
| 5 | **Add `du_8` duration cap to background videos** | ~50-70% per video | `utils.ts` transform function |
| 6 | **Only load active slide's video** | Eliminates wasted downloads | Already done (only active renders) ✅ |

### Medium-term (architecture changes)

| # | Action | Impact |
|---|--------|--------|
| 7 | **Prefetch next slide's video** via `<link rel="preload">` | No delay on slide transitions |
| 8 | **Edge video proxy** via Next.js rewrite | Long `s-maxage` on your domain's CDN |
| 9 | **Pause off-screen carousel videos** | Saves CPU + prevents background bandwidth |
| 10 | **IntersectionObserver for carousel** | Don't even mount video until carousel is near viewport |

### Advanced (bigger lift)

| # | Action | Impact |
|---|--------|--------|
| 11 | **HLS adaptive streaming** via `sp_auto` | Automatic quality switching per network speed |
| 12 | **Service Worker video cache** | Instant replay on repeat visits |

---

## Implementation: Responsive Carousel Videos

### Add to `utils/utils.ts`

```typescript
/**
 * Generate responsive video sources for carousels.
 * Returns mobile + desktop source objects for use with <source media="...">.
 */
export const getCarouselVideoSources = (
  url?: string
): { mobile: string | undefined; desktop: string | undefined; poster: string | undefined } => {
  if (!url) return { mobile: undefined, desktop: undefined, poster: undefined };

  return {
    mobile: optimizedVideoUrl(url, {
      maxWidth: 640,
      quality: "eco",
      autoCodec: true,
    }),
    desktop: optimizedVideoUrl(url, {
      maxWidth: 1280, // was 1920 in SmartCarousel, 1440 in InteractiveCarousel
      quality: "good",
      autoCodec: true,
    }),
    poster: cloudinaryPosterUrl(url, { maxWidth: 1280 }),
  };
};
```

### Apply to SmartCarousel

```diff
// data/data-InteractiveCarousel.tsx

- import { assetUrl, optimizedVideoUrl } from "@/utils/utils";
+ import { assetUrl, getCarouselVideoSources, cloudinaryPosterUrl } from "@/utils/utils";

// In the render:
- {active.video ? (
-   <motion.video
-     src={optimizedVideoUrl(active.video, { maxWidth: 1920 })}
-     loop autoPlay muted playsInline
-   />

+ {active.video ? (
+   <motion.video
+     loop autoPlay muted playsInline
+     preload="none"
+     poster={cloudinaryPosterUrl(active.video, { maxWidth: 1280 }) || ""}
+     initial={{ scale: 1.3, opacity: 0.7 }}
+     animate={{ scale: 1, opacity: 0.7 }}
+     transition={{ duration: 1.6 }}
+     className="absolute inset-0 w-full h-full overflow-hidden object-cover"
+   >
+     <source
+       src={optimizedVideoUrl(active.video, { maxWidth: 640, quality: "eco", autoCodec: true })}
+       media="(max-width: 768px)"
+     />
+     <source
+       src={optimizedVideoUrl(active.video, { maxWidth: 1280, quality: "good", autoCodec: true })}
+       media="(min-width: 769px)"
+     />
+   </motion.video>
```

**Impact:** Mobile users download 640w eco instead of 1920w good = **~80% bandwidth reduction on mobile**.

---

## Implementation: Preload Next Slide

Prefetch the next slide's video and poster while the current slide is playing:

```typescript
// Add to carousel component (SmartCarousel or InteractiveCarousel)

const nextIndex = (currentIndex + 1) % carouselItems.length;
const nextItem = carouselItems[nextIndex];

// In the JSX, add invisible preload hints:
{nextItem?.video && (
  <>
    {/* Preload next poster so the transition is instant */}
    <link
      rel="preload"
      as="image"
      href={cloudinaryPosterUrl(nextItem.video, { maxWidth: 1280 }) || ""}
    />
    {/* Preload next video metadata (not full download) */}
    <link
      rel="preload"
      as="video"
      href={optimizedVideoUrl(nextItem.video, { maxWidth: 1280, quality: "good", autoCodec: true }) || ""}
    />
  </>
)}
```

**Or using imperative prefetch (more control, no SSR issues):**

```typescript
// Prefetch next slide's video during idle time
useEffect(() => {
  if (!carouselItems.length) return;

  const nextIdx = (currentIndex + 1) % carouselItems.length;
  const nextVideo = carouselItems[nextIdx]?.video;
  if (!nextVideo) return;

  const prefetchUrl = optimizedVideoUrl(nextVideo, {
    maxWidth: 1280,
    quality: "good",
    autoCodec: true,
  });

  if (!prefetchUrl) return;

  // Use a hidden video element to trigger browser cache loading
  const prefetchVideo = document.createElement("video");
  prefetchVideo.preload = "metadata";  // Just headers + first frame
  prefetchVideo.src = prefetchUrl;
  prefetchVideo.muted = true;

  // Cleanup if slide changes before prefetch completes
  return () => {
    prefetchVideo.src = "";
    prefetchVideo.load();
  };
}, [currentIndex, carouselItems]);
```

**Impact:** Near-instant slide transitions instead of 2-5 second loading delays.

---

## Implementation: Video Duration Cap

### Add duration cap to transform functions

```typescript
// utils/utils.ts — add duration option to optimizedVideoUrl

export const optimizedVideoUrl = (
  url?: string,
  options?: {
    maxWidth?: number;
    quality?: "auto" | "eco" | "good" | "best";
    autoCodec?: boolean;
    withAudio?: boolean;
    portrait?: boolean;
    aspectRatio?: string;
    /** Maximum duration in seconds. Cloudinary trims from start. */
    maxDuration?: number;
  }
): string | undefined => {
  // ... existing code ...

  // Duration cap — trim video to save bandwidth on short loops
  if (options?.maxDuration) {
    transforms.push(`du_${options.maxDuration}`);
  }

  // ... rest of function
};
```

### Usage in components

```typescript
// Hero videos — 8-10 second loops are plenty
optimizedVideoUrl(videoSrc, {
  maxWidth: 1280,
  quality: "good",
  autoCodec: true,
  maxDuration: 10,  // Trim to first 10 seconds
})

// Carousel slides — 6 second auto-rotation means user sees at most 6s
optimizedVideoUrl(active.video, {
  maxWidth: 1280,
  quality: "good",
  autoCodec: true,
  maxDuration: 8,  // Trim to 8 seconds (slightly more than 6s rotation)
})
```

**Impact:** A 30-second video trimmed to 8 seconds = **~73% bandwidth reduction per video**.

---

## Implementation: Edge Video Proxy

Proxy Cloudinary videos through your own domain using Next.js rewrites. This gives you:
- Videos served from **your CDN** (Vercel edge, same domain = no CORS, no extra DNS)
- Custom **`Cache-Control` headers** with long `s-maxage`
- **No Cloudinary bandwidth on cache hits** (Vercel edge serves from cache)

### Option A: Next.js Rewrite (simplest)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... existing config
  async rewrites() {
    return [
      {
        source: "/media/video/:path*",
        destination: "https://res.cloudinary.com/YOUR_CLOUD/video/upload/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/media/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=604800, stale-while-revalidate=86400",
            // 7 days edge cache, 1 day stale-while-revalidate
          },
        ],
      },
    ];
  },
};
```

Then update the transform function to use your domain:

```typescript
// utils/utils.ts
const CLOUDINARY_VIDEO_ORIGIN = "https://res.cloudinary.com/YOUR_CLOUD/video/upload";
const PROXY_VIDEO_PREFIX = "/media/video";

export const proxyVideoUrl = (cloudinaryUrl?: string): string | undefined => {
  if (!cloudinaryUrl) return undefined;
  return cloudinaryUrl.replace(CLOUDINARY_VIDEO_ORIGIN, PROXY_VIDEO_PREFIX);
};
```

### Option B: Route Handler (full control)

```typescript
// app/media/video/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const cloudinaryPath = path.join("/");
  const cloudinaryUrl = `https://res.cloudinary.com/YOUR_CLOUD/video/upload/${cloudinaryPath}`;

  const response = await fetch(cloudinaryUrl, {
    headers: {
      Range: request.headers.get("Range") || "",
    },
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "video/mp4",
      "Content-Length": response.headers.get("Content-Length") || "",
      "Content-Range": response.headers.get("Content-Range") || "",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
```

> [!WARNING]
> **Option A (rewrites) is recommended** for video because it's transparent — Vercel proxies the request at the edge without hitting your serverless functions. Option B uses serverless function compute for every video chunk request, which is expensive.

**Impact:** After initial cache warm-up, repeat visitors get **zero Cloudinary bandwidth** — served entirely from Vercel edge.

---

## Advanced: HLS Adaptive Streaming

For the ultimate video experience, Cloudinary's `sp_auto` can generate HLS (HTTP Live Streaming) manifests that automatically adapt quality to the user's network speed.

### Why consider HLS

| Metric | Progressive (current) | HLS Adaptive |
|--------|----------------------|--------------|
| Startup time | Waits to buffer enough | Starts with low quality instantly |
| Network drops | Video freezes/buffers | Seamlessly drops quality |
| Bandwidth waste | Full quality downloaded | Only what's needed per segment |
| File size | One fixed file per variant | Many small segments (~2-6s each) |

### Why HLS might NOT be worth it for your case

| Factor | Assessment |
|--------|------------|
| **Video length** | Hero videos are short loops (10-30s). HLS shines for >30s content. |
| **Browser support** | Native HLS only in Safari. Chrome/Firefox need hls.js library (~50 KB). |
| **Complexity** | Requires Cloudinary Video Player or custom hls.js integration. |
| **Infrastructure** | `sp_auto` generates multiple renditions on Cloudinary — no build step. |
| **Looping** | HLS looping requires custom handling at the manifest level. |

### Verdict

> [!NOTE]
> For short background videos (≤15 seconds), **progressive download with responsive variants + duration cap** gives you 90% of HLS's benefits without the complexity. Consider HLS only if you add longer video content (case study walkthroughs, testimonials) in the future.

### If you do want HLS

```typescript
// Cloudinary HLS URL
const hlsUrl = videoSrc?.replace(
  "/upload/",
  "/upload/sp_auto/"
).replace(/\.(mp4|mov|webm)$/i, ".m3u8");

// With hls.js for cross-browser support:
useEffect(() => {
  if (!hlsUrl || !videoRef.current) return;
  
  if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
    // Safari: native HLS
    videoRef.current.src = hlsUrl;
  } else if (window.Hls?.isSupported()) {
    // Chrome/Firefox: hls.js
    const hls = new Hls({ maxBufferLength: 10 });
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoRef.current);
    return () => hls.destroy();
  } else {
    // Fallback: progressive
    videoRef.current.src = optimizedVideoUrl(videoSrc, { maxWidth: 1280 });
  }
}, [hlsUrl]);
```

---

## Priority Matrix

### Ranked by bandwidth impact × implementation effort

| Priority | Action | Bandwidth Savings | Effort | Component |
|----------|--------|-------------------|--------|-----------|
| **🔴 P0** | Cap SmartCarousel to 1280w (was 1920) | 30-40% | 1 line | `data-InteractiveCarousel` |
| **🔴 P0** | Add mobile `<source>` to SmartCarousel | 60-80% on mobile | ~15 lines | `data-InteractiveCarousel` |
| **🔴 P0** | Add poster image to SmartCarousel | Perceived performance | ~5 lines | `data-InteractiveCarousel` |
| **🟡 P1** | Add `du_8` duration cap to all background videos | 50-70% per video | ~10 lines in utils | `utils.ts` + all video comps |
| **🟡 P1** | Add mobile `<source>` to InteractiveCarousel | 60-80% on mobile | ~15 lines | `pg-InteractiveCarousel` |
| **🟡 P1** | Add `preload="none"` to non-active carousel videos | Prevents eager download | 1 attr each | Both carousels |
| **🟢 P2** | Prefetch next carousel slide (poster + metadata) | Perceived perf | ~20 lines | Both carousels |
| **🟢 P2** | Pause carousel video when off-screen | CPU + indirect bandwidth | ~15 lines | `data-InteractiveCarousel` |
| **🔵 P3** | Edge video proxy via rewrites | Cache hits = 0 Cloudinary BW | Config change | `next.config.ts` |
| **🔵 P3** | Add InteractiveCarousel poster using `cloudinaryPosterUrl` | Has partial ✅, needs srcSet | ~10 lines | `pg-InteractiveCarousel` |
| **⚪ P4** | HLS adaptive streaming | Network-adaptive quality | Major lift | New integration |

### Expected combined impact

| Scenario | Before (per page view) | After Phase P0+P1 | Reduction |
|----------|----------------------|-------------------|-----------|
| Mobile homepage | ~35 MB | ~5 MB | **85%** |
| Desktop homepage | ~50 MB | ~15 MB | **70%** |
| Mobile with carousel | ~80 MB | ~8 MB | **90%** |

---

## Quick Checklist

| Question | Answer |
|----------|--------|
| **What's the single worst bandwidth offender?** | SmartCarousel: 1920w video, no mobile variant, no poster |
| **Cheapest fix with biggest impact?** | Change `maxWidth: 1920` → `1280` + add mobile `<source>` (3 lines) |
| **Should we use HLS?** | Not yet — progressive + responsive + duration cap covers 90% of the benefit for short loops |
| **Should we proxy through Vercel?** | Yes (P3) — `rewrites` in `next.config.ts` + cache headers eliminates repeat Cloudinary bandwidth |
| **Should we add duration caps?** | Yes — `du_8` on all looping background videos = ~50-70% savings each |
| **Will prefetching next slide help?** | Yes — eliminates the 2-5s blank on slide transitions |
