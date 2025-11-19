# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It uses Sanity as a headless CMS and is configured for a multi-channel and multi-lingual setup. The project uses pnpm as the package manager.

## Technologies

*   **Framework:** [Next.js 15](https://nextjs.org) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com), [styled-components](https://styled-components.com)
*   **Animation:** [Motion](https://motion.dev/) (Framer Motion), Motion Plus, [next-view-transitions](https://github.com/shuding/next-view-transitions)
*   **Icons:** Phosphor, Tabler, Lucide, React Icons
*   **CMS:** [Sanity](https://www.sanity.io)
*   **Image Management:** [Cloudinary](https://cloudinary.com)
*   **Linting:** [ESLint](https://eslint.org)
*   **Package Manager:** [pnpm](https://pnpm.io)

## Project Structure

*   `app/(site)`: Contains the main website, with a dynamic route for locales.
*   `app/(studio)`: Contains the Sanity Studio, which is mounted at `/studio`.
*   `components`: Contains reusable React components.
    *   `components/pagebuilder`: Components that map directly to Sanity page builder blocks.
    *   `components/ui`: Generic UI components (buttons, inputs, etc.).
    *   `components/data`: Data-heavy or smart components.
*   `sanity`: Contains Sanity-related configurations.
    *   `sanity/schemaTypes`: Content model definitions.
    *   `sanity/structure.ts`: Studio desk structure configuration.
*   `public`: Contains static assets like images and fonts.

## Key Architectural Patterns

### Page Builder
The project uses a flexible Page Builder pattern. The `PageBuilder` component (`components/PageBuilder.tsx`) iterates over a list of content blocks from Sanity and dynamically renders the corresponding React component.
*   **Dynamic Imports**: Heavy components in the page builder are dynamically imported to optimize bundle size and initial load performance.
*   **Error Boundary**: Each block is wrapped in an `ErrorBoundary` to prevent a single component failure from breaking the entire page.

### Sanity Live
The project uses `next-sanity/live` to provide real-time content updates. This allows content editors to see changes immediately without rebuilding the site.

## Building and Running

### Development

To run the development server, use the following command:

```bash
pnpm dev
```

This will start the development server with Turbopack at [http://localhost:3000](http://localhost:3000).

### Building

To create a production build, use the following command:

```bash
pnpm build
```

### Starting the Production Server

To start the production server, use the following command:

```bash
pnpm start
```

### Linting

To run the linter, use the following command:

```bash
pnpm lint
```

## Development Conventions

*   **Package Manager:** This project uses `pnpm` for package management. Please use `pnpm` to install, remove, or update dependencies.
*   **Internationalization:** The website is designed to be multi-lingual. The content is managed in Sanity, and the routing is handled by a dynamic `[locale]` segment in the URL.
*   **Styling:** The project uses a combination of Tailwind CSS and styled-components for styling. Please adhere to the existing styling conventions.
*   **Commits:** Please follow conventional commit guidelines when committing changes.
