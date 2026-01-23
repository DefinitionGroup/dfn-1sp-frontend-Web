# Handling Null vs Undefined in Sanity Data

## The Problem

When working with Sanity CMS data in React components, you may encounter runtime errors like:

```
TypeError: Cannot read properties of null (reading 'length')
```

This happens because **Sanity returns `null` for empty/missing array fields**, not `undefined`.

## Why Default Parameters Don't Help

You might think default parameter values protect you:

```tsx
function MyComponent({
  challenges = [],  // Default to empty array
  services = [],
}: Props) {
  // This will CRASH if challenges is null!
  if (challenges.length > 0) {
    // ...
  }
}
```

**This doesn't work because:**
- Default parameters only apply when the value is `undefined`
- Sanity explicitly sends `null` for empty fields
- `null` is a defined value, so the default is bypassed

```tsx
// JavaScript behavior:
const { items = [] } = { items: undefined };  // items = [] ✅
const { items = [] } = { items: null };       // items = null ❌
```

## The Solution: Nullish Coalescing (`??`)

Use the `??` operator to handle both `null` and `undefined`:

```tsx
// ❌ WRONG - Will crash on null
const hasItems = items.length > 0;

// ✅ CORRECT - Safe for null and undefined
const hasItems = (items ?? []).length > 0;
```

## Real Example

This was the fix applied to `pg-ChallengeAndSolution.tsx`:

```diff
  // Check if we have content to display
  const hasContentItems =
-    (contentType === "services" && services.length > 0) ||
-    (contentType === "challenges" && challenges.length > 0);
+    (contentType === "services" && (services ?? []).length > 0) ||
+    (contentType === "challenges" && (challenges ?? []).length > 0);
```

## Best Practices

### 1. Always use `??` when accessing Sanity array data

```tsx
// Safe array operations
const items = sanityData.items ?? [];
const count = (sanityData.items ?? []).length;
const mapped = (sanityData.items ?? []).map(item => item.name);
```

### 2. Use optional chaining with nullish coalescing

```tsx
// For nested data
const firstItem = sanityData.items?.[0] ?? null;
const itemNames = (sanityData.items ?? []).map(i => i.name).join(", ");
```

### 3. Consider type guards for complex checks

```tsx
function hasValidItems(items: Item[] | null | undefined): items is Item[] {
  return Array.isArray(items) && items.length > 0;
}

// Usage
if (hasValidItems(sanityData.items)) {
  // TypeScript knows items is Item[] here
  sanityData.items.forEach(item => console.log(item));
}
```

### 4. Normalize data at fetch time

For frequently used data, consider normalizing at the query level:

```tsx
// In your data fetching layer
const normalizedData = {
  ...rawSanityData,
  items: rawSanityData.items ?? [],
  tags: rawSanityData.tags ?? [],
};
```

## Quick Reference

| Sanity Value | `??` Result | `\|\|` Result | Default Param |
|--------------|-------------|---------------|---------------|
| `undefined`  | `[]` ✅     | `[]` ✅       | `[]` ✅       |
| `null`       | `[]` ✅     | `[]` ✅       | `null` ❌     |
| `[]`         | `[]` ✅     | `[]` ⚠️      | `[]` ✅       |
| `[1,2,3]`    | `[1,2,3]` ✅| `[1,2,3]` ✅  | `[1,2,3]` ✅  |

> ⚠️ Note: `||` treats empty arrays as falsy, which may not be desired.

## Summary

**Always assume Sanity array fields can be `null` and use `(array ?? [])` before any array operations.**
