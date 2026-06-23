# Vercel deployments — what controls them and how to use them

This repo is a **pnpm monorepo** serving **two** Vercel projects from one Git
repository. This doc explains the two layers that control deployment, what each
`vercel.json` does, where each project deploys, and how to drive them.

> These files were once lost in a branch merge. If they go missing again,
> restore them from this doc — the exact contents are below.

---

## The two layers (read this first)

"What controls a Vercel deployment" is split across two independent things.
Confusing them is the #1 source of deploy surprises.

### Layer 1 — WHERE a deployment goes: the Vercel project's Git integration

Configured **in the Vercel dashboard**, per project — *not* in this repo. Each
Vercel project watches this GitHub repo and auto-deploys on push to its
configured branches. This is the layer that decides *which project builds* and
*which URL it serves*.

| Vercel project | Watches branch | Root Directory (dashboard) | Serves |
|---|---|---|---|
| `dfn-1sp-frontend-web` | `main` → production, `dev` → preview | `.` (repo root) | The 1SP site |
| `flzr-prototype` | its configured branch | `apps/flzr-web` | The FLZR site |

You cannot change Layer 1 from the repo. To change which branch a project
deploys, or its Root Directory, edit it in **Vercel dashboard → Project →
Settings → Git / Build & Output**.

### Layer 2 — HOW a deployment builds: `vercel.json` (this repo)

`vercel.json` is a **committed override** of the dashboard's install/build
commands. When present, Vercel uses these instead of its auto-detected or
dashboard-configured commands. This is the layer that makes the **monorepo**
build correctly — without it, Vercel guesses, and the guesses fail on a pnpm
workspace.

There are **two** `vercel.json` files, one per project (see next section).

### A third thing that is NOT deployment control: `.vercel/`

`.vercel/project.json` is a **local CLI link** — it only tells the `vercel`
command-line tool which project to target when *you* run `vercel` from your
terminal. It is **gitignored** (`.gitignore` line 19), never deployed, and has
**zero** effect on Git-push auto-deploys. Don't confuse it with Layer 1.

---

## The two `vercel.json` files

