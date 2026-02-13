# Performance & Bundle Optimization Plan

**Generated:** 2026-02-11  
**Current First Load JS:** 3.26 MB (shared by ALL pages)  
**Target:** < 500 KB First Load JS

---

## 🔴 Critical Findings

### 1. Broken Webpack splitChunks Config (THE #1 ISSUE)
**Impact: Extremely High | Effort: 5 min**

The custom `splitChunks` config in `next.config.ts` **overrides Next.js's optimized chunking** and forces ALL node_modules into a single 3.19 MB chunk (`npm..pnpm-*.js`) that loads on EVERY page.

```
chunks/npm..pnpm-082f22041c61dc0c.js  →  10 MB uncompressed / 3.19 MB gzipped
```

This means a visitor on `/en/contact` (a simple form page) downloads the entire Three.js 3D engine, Sanity Studio, and all icon libraries.

**Fix:** Remove the custom webpack config entirely. Next.js 15 handles chunk splitting automatically and will only include what each page actually needs.

---

### 2. Unused Dependencies (255 MB of node_modules not imported)
**Impact: High | Effort: 10 min**

| Package | Size (disk) | Imported? | Usage |
|---------|-------------|-----------|-------|
| `@tabler/icons-react` | 73 MB | ❌ ZERO imports | **Remove entirely** |
| `lucide-react` | 42 MB | ❌ ZERO imports | **Remove entirely** |
| `styled-components` | 2.4 MB | ❌ ZERO imports | **Remove entirely** |

These packages are installed but never imported anywhere in the codebase. Even with tree-shaking, they add noise and potential phantom dependencies.

---

### 3. Icon Library Consolidation
**Impact: Medium | Effort: 30 min**

Currently using **4 icon libraries**, but only 2 are actually imported:

| Library | Disk Size | Actually Imported? | Icons Used |
|---------|-----------|-------------------|-----------|
| `@phosphor-icons/react` | 57 MB | ✅ 3 files | `ArrowRightIcon`, `ArrowUp` |
| `react-icons` | 83 MB | ✅ 1 file | `FiChevronLeft`, `FiChevronRight` |
| `@tabler/icons-react` | 73 MB | ❌ | None |
| `lucide-react` | 42 MB | ❌ | None |

**Fix:** Remove unused libraries. Only **4 icons** are actually used — consider using inline SVGs instead to eliminate all icon library overhead.

---

### 4. Three.js / 3D Globe Bundle (three, three-globe, @react-three)
**Impact: High | Effort: 15 min**

Three.js alone is 37 MB on disk. It's only used by the Globe component, which is already dynamically imported. However, the broken `splitChunks` config forces it into the shared chunk anyway.

**Fix:** After fixing #1 (splitChunks), verify Three.js is properly code-split. Additionally, the globe component should use `ssr: false` since WebGL doesn't work server-side.

---

### 5. Globe GeoJSON Data (408 KB)
**Impact: Medium | Effort: 10 min**

`data/globe.json` (408 KB) is statically imported in `globe.tsx`. This data is included in the JavaScript bundle instead of being loaded on demand.

**Fix:** Load via `fetch()` when the Globe component mounts, or use `import()` with React Suspense.

---

### 6. Sanity Studio Bleeding into Site Bundle
**Impact: High | Effort: 5 min (verify)**

The `(studio)` route group should keep Sanity Studio isolated. However, `sanity.config.ts` is imported at the app root, which may pull the entire Sanity Studio package (140 MB) into every page's bundle. This needs verification after fixing #1.

---

### 7. All PageBuilder Dynamic Imports Use `ssr: true`
**Impact: Medium | Effort: 15 min**

All 27 dynamic imports in `PageBuilder.tsx` use `ssr: true`. For client-heavy components (e.g., carousels, interactive elements, globe), setting `ssr: false` would:
- Reduce server bundle size
- Prevent hydration mismatches
- Allow genuine code-splitting (load only when the component is scrolled into view)

**Candidates for `ssr: false`:**
- Globe/3D components (WebGL doesn't work server-side anyway)
- Interactive carousels with complex client state
- Components that use `useInView` for lazy loading

---

## 📋 Implementation Order (by impact/effort ratio)

| # | Item | Expected Impact | Effort |
|---|------|----------------|--------|
| 1 | **Fix splitChunks** — Remove custom webpack config | ~2.5 MB reduction | 5 min |
| 2 | **Remove unused deps** — tabler, lucide, styled-components | Cleaner build | 2 min |
| 3 | **Remove react-icons** — Replace 2 icons with Phosphor equivalents | -83 MB dep | 5 min |
| 4 | **Globe `ssr: false`** — Prevent Three.js SSR | Faster server renders | 2 min |
| 5 | **Lazy-load globe.json** — Async data loading | -408 KB from bundle | 10 min |
| 6 | **Verify Studio isolation** — Check if Sanity bleeds through | Potentially huge | 5 min |
| 7 | **Audit PageBuilder SSR settings** — ssr: false for heavy components | Better code-split | 15 min |

---

## 🎯 Expected Results

After implementing items 1-3:
- **First Load JS:** ~3.26 MB → **< 500 KB** (estimated)
- **Per-page JS:** Only the code needed for that specific page
- **TTFB/LCP:** Significantly improved due to less parsing/execution

---

## 📊 Measurement Plan

1. Run `pnpm build` and compare the route table output
2. Check Vercel Speed Insights after deployment
3. Run Lighthouse on key pages (/, /en/services, /en/cases/*)
