import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * App-level 404 page.
 *
 * This is the Next.js convention for custom 404 pages.
 * It's rendered when `notFound()` is called or when no route matches.
 *
 * Uses standard `next/link` instead of `next-view-transitions/Link`
 * because this page may render outside the ViewTransitions context.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="text-8xl font-bold text-neutral-800 mb-4 tracking-tighter">
              404
            </div>
            <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
              Page not found
            </h1>
            <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5  bg-violet-400 text-black font-medium text-sm hover:bg-violet-300 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
