# Gemini repository guidance

Use [AGENTS.md](AGENTS.md) for repository rules, [README.md](README.md) for local commands and [docs/README.md](docs/README.md) for task-specific guides.

This is a multisite pnpm workspace with separate 1SP, FLZR, MSM and Renaissance rendering surfaces. Shared schema and query contracts live under `packages/`; consult [architecture](docs/ARCHITECTURE.md) before changing ownership or routing.

Use the installed versions and scripts in `package.json`, follow app-local design guidance, and verify the environment before diagnosing missing Sanity content. Historical snapshots and new-project recipes are not instructions to reinitialize or migrate this repository.
