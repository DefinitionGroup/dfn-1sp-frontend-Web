# Unused Components

This file tracks components that are no longer actively used in the codebase but have been kept for reference or potential future use.

---

## Components

### `components/ui/PersonCard.tsx`

**Status:** Unused since 2026-01-16

**Replaced by:** `components/pagebuilder/Fragments/pg-PeopleShowcaseHero.tsx`

**Reason:** Consolidated people display components to streamline look and functionality. `PeopleShowcaseHero` offers:
- Mobile modal popup for contact details (better UX on small screens)
- Centralized state management for hover and modal
- Consistent square aspect ratio grid layout
- Staggered animations on hover

**Previously used in:**
- `components/data/data-SmartPeople.tsx`

**Safe to delete:** Yes, if confirmed no longer needed.

---

## Notes

Before deleting any component listed here:
1. Search the codebase to confirm it's not imported anywhere
2. Consider if the component might be useful for future features
3. Check git history if you need to restore functionality

