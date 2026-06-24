# MSM Web

Independent frontend shell for the `msmWeb` Sanity channel.

## Run Locally

From the repository root:

```bash
pnpm dev:msm
pnpm build:msm
pnpm start:msm
```

The app expects its own environment variables. Start from `.env.example` and configure the real values in the MSM Vercel project.

Minimum public env for build/dev:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=wu6i3y0h
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-09-16
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scope

- Fetches website pages and global content through `msmWeb`.
- Supports `en`, `de`, and `pl` route params.
- Reuses shared root components and Sanity query helpers through the root `@/*` alias.
- Owns its app shell through `components/MsmSiteWrapper.tsx`.
- Owns its page-builder boundary through `components/MsmPageBuilder.tsx`, which currently renders the same module registry as 1SP for editor continuity.
- Keeps the current 1SP root app untouched.

This is still a shell. MSM-specific layout, navigation, selected page-builder component forks, fonts, and visual language are the next implementation step.
