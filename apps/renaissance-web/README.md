# Renaissance Web

Independent frontend for `renaissanceWeb`, using shared Sanity contracts and its own shell, rendering and visual language. Configured languages: EN; [site-config](../../packages/site-config/src/index.ts) is authoritative.

## Run locally

From the repository root, after configuring this app's environment:

```sh
pnpm --filter @1sp/renaissance-web exec next dev --turbopack -p 3003
pnpm --filter @1sp/renaissance-web build
pnpm --filter @1sp/renaissance-web exec next start -p 3003
```

The start command requires a completed build. Local frontend: `http://localhost:3003`. The shared local Studio runs in the root app at `http://localhost:3000/studio`.

Use this app's `.env.example` as a starting point. Confirm `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_CHANNEL=renaissanceWeb` and `NEXT_PUBLIC_SITE_URL=http://localhost:3003`. Root environment files do not automatically configure this app. Select the dataset for the task explicitly rather than copying an older deployment snapshot.

Run the root Sanity doctor with `--channel renaissanceWeb --language en`, then compare its root environment with the app's loaded environment. See [local debugging](../../docs/local-sanity-debugging.md).

## Ownership and references

- App shell: [components/RenaissanceSiteWrapper.tsx](components/RenaissanceSiteWrapper.tsx).
- PageBuilder: [components/RenaissancePageBuilder.tsx](components/RenaissancePageBuilder.tsx).
- Global content remains channel/language scoped; pages use unified `content[]`.
- [Documentation index](../../docs/README.md) and [deployment verification](../../docs/DEPLOYMENT.md).
- [Product](PRODUCT.md), [design](DESIGN.md), [component contract](design-system/COMPONENTS.md) and [release checklist](design-system/RELEASE-CHECKLIST.md).
- [Content records](../../docs/records/README.md#renaissance).

Public URLs are locale-free, with an internal English route. The homepage is CMS-first and can use [homepageFallback.ts](data/homepageFallback.ts) when CMS content is absent. Confirm the active dataset before interpreting a fallback as a defect. Configuration currently has a preview URL and no production domain; this is not a public-launch record.
