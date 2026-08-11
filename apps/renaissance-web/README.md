# RENAISSANCE Web

Independent frontend for the `renaissanceWeb` Sanity channel.

## Run Locally

From the repository root:

```bash
pnpm dev:renaissance
pnpm build:renaissance
pnpm start:renaissance
```

The app expects its own environment variables. Start from `.env.example` and configure the real values in the RENAISSANCE Vercel project.

Minimum public env for build/dev:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=wu6i3y0h
NEXT_PUBLIC_SANITY_DATASET=dev-dataset
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-16
NEXT_PUBLIC_SITE_URL=http://localhost:3003
```

## Scope

- Fetches website pages and global content through `renaissanceWeb`.
- Supports English initially, with locale-free public URLs and an extensible internal locale route.
- Reuses shared contracts and Sanity query helpers while owning its brand-specific shell and UI.
- Owns its app shell through `components/RenaissanceSiteWrapper.tsx`.
- Owns its page-builder boundary through `components/RenaissancePageBuilder.tsx`, with full FLZR module parity and isolated support for reusable 1SP component groups.
- Preserves the current 1SP root app's public runtime behavior.

Until the first Renaissance homepage exists in Sanity, the root route renders a branded no-index setup state.
