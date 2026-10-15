# FLZR Web

Independent frontend for `flizrWeb`, using shared Sanity contracts and its own shell, rendering and visual language. Configured languages: EN, DE and PL; [site-config](../../packages/site-config/src/index.ts) is authoritative.

## Run locally

From the repository root, after configuring this app's environment:

```sh
pnpm --filter @1sp/flzr-web exec next dev --turbopack -p 3001
pnpm --filter @1sp/flzr-web build
pnpm --filter @1sp/flzr-web exec next start -p 3001
```

The start command requires a completed build. Local frontend: `http://localhost:3001`. The shared local Studio runs in the root app at `http://localhost:3000/studio`.

Use this app's `.env.example` as a starting point. Confirm `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_CHANNEL=flizrWeb` and `NEXT_PUBLIC_SITE_URL=http://localhost:3001`. Root environment files do not automatically configure this app. Select the dataset for the task explicitly rather than copying an older deployment snapshot.

Run the root Sanity doctor with `--channel flizrWeb --language en`, then compare its root environment with the app's loaded environment. See [local debugging](../../docs/local-sanity-debugging.md).

## Ownership and references

For service editing and page relationships, use the shared [service content guide](../../docs/SERVICE_CONTENT.md) and [consolidation handoff](../../docs/SERVICE_CONTENT_HANDOFF.md). These separate current behavior from proposed migrations.

- App shell: [components/FlzrSiteWrapper.tsx](components/FlzrSiteWrapper.tsx).
- PageBuilder: [components/FlzrPageBuilder.tsx](components/FlzrPageBuilder.tsx).
- Global content remains channel/language scoped; pages use unified `content[]`.
- [Documentation index](../../docs/README.md) and [deployment verification](../../docs/DEPLOYMENT.md).
- [FLZR content records](../../docs/records/README.md#flzr), including the September homepage rollback. Earlier scaffold-only notes are historical.
