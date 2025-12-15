# StaggeredSlideUp Animation - Performance Update

## Overview

The `StaggeredSlideUp` component was refactored to fix stuttering issues when multiple instances are rendered on the same page or within the same viewport.

## Problems Identified

### 1. Duplicate Animation Work
Each child element had **two** animated elements:
- The content sliding up with opacity
- A mask overlay also animating

This doubled the animation calculations for every item.

### 2. Missing GPU Acceleration
No `will-change` or `transform: translateZ(0)` hints were provided, causing animations to run on the CPU instead of being offloaded to the GPU.

### 3. Re-render Issues
Child components were not memoized, causing unnecessary re-renders when parent state changed or when other StaggeredSlideUp instances updated.

### 4. Animation Conflicts
Multiple instances used the same array index as keys, potentially causing React to confuse children across different instances.

### 5. Redundant Container Opacity
The container had `opacity: 1` in both hidden and visible states, triggering extra animation work for no visual change.

---

## Solutions Implemented

### 1. Removed Mask Animations
```tsx
// Before: Two animated elements per child
<motion.div variants={itemVariants}>{child}</motion.div>
<motion.div variants={maskVariants} /> // Extra mask overlay

// After: Single animated element
<motion.div variants={itemVariants}>{child}</motion.div>
```

### 2. Added GPU Acceleration
```tsx
<motion.div 
  variants={variants} 
  style={{ 
    willChange: "transform, opacity",
    transform: "translateZ(0)", // Force GPU layer
  }}
>
  {children}
</motion.div>
```

### 3. Memoized Child Items
```tsx
const StaggeredItem = React.memo(({ children, variants, index }) => (
  <div className="relative overflow-hidden">
    <motion.div variants={variants} style={{ willChange: "transform, opacity" }}>
      {children}
    </motion.div>
  </div>
));
```

### 4. Unique Instance IDs
```tsx
const id = useId(); // React's built-in unique ID hook

// Used in keys to prevent conflicts
{childArray.map((child, index) => (
  <StaggeredItem key={`${id}-${index}`} ... />
))}
```

### 5. Simplified Container Variants
```tsx
// Before
hidden: { opacity: 1 },
visible: { opacity: 1, transition: { ... } }

// After
hidden: {},
visible: { transition: { ... } }
```

---

## Updated Default Values

| Property | Before | After | Reason |
|----------|--------|-------|--------|
| `staggerDelay` | 0.08s | 0.06s | Faster stagger feels snappier |
| `duration` | 0.5s | 0.4s | Quicker animations reduce overlap |
| `distance` | 24px | 20px | Smaller distance = less motion |
| `threshold` | 0.2 | 0.15 | Earlier trigger prevents pile-up |
| `rootMargin` | -50px | -30px | Earlier detection |

---

## Props Reference

```typescript
interface StaggeredSlideUpProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  /** Initial delay before animation starts (seconds) */
  delay?: number; // default: 0.1
  /** Delay between each child animation (seconds) */
  staggerDelay?: number; // default: 0.06
  /** Duration of each child's animation (seconds) */
  duration?: number; // default: 0.4
  /** Distance to slide up from (pixels) */
  distance?: number; // default: 20
  /** Easing function for animations */
  easing?: "smooth" | "spring" | "ease-out" | "bounce"; // default: "spring"
  /** Intersection Observer threshold (0-1) */
  threshold?: number; // default: 0.15
  /** Root margin for Intersection Observer */
  rootMargin?: string; // default: "0px 0px -30px 0px"
  /** Whether to trigger animation only once */
  once?: boolean; // default: true
  /** Enable debug mode to visualize trigger state */
  debug?: boolean; // default: false
  /** Skip viewport detection - animate immediately */
  animateImmediately?: boolean; // default: false
}
```

---

## Usage Examples

### Basic Usage
```tsx
<StaggeredSlideUp>
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</StaggeredSlideUp>
```

### Fixed Elements (Nav, Headers)
```tsx
<StaggeredSlideUp animateImmediately={true} delay={0.3}>
  <NavItem>Home</NavItem>
  <NavItem>About</NavItem>
</StaggeredSlideUp>
```

### Debug Mode
```tsx
<StaggeredSlideUp debug={true}>
  <Content />
</StaggeredSlideUp>
```
Shows a red badge with instance ID and viewport status.

---

## Removed Props

| Prop | Reason |
|------|--------|
| `maskHeight` | Mask animations removed for performance |
| `viewport` | Replaced with simpler `threshold` and `rootMargin` |
| `triggerOnce` | Renamed to `once` for clarity |

---

## File Location
`/components/ui/StaggeredSlideUp.tsx`
