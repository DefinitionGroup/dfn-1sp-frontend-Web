# Claude repository guidance

Read [AGENTS.md](AGENTS.md) for repository rules and [docs/README.md](docs/README.md) to select task-specific documentation. Use [README.md](README.md) for verified local commands and [architecture](docs/ARCHITECTURE.md) for ownership boundaries.

## Implementation conventions

- Use pnpm; versions and available scripts are defined in `package.json` and `.nvmrc`.
- Follow each app's path aliases and design conventions. Root `@/*` aliases resolve to the root app; nested apps have their own aliases and some explicit compatibility imports.
- Use `motion/react` for Motion. Follow the neighboring navigation pattern; root components commonly use `Link` from `next-view-transitions`.
- Types in `packages/sanity-types/src` are maintained alongside query contracts. Inspect the current tooling before assuming automatic generation.
- Normalize nullable CMS arrays with `?? []`; see [null handling](docs/SANITY_NULL_HANDLING.md).
- Use conventional commit messages and verify the current branch before committing or pushing.

For block work, follow the [PageBuilder guide](docs/PAGEBUILDER_COMPONENT_GUIDE.md). For missing CMS content, follow [environment diagnostics](docs/local-sanity-debugging.md). For releases, use [deployment verification](docs/DEPLOYMENT.md).

Historical handoffs and templates are indexed separately. Their branches, dataset snapshots and executable examples are not current task instructions.
