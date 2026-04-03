# Cloudinary Asset Strategy: Bandwidth, Performance & Cost Optimization

> A review of how the platform uses Cloudinary today, what's working, what's costing bandwidth, and alternative strategies — including the "download to Vercel at build time" approach.

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [What's Working Well](#whats-working-well)
3. [Bandwidth Audit: Where the Bytes Go](#bandwidth-audit-where-the-bytes-go)
4. [Improvement Opportunities](#improvement-opportunities)
5. [Strategy: Build-Time Download to Vercel](#strategy-build-time-download-to-vercel)
6. [Strategy: Cloudinary Eager Transforms + CDN Proxy](#strategy-cloudinary-eager-transforms--cdn-proxy)
7. [Strategy: Vercel Blob as Video CDN](#strategy-vercel-blob-as-video-cdn)
8. [Strategy Comparison](#strategy-comparison)
9. [Recommended Approach](#recommended-approach)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Current Architecture

### How assets flow today

```
SANITY STUDIO                           CLOUDINARY CDN
─────────────                           ──────────────
Editor uploads image/video        →     Stored at res.cloudinary.com
via sanity-plugin-cloudinary             with public_id, secure_url

                    ↓ GROQ fetch returns secure_url

PAGE ROUTE / SERVER COMPONENT           BROWSER
─────────────────────────────           ───────
assetUrl(block.media) resolves    →     <img> / <video> fetches from
to raw Cloudinary secure_url            Cloudinary CDN on every page view

                    ↓ Transform functions inject URL segments

optimizedVideoUrl(url, options)   →     https://res.cloudinary.com/.../upload/
                                        q_auto,f_auto,vc_auto,ac_none,w_1280/
                                        v123456/my-hero-video.mp4
```

### Key files in the pipeline

| File | Role |
|------|------|
| [`utils/utils.ts`](file:///Users/martin/DEV/1SP-dfn-1sp-frontend/utils/utils.ts) | Core transform functions: `optimizedVideoUrl`, `cloudinaryPosterUrl`, `cloudinaryPosterSrcSet`, `optimizedPortraitVideoUrl` |
| [`sanity/lib/image.ts`](file:///Users/martin/DEV/1SP-dfn-1sp-frontend/sanity/lib/image.ts) | `resolveImageUrl` — picks Cloudinary URL, applies `q_auto,f_auto` transforms |
| [`lib/hero-media.ts`](file:///Users/martin/DEV/1SP-dfn-1sp-frontend/lib/hero-media.ts) | `getHeroMediaVariants` — generates 4 responsive video+poster variants |
| [`lib/hero-utils.tsx`](file:///Users/martin/DEV/1SP-dfn-1sp-frontend/lib/hero-utils.tsx) | `HeroPreloadLinks` — `<link rel="preload">` for hero poster LCP |
| [`next.config.ts`](file:///Users/martin/DEV/1SP-dfn-1sp-frontend/next.config.ts) | `images.remotePatterns` allows `res.cloudinary.com`, enables AVIF/WebP |

### Transform functions in detail

#### `optimizedVideoUrl(url, options)`
Injects Cloudinary URL transformations between `/upload/` and the version segment:

| Parameter | Transform | Effect |
|-----------|-----------|--------|
| `quality: "auto"` | `q_auto` | Intelligent compression (40-70% smaller) |
| `quality: "eco"` | `q_auto:eco` | Aggressive compression (mobile videos) |
| (always) | `f_auto` | Best format per browser (VP9/HEVC/H.264) |
| `autoCodec: true` | `vc_auto` | Best video codec per browser (AV1/VP9/H.265) |
| `withAudio: false` | `ac_none` | Strips audio (saves ~20-30%) |
| `maxWidth: 1280` | `w_1280` | Resolution cap |
| `portrait: true` | `c_fill,g_auto,ar_9:16` | AI crop to portrait |

#### `cloudinaryPosterUrl(url, options)`
Converts a video URL into a poster image by changing the file extension to `.jpg` and injecting `so_0` (first frame) or `so_auto` (AI-selected frame).

#### `getHeroMediaVariants(videoUrl)`
The responsive system that generates **4 variant sets**:

| Variant | Breakpoint | Video | Poster | Quality |
|---------|-----------|-------|--------|---------|
| `phone-portrait` | ≤767px portrait | 360w, 9:16, eco | 320-480w srcSet | Aggressive |
| `phone-landscape` | ≤767px landscape | 768w, 16:9, eco | 480-768w srcSet | Aggressive |
| `tablet` | 768-1023px | 1024w, good | 768-1024w srcSet | Balanced |
| `desktop` | ≥1024px | 1280w, good | 960-1440w srcSet | Balanced |

---

## What's Working Well

### ✅ URL-based transforms (zero processing overhead)

All transforms happen at the URL level — no build step, no server-side processing. Cloudinary's CDN caches the transformed result after the first request. This is elegant and zero-maintenance.

### ✅ Responsive media variants

The `getHeroMediaVariants` system sends dramatically smaller videos to mobile devices. A portrait phone gets a 360w eco-quality 9:16 crop instead of a 1280w desktop video — often 5-10x smaller.

### ✅ Poster-paint-gated LCP

The `HeroPreloadLinks` + `posterPainted` state pattern ensures the poster image paints first (good LCP), then the video loads after.

### ✅ `f_auto` + `vc_auto` format negotiation

Cloudinary automatically serves VP9/WebM to Chrome, HEVC to Safari, and H.264 fallback — no manual format management needed.

### ✅ Audio stripping for background videos

`ac_none` saves ~20-30% on muted hero/background videos. This is applied by default.

---

## Bandwidth Audit: Where the Bytes Go

### The cost model

Cloudinary charges credits for three things equally:
- **1 GB storage = 1 credit**
- **1 GB bandwidth = 1 credit**
- **1,000 transformations = 1 credit**

Video is the dominant cost driver because:
1. Files are 100-1000x larger than images
2. Every page view triggers a CDN bandwidth hit
3. On-the-fly transforms incur both transformation + bandwidth credits

### Current bandwidth consumers (ranked)

```
HIGHEST BANDWIDTH
─────────────────
1. 🎥 Hero videos (pg-Header)
   • 4 variants × every homepage visit
   • Even at eco quality, mobile video ≈ 2-5 MB, desktop ≈ 8-15 MB
   • Poster images add another 50-200 KB per variant

2. 🎥 Case study videos (InteractiveCarousel, Approach sections)
   • optimizedVideoUrl with maxWidth: 1280 or 960
   • No portrait variants — same video served to all devices

3. 🖼 Logo images (UnitLogoGrid, PageBuilderLogoFloat)
   • Many small images, but served as raw Cloudinary URLs
   • No transforms applied (assetUrl returns raw secure_url)
   • Not using next/image optimization

4. 🖼 Case study main images
   • Used in cards, galleries, carousel thumbnails
   • Raw secure_url in many places, no width constraints

5. 🎥 People showcase videos (PeopleShowcaseHero)
   • Full video per person, no responsive variants

LOWEST BANDWIDTH
```

### Key findings

| Issue | Impact | Location |
|-------|--------|----------|
| **Raw `assetUrl()` without transforms** | Full-resolution images served to all devices | Logo grids, case cards, expandable cards |
| **No `next/image` for most images** | Missing AVIF/WebP conversion, no responsive sizing | `pg-PageBuilderLogoFloat`, `pg-PageBuilderPersonioJobs` |
| **Hero video: 4 variants always generated** | Each first-request triggers an on-the-fly transform | `hero-media.ts` variants |
| **No eager transforms configured** | Every unique transform URL = first-visitor cold transform | All video transforms |
| **Case study videos have no responsive variants** | Desktop-size video served to mobile | `pg-InteractiveCarousel`, `pg-ApproachSection` |
| **No bitrate cap on videos** | Cloudinary may serve unnecessarily high bitrate | All video transforms |
| **`minimumCacheTTL: 60` in next.config** | `next/image` re-fetches from Cloudinary every 60s | All `next/image` usage |

---

## Improvement Opportunities

### 1. Add Cloudinary transforms to ALL image URLs

**Problem:** Many components use `assetUrl()` which returns the raw `secure_url` — full resolution, original format.

**Fix:** Create a centralized `optimizedImageUrl()` function similar to `optimizedVideoUrl`:

```typescript
// utils/utils.ts — proposed new function
export const optimizedImageUrl = (
  url?: string,
  options?: { maxWidth?: number; quality?: "auto" | "eco" }
): string | undefined => {
  if (!url || !url.includes("/upload/")) return url;

  const transforms = [
    options?.quality === "eco" ? "q_auto:eco" : "q_auto",
    "f_auto",  // AVIF/WebP/JPEG based on browser
  ];
  if (options?.maxWidth) transforms.push(`w_${options.maxWidth}`);

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
};
```

**Impact:** Could reduce image bandwidth by 40-70% across logo grids, case cards, and all non-hero images.

---

### 2. Use `next/image` for all non-video Cloudinary assets

**Problem:** Components like `pg-PageBuilderLogoFloat` and `pg-PageBuilderPersonioJobs` use raw `<img>` tags.

**Fix:** Replace with `next/image` which provides:
- AVIF/WebP automatic format negotiation (configured in `next.config.ts`)
- Responsive `srcSet` generation
- Lazy loading by default
- Client-side cache with `minimumCacheTTL`

```tsx
// Before (current)
<img src={logo.url} alt={logo.name} />

// After
<Image
  src={logo.url}
  alt={logo.name}
  width={logo.width}
  height={logo.height}
  sizes="(max-width: 768px) 25vw, 150px"
/>
```

> [!WARNING]
> When `next/image` is used with Cloudinary URLs, Next.js fetches from Cloudinary, optimizes, and serves from its own image CDN. This means you're paying Cloudinary bandwidth for the initial fetch but then serving from Vercel's cache. **Increase `minimumCacheTTL`** from 60s to at least `86400` (24 hours) or `604800` (7 days) to reduce re-fetches.

---

### 3. Add bitrate caps to video transforms

**Problem:** Without `br_` constraints, Cloudinary may serve videos at unnecessarily high bitrates.

**Fix:** Add bitrate caps to video transform functions:

```typescript
// Hero background videos (visual fidelity matters less)
optimizedVideoUrl(url, { maxWidth: 1280, quality: "good", bitrate: "2000k" })

// Mobile portrait videos (aggressive compression)
optimizedPortraitVideoUrl(url, { maxWidth: 360, quality: "eco", bitrate: "800k" })
```

---

### 4. Extend responsive variants to case study videos

**Problem:** `pg-InteractiveCarousel` and case study sections serve the same video size to all devices.

**Fix:** Apply the same `getHeroMediaVariants` pattern — or at minimum a mobile/desktop split:

```typescript
// Current: one size fits all
src={optimizedVideoUrl(video, { maxWidth: 1280 })}

// Proposed: responsive
const videoUrl = isMobile
  ? optimizedVideoUrl(video, { maxWidth: 640, quality: "eco" })
  : optimizedVideoUrl(video, { maxWidth: 1280, quality: "good" });
```

---

### 5. Increase `minimumCacheTTL` for `next/image`

**Current:** 60 seconds — means the Vercel image optimizer re-fetches from Cloudinary every minute.

**Recommended:** 7 days minimum for assets that rarely change:

```typescript
// next.config.ts
images: {
  minimumCacheTTL: 604800,  // 7 days (was 60s)
}
```

---

## Strategy: Build-Time Download to Vercel

> *"Upload to Cloudinary → transform to 3 variants (phone, small, big) → download to Vercel at build time"*

### How it would work

```
BUILD TIME
──────────
1. next build starts
2. Custom build script runs:
   a. Queries Sanity for all pages with video hero blocks
   b. For each video, constructs 3 Cloudinary transform URLs:
      - phone:   w_360, q_auto:eco, ar_9:16, f_mp4
      - tablet:  w_768, q_auto:good, f_mp4
      - desktop: w_1280, q_auto:good, f_mp4
   c. Downloads each transformed video via HTTP
   d. Saves to public/assets/videos/{hash}-{variant}.mp4
3. PageBuilder components reference local /assets/videos/... URLs
4. Videos are deployed as static files on Vercel's edge CDN

RUNTIME
───────
- Browser requests video from yourdomain.com/assets/videos/hero-phone.mp4
- Served from Vercel edge CDN — zero Cloudinary bandwidth
```

### Viability assessment

| Factor | Verdict | Details |
|--------|---------|---------|
| **Build time** | ⚠️ Likely painful | Downloading 10 videos × 3 variants = 30 files. At ~5-15 MB each = 150-450 MB download during build. Adds 2-10 minutes to build time. |
| **Deployment size** | ⚠️ Very large | Vercel has repo/deployment size limits. 500 MB of video in `/public` would push against the **1 GB deployment limit** (Hobby) or **13 GB** (Pro). |
| **ISR compatibility** | ❌ Breaks ISR | If an editor changes a hero video in Sanity, ISR can regenerate the page HTML in 60s — but the video file would only update on the next full build/deploy. |
| **Content freshness** | ❌ Stale until deploy | New videos or video changes require a full build + deploy cycle. This defeats the purpose of ISR. |
| **Cloudinary bandwidth** | ✅ Near zero at runtime | Only build-time downloads consume Cloudinary bandwidth. Each build × 3 variants = ~30 requests. |
| **CDN performance** | ✅ Excellent | Vercel edge serves static files with optimal caching (immutable headers, global CDN). |
| **Complexity** | ⚠️ High | Custom build scripts, hash-based filenames, manifest file mapping, cache invalidation logic. |

### Conclusion on build-time download

> [!WARNING]
> **Not recommended as the primary strategy.** The tight coupling to build/deploy breaks ISR's content freshness model and creates massive deployment artifacts. Every new deploy would re-download all videos even if only a typo changed.

**Where it DOES make sense:**
- A **small, stable set of hero videos** (e.g., 2-3 homepage heroes that rarely change)
- A **marketing landing page** with a fixed set of assets
- If you're willing to accept "video updates require a deploy"

---

## Strategy: Cloudinary Eager Transforms + CDN Proxy

### The hybrid approach (recommended for your case)

Instead of downloading videos at build time, **pre-generate the transform variants on Cloudinary** so the first visitor never triggers an expensive on-the-fly transform. Then optionally proxy through Vercel's edge for caching.

```
UPLOAD TIME (via Sanity plugin or webhook)
──────────────────────────────────────────
1. Editor uploads video to Cloudinary via Sanity
2. Sanity webhook → your /api/media-optimize endpoint
3. Endpoint calls Cloudinary explicit API with eager transforms:
   - phone:   w_360, q_auto:eco, ar_9:16, c_fill, g_auto, vc_h265, ac_none
   - tablet:  w_768, q_auto:good, vc_h265, ac_none
   - desktop: w_1280, q_auto:good, vc_h265, ac_none
   - poster:  so_0, w_1280, f_jpg, q_auto
4. Cloudinary processes variants asynchronously
5. Webhook notifies when done → variants are warm on CDN

RUNTIME (zero transform cost)
─────────────────────────────
- Browser requests transform URL (same as current implementation)
- Cloudinary CDN serves pre-generated variant (cache HIT)
- No on-the-fly transformation cost
```

### Implementation sketch

```typescript
// app/api/media-optimize/route.ts
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  const { publicId, resourceType } = await req.json();

  if (resourceType === "video") {
    await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      resource_type: "video",
      eager: [
        // Phone portrait
        { width: 360, aspect_ratio: "9:16", crop: "fill", gravity: "auto",
          quality: "auto:eco", video_codec: "auto", audio_codec: "none", format: "mp4" },
        // Tablet
        { width: 768, quality: "auto:good", video_codec: "auto",
          audio_codec: "none", format: "mp4" },
        // Desktop
        { width: 1280, quality: "auto:good", video_codec: "auto",
          audio_codec: "none", format: "mp4" },
        // Poster image (first frame)
        { width: 1280, start_offset: "0", format: "jpg", quality: "auto" },
      ],
      eager_async: true,
      eager_notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/media-optimize/ready`,
    });
  }

  return Response.json({ status: "processing" });
}
```

### Why this works for your architecture

| Factor | Benefit |
|--------|---------|
| ISR compatible | Video URLs don't change, they're always Cloudinary transform URLs |
| No deployment size impact | Videos stay on Cloudinary, not in your repo |
| First-visitor performance | Variants are pre-generated, no cold transform |
| Content freshness | Editor uploads new video → webhook fires → new variants ready in minutes |
| Existing code unchanged | Same `optimizedVideoUrl()` functions work as-is |

---

## Strategy: Vercel Blob as Video CDN

A middle-ground: store the pre-generated variants in Vercel Blob (not in `/public`, not on Cloudinary at runtime).

```
UPLOAD / BUILD HOOK
────────────────────
1. Video uploaded to Cloudinary
2. Webhook downloads 3 transform variants
3. Uploads each to Vercel Blob storage
4. Stores Blob URLs in a manifest (or Sanity custom field)

RUNTIME
───────
- Components read Blob URLs instead of Cloudinary URLs
- Served from Vercel's global edge CDN
- Zero Cloudinary bandwidth at runtime
```

### Vercel Blob pricing context

| Metric | Cost |
|--------|------|
| Storage | $0.023 / GB / month |
| Data Transfer | $0.05 / GB |
| Edge cache limit | Files ≤ 512 MB only |

### 10 hero videos × 3 variants = 30 files

Assuming ~5 MB average per variant:
- **Storage:** 150 MB = $0.003/month (negligible)
- **Bandwidth:** 150 MB × 1,000 views/month = ~150 GB → **$7.50/month**
- Compare to Cloudinary: 150 GB = 150 credits → depends on your plan tier

### Verdict

> [!NOTE]
> Vercel Blob is viable for a small, stable set of videos but adds significant complexity. It's most useful if Cloudinary bandwidth costs are a real pain point and you want to completely decouple runtime delivery from Cloudinary.

---

## Strategy Comparison

| | Current (Cloudinary CDN) | Build-Time Download | Eager Transforms | Vercel Blob |
|---|---|---|---|---|
| **Bandwidth cost** | High (every view = Cloudinary) | Near zero runtime | Medium (Cloudinary CDN, but cached) | Low (Vercel transfer) |
| **Transform cost** | High (first-visitor cold) | Zero (build-time only) | **Near zero** (pre-warmed) | Zero (pre-generated) |
| **Content freshness** | ✅ 60s ISR | ❌ Deploy only | ✅ Webhook-driven | ⚠️ Webhook + upload |
| **Build time impact** | None | ⚠️ 2-10 min longer | None | None |
| **Deployment size** | None | ⚠️ +500 MB | None | None |
| **Implementation effort** | Done ✅ | High | Medium | High |
| **ISR compatibility** | ✅ Full | ❌ Broken | ✅ Full | ✅ Full |
| **Existing code changes** | None | Major rewrite | **Minimal** | Major rewrite |

---

## Recommended Approach

### Phase 1: Quick wins (zero architecture change)

These can be done today with minimal code changes:

| Action | Bandwidth Savings | Effort |
|--------|-------------------|--------|
| Increase `minimumCacheTTL` to 604800 (7 days) | ~50% reduction in `next/image` → Cloudinary re-fetches | 1 line change |
| Create `optimizedImageUrl()` utility | 40-70% on all non-hero images | New function + find/replace |
| Add `w_` max widths to raw `assetUrl()` calls in logo grids | 60-80% on logo images | ~5 files |
| Add bitrate caps (`br_2000k`) to hero video transforms | 20-30% on hero videos | 1 file change |
| Replace raw `<img>` tags with `next/image` in logo components | AVIF/WebP auto-negotiation | ~3 components |

### Phase 2: Eager transforms (eliminate cold transform costs)

| Action | Cost Savings | Effort |
|--------|-------------|--------|
| Build `/api/media-optimize` webhook endpoint | Eliminates first-visitor transform cost | 1 API route |
| Wire Sanity webhook to trigger on video upload | Automatic variant pre-generation | Sanity config |
| Add `eager_notification_url` callback | Confirms variants are warm | 1 API route |

### Phase 3: Selective Vercel Blob (optional, for cost-sensitive assets)

Only consider this if Phase 1+2 don't bring Cloudinary costs down enough:

| Action | Benefit | Effort |
|--------|---------|--------|
| Build a Blob upload pipeline for hero videos only | Zero Cloudinary runtime bandwidth for highest-traffic assets | Medium |
| Store Blob URLs in Sanity as a computed field | Transparent to components | Medium |
| Fallback to Cloudinary URL if Blob upload pending | Graceful degradation | Low |

---

## Implementation Roadmap

### Immediate: `next.config.ts` cache TTL

```diff
// next.config.ts
images: {
-  minimumCacheTTL: 60,
+  minimumCacheTTL: 604800,  // 7 days — images rarely change
}
```

### Short-term: `optimizedImageUrl()` utility

```typescript
// utils/utils.ts — add this function
export const optimizedImageUrl = (
  url?: string,
  options?: { maxWidth?: number; quality?: "auto" | "eco" }
): string | undefined => {
  if (!url || !url.includes("/upload/")) return url;

  const q = options?.quality === "eco" ? "q_auto:eco" : "q_auto";
  const transforms = [q, "f_auto"];
  if (options?.maxWidth) transforms.push(`w_${options.maxWidth}`, "c_limit");

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
};
```

Then in server components:

```diff
// server/PageBuilderLogoFloatBlock.tsx
- const url = assetUrl(asset);
+ const url = optimizedImageUrl(assetUrl(asset), { maxWidth: 300 });
```

### Medium-term: Eager transform webhook

```typescript
// app/api/media-optimize/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEO_VARIANTS = [
  // Phone portrait
  { width: 360, aspect_ratio: "9:16", crop: "fill", gravity: "auto",
    quality: "auto:eco", video_codec: "auto", audio_codec: "none" },
  // Tablet
  { width: 768, quality: "auto:good", video_codec: "auto", audio_codec: "none" },
  // Desktop
  { width: 1280, quality: "auto:good", video_codec: "auto", audio_codec: "none" },
];

export async function POST(req: NextRequest) {
  const { public_id, resource_type } = await req.json();

  if (resource_type !== "video") {
    return NextResponse.json({ skipped: true });
  }

  try {
    const result = await cloudinary.uploader.explicit(public_id, {
      type: "upload",
      resource_type: "video",
      eager: VIDEO_VARIANTS,
      eager_async: true,
    });

    return NextResponse.json({
      status: "processing",
      variants: VIDEO_VARIANTS.length,
      public_id,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

---

## Quick Reference

| Question | Answer |
|----------|--------|
| **Biggest bandwidth cost?** | Hero videos (4 responsive variants per page view) |
| **Lowest-hanging fruit?** | Increase `minimumCacheTTL` to 7 days (1 line) |
| **Should we download to Vercel at build time?** | **No** for the general case (breaks ISR). **Maybe** for a 2-3 fixed hero videos that never change. |
| **Best strategy overall?** | Eager transforms + `optimizedImageUrl()` for images + higher cache TTLs |
| **What about Vercel Blob?** | Only worth it if Cloudinary costs are truly painful and you want to decouple entirely |
| **What about `next/image`?** | Use it for all non-video assets. Combined with Cloudinary `f_auto`, you get double optimization. |
| **Why not just use `f_auto` in eager transforms?** | `f_auto` depends on browser detection at delivery time. Eager transforms run at upload time — use explicit formats (`mp4`, `webm`) instead. |
