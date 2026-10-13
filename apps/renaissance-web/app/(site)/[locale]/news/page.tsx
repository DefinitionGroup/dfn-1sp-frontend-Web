/**
 * News Archive
 * ============
 *
 * Paginated list of posts copied by hand from x.com/RenaissancePRUK
 * (`renaissanceXPost` documents, newest first). The homepage news banner
 * shows the newest one and links here.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRenaissanceXPosts } from "@1sp/sanity-queries";
import type { RenaissanceXPost } from "@1sp/sanity-types";
import RenaissanceSiteWrapper from "@renaissance/components/RenaissanceSiteWrapper";
import RenaissanceXPostCard from "@renaissance/components/RenaissanceXPostCard";
import {
  JsonLdScript,
  generateBreadcrumbJsonLd,
  getBreadcrumbLabel,
  CANONICAL_URL,
} from "@renaissance/lib/structured-data";
import styles from "./news.module.css";

export const revalidate = 60;
// A 2×2 lead tile plus eight squares fills four rows of the 3-column grid.
const PAGE_SIZE = 9;
const X_PROFILE = "https://x.com/RenaissancePRUK";
const TITLE = "News";
const DESCRIPTION = "The latest from Renaissance PR on X: launches, reveals and news from our clients.";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

function pageNumber(value?: string) {
  if (value === undefined) return 1;
  return /^[1-9]\d*$/.test(value) ? Number(value) : null;
}

const pageHref = (page: number) => (page === 1 ? "/news" : `/news?page=${page}`);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageNumber((await searchParams).page) ?? 1;
  const title = page > 1 ? `${TITLE} – page ${page}` : TITLE;
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: pageHref(page) },
    openGraph: { title, description: DESCRIPTION, type: "website" },
  };
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const language = locale || "en";
  const page = pageNumber((await searchParams).page);
  if (!page) notFound();

  const { posts, total } = await getRenaissanceXPosts(page, PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pageCount) notFound();

  return (
    <RenaissanceSiteWrapper language={language} navColor="light">
      <JsonLdScript
        data={generateBreadcrumbJsonLd([
          { name: getBreadcrumbLabel(language, "home"), url: CANONICAL_URL },
          { name: TITLE, url: `${CANONICAL_URL}/news` },
        ])}
      />
      <div className="mx-auto max-w-[1680px] px-5 pb-16 pt-10 sm:px-8 md:pb-24 md:pt-16 lg:px-12">
        <header className="grid gap-6 md:grid-cols-12 md:items-end md:gap-x-10">
          <h1 className="renaissance-display text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.88] tracking-[-0.035em] text-renaissance-accent md:col-span-6">
            {TITLE}
          </h1>
          <div className="grid justify-items-start gap-5 md:col-span-5 md:col-start-8">
            <p className="max-w-[38rem] text-[clamp(1.05rem,1.3vw,1.25rem)] leading-[1.4] text-renaissance-ink/75 text-pretty">
              {DESCRIPTION}
            </p>
            <a href={X_PROFILE} target="_blank" rel="noopener noreferrer" className={styles.follow}>
              Follow @RenaissancePRUK<span className="sr-only"> on x.com</span>
            </a>
          </div>
        </header>

        {posts.length === 0 ? (
          <p className="mt-12 text-lg text-renaissance-ink">No news yet. Follow us on X for the latest.</p>
        ) : (
          <ol
            className="mt-10 grid gap-4 border-t border-renaissance-hairline pt-10 md:mt-14 md:grid-cols-2 md:pt-14 lg:grid-cols-3"
            aria-label="News posts, newest first"
          >
            {posts.map((post: RenaissanceXPost, i: number) => (
              <li
                key={post._id}
                className={i === 0 ? "md:col-span-2 lg:row-span-2" : ""}
              >
                <RenaissanceXPostCard
                  post={post}
                  featured={i === 0}
                  className={
                    i === 0
                      ? "aspect-[4/5] md:aspect-[2/1] lg:aspect-auto lg:h-full"
                      : "aspect-square"
                  }
                />
              </li>
            ))}
          </ol>
        )}

        {pageCount > 1 && (
          <nav className={styles.pagination} aria-label="News pages">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={styles.step} rel="prev">
                Newer
              </Link>
            ) : (
              <span className={styles.step} aria-hidden="true" data-disabled />
            )}
            <ol className={styles.pages}>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <Link
                    href={pageHref(n)}
                    className={styles.pageLink}
                    aria-current={n === page ? "page" : undefined}
                  >
                    <span className="sr-only">Page </span>
                    {n}
                  </Link>
                </li>
              ))}
            </ol>
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} className={styles.step} rel="next">
                Older
              </Link>
            ) : (
              <span className={styles.step} aria-hidden="true" data-disabled />
            )}
          </nav>
        )}
      </div>
    </RenaissanceSiteWrapper>
  );
}