### `vercel.json` (repo root) → drives the **1SP** project (`dfn-1sp-frontend-web`)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "framework": "nextjs"
}
```

**Why each line exists:**

- `installCommand: pnpm install --frozen-lockfile` — forces pnpm. Without this,
  Vercel auto-detects the package manager, and if a `package-lock.json` ever
  reappears it picks **npm**, which cannot parse the `workspace:*` protocol used
  by all the `@1sp/*` package references → build fails with
  `Unsupported URL Type "workspace:"`. `--frozen-lockfile` makes the build fail
  loudly if `pnpm-lock.yaml` is out of sync rather than silently resolving a
  different dependency tree than you tested locally.
- `buildCommand: pnpm build` — runs the root `build` script (Next.js production
  build for the 1SP app at the repo root).
- `framework: nextjs` — tells Vercel this is Next.js (routing, ISR, image
  optimization, output conventions).

The 1SP project's Root Directory is `.`, so Vercel reads **this** file.

### `apps/flzr-web/vercel.json` → drives the **FLZR** project (`flzr-prototype`)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm --filter flzr-web build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Why each line exists:**

- `cd ../..` in both commands — the FLZR project's Root Directory is
  `apps/flzr-web`, but the **pnpm workspace** is at the repo root. You must
  install from the root or the `@1sp/*` workspace packages won't resolve. So the
  commands step up to the workspace root first.
- `pnpm install --frozen-lockfile` — installs the **entire** workspace (all
  packages + both apps) from the root lockfile. The FLZR app depends on
  `@1sp/site-config`, `@1sp/sanity-queries`, etc., which only resolve in a
  full workspace install.
- `pnpm --filter flzr-web build` — builds **only** the FLZR app
  (`--filter` selects it by package name `@1sp/flzr-web` → `flzr-web` short
  name) while still having all workspace deps available.
- `outputDirectory: .next` — because the build command ran from the repo root
  (`cd ../..`) but produces output under `apps/flzr-web/.next`, this tells
  Vercel where the built app lands **relative to the project's Root Directory**
  (`apps/flzr-web`). So `.next` here means `apps/flzr-web/.next`.

The FLZR project's Root Directory is `apps/flzr-web`, so Vercel reads **this**
file.

> ‼️ **The FLZR project additionally needs "Include source files outside of the
> Root Directory" enabled** in its Vercel dashboard (Settings → Git), because it
> imports from `../../packages/*` and `../../components/*`. Without that toggle,
> the `cd ../..` install has nothing to install into. This is a dashboard
> setting (Layer 1), not something `vercel.json` can set.

---

## How deployments actually fire

### Automatic (the normal path) — via Git push

```
push to a watched branch
        │
        ├─ 1SP project sees the push      → reads ./vercel.json
        │     builds with pnpm from root  → deploys to 1SP URL
        │
        └─ FLZR project sees the push     → reads apps/flzr-web/vercel.json
              builds FLZR from root        → deploys to FLZR URL
```

You don't run anything. Push to the branch a project watches, and Vercel builds
it. Both projects watch the **same repo**, so a single push can trigger both
(each builds its own app via its own `vercel.json`).

- 1SP production: merge to `main`
- 1SP preview: push to `dev`
- FLZR: push to whatever branch `flzr-prototype` is configured to watch

### Manual (override the normal path) — via the `vercel` CLI

Only needed for one-off deploys outside the Git flow (e.g. the FLZR prototype).
The CLI uses `.vercel/project.json` to know which project to target, so **the
directory you run it from matters**:

```bash
# Deploy FLZR manually (from the folder linked to flzr-prototype):
vercel --prod          # reads apps/flzr-web/vercel.json for build commands

# If a directory isn't linked yet, link it once (writes .vercel/, gitignored):
vercel link --yes --project flzr-prototype
```

> **Do NOT `vercel --prod` the 1SP project by hand.** 1SP ships through the Git
> gate (`feature → dev → main`). A manual CLI deploy bypasses review and pushes
> straight to production. Let the Git integration handle 1SP.

---

## Required environment variables (set in each Vercel project's dashboard)

`vercel.json` controls *build commands*, not secrets. Env vars live in
**Vercel dashboard → Project → Settings → Environment Variables**, per project:

| Variable | 1SP value | FLZR value |
|---|---|---|
| `NEXT_PUBLIC_CHANNEL` | `1spWeb` (or unset → defaults to `1spWeb`) | `flizrWeb` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `wu6i3y0h` | `wu6i3y0h` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | `production` (or `dev-dataset` for the prototype) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-09-16` | `2025-09-16` |
| Sanity tokens, Cloudinary, SMTP, Personio | as configured | as configured |

The one that's easy to forget: **`NEXT_PUBLIC_CHANNEL=flizrWeb` on the FLZR
project.** Without it, the FLZR deployment resolves to the default `1spWeb`
channel and renders 1SP content / 404s on FLZR-only routes.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Unsupported URL Type "workspace:"` | Vercel used npm; `vercel.json` missing or a `package-lock.json` crept in | Restore root `vercel.json`; delete any `package-lock.json` |
| `Cannot find module '@1sp/...'` on FLZR build | FLZR built without workspace-root install, or "Include files outside Root Directory" is off | Restore `apps/flzr-web/vercel.json`; enable the dashboard toggle |
| FLZR site renders like 1SP / 404s | `NEXT_PUBLIC_CHANNEL` not set on FLZR project | Add `NEXT_PUBLIC_CHANNEL=flizrWeb` in FLZR's Vercel env vars, redeploy |
| Build output not found | `outputDirectory` wrong after a `cd` | FLZR uses `.next` (relative to `apps/flzr-web`); root uses Vercel's default |
| Changes don't deploy | Pushed a branch no project watches | Check each project's watched branch in dashboard → Settings → Git |

---

## If these files go missing again

They're plain JSON — recreate them with the exact contents shown in
[The two `vercel.json` files](#the-two-verceljson-files) above. They were
previously lost in commit `9067a37` (a branch merge that took the other side's
tree). After restoring, commit them so they survive future merges:

```bash
git add vercel.json apps/flzr-web/vercel.json
git commit -m "build(vercel): restore monorepo build configs for both projects"
```
