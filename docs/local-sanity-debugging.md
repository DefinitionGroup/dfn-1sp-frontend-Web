# Local Sanity Debugging

Use this runbook before changing code for missing local pages, empty Studio lists, null Sanity results, wrong channel output, or local/prod content mismatches.

## First Command

Run from the repo root:

```bash
pnpm doctor:sanity
```

For a specific site/language:

```bash
pnpm doctor:sanity --channel flizrWeb --language en
```

The doctor prints the active Sanity project, dataset, API version, checked channel/language, aggregate document counts, and channel distributions. It does not fetch document titles, body content, or write data.

## Required Checks

Confirm these before inspecting routing, schema, or GROQ code:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `NEXT_PUBLIC_CHANNEL`
- Frontend and Studio are using the same project ID and dataset.
- The checked dataset has a homepage and pages for the active channel/language.
- Global documents such as cases, services, people, clients, and units are assigned to the expected channel/language.

## Common Symptoms

`page === null`

Usually means the active dataset/channel/language has no matching page. Verify env and page counts first.

Empty Studio assigned lists

Usually means no global documents are assigned to that channel/language in the active dataset. Verify case/service/person/client/unit counts first.

Local frontend differs from Studio

Usually means the frontend and Studio are reading different datasets or one server has stale env. Restart the dev server after env changes.

## Channel Names

Current website channels:

- `1spWeb`
- `flizrWeb`
- `msmWeb`
- `studioco2Web`
- `renaissanceWeb`

Use the exact channel values above. Do not introduce spelling variants such as `flzrWeb`.


The root command loads root environment files. Compare these with the environment actually loaded by each nested app; root diagnostics alone do not verify app configuration. Channel/language support is defined in [site-config](../packages/site-config/src/index.ts). For attribute pressure, run `pnpm doctor:sanity-capacity`; use its live count rather than an old report.
