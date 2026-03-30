"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type KeyValueTag = {
  key: string;
  content: string;
};

type LinkTag = {
  rel: string;
  href: string;
  hreflang?: string;
};

type JsonLdBlock = {
  label: string;
  raw: string;
};

type SeoSnapshot = {
  lang: string;
  title: string;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  alternates: LinkTag[];
  hreflangs: LinkTag[];
  openGraph: KeyValueTag[];
  twitter: KeyValueTag[];
  jsonLd: JsonLdBlock[];
};

const IS_ENABLED =
  process.env.NODE_ENV === "development" &&
  (process.env.NEXT_PUBLIC_SEO_DIAG === "1" ||
    process.env.NEXT_PUBLIC_DIAG === "1");

function extractJsonLdLabel(value: unknown): string {
  if (!value || typeof value !== "object") return "Unknown";

  if (Array.isArray(value)) {
    const labels = value.map(extractJsonLdLabel).filter(Boolean);
    return labels.length ? labels.join(", ") : "Unknown";
  }

  const record = value as Record<string, unknown>;
  const graph = record["@graph"];
  if (Array.isArray(graph)) {
    const labels = Array.from(
      new Set(graph.map((item) => extractJsonLdLabel(item)).filter(Boolean)),
    );
    return labels.length ? labels.join(", ") : "Graph";
  }

  const type = record["@type"];
  if (Array.isArray(type)) {
    return type.join(", ");
  }
  if (typeof type === "string" && type.length > 0) {
    return type;
  }

  return "Unknown";
}

function collectMetaTags(selector: string, attribute: "name" | "property"): KeyValueTag[] {
  return Array.from(document.querySelectorAll<HTMLMetaElement>(selector)).map((tag) => ({
    key: tag.getAttribute(attribute) || "",
    content: tag.content,
  }));
}

function snapshotSeo(): SeoSnapshot {
  const canonical =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || null;

  const alternates = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"]'),
  ).map((link) => ({
    rel: link.rel,
    href: link.href,
    hreflang: link.hreflang || undefined,
  }));

  const hreflangs = Array.from(
    document.querySelectorAll<HTMLLinkElement>("link[hreflang]"),
  ).map((link) => ({
    rel: link.rel,
    href: link.href,
    hreflang: link.hreflang || undefined,
  }));

  const jsonLd = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
  ).map((script, index) => {
    const raw = script.textContent || "";

    try {
      const parsed = JSON.parse(raw);
      return {
        label: `${index + 1}. ${extractJsonLdLabel(parsed)}`,
        raw: JSON.stringify(parsed, null, 2),
      };
    } catch {
      return {
        label: `${index + 1}. Invalid JSON-LD`,
        raw,
      };
    }
  });

  return {
    lang: document.documentElement.lang || "",
    title: document.title,
    description:
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content || null,
    robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content || null,
    canonical,
    alternates,
    hreflangs,
    openGraph: collectMetaTags('meta[property^="og:"]', "property"),
    twitter: collectMetaTags('meta[name^="twitter:"]', "name"),
    jsonLd,
  };
}

function TagList({
  items,
  emptyLabel,
}: {
  items: KeyValueTag[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-neutral-500">{emptyLabel}</p>;
  }

  const imageItems = items.filter((item) => /(?:^|:)(?:image|image:url|image:secure_url)$/i.test(item.key));
  const nonImageItems = items.filter((item) => !imageItems.includes(item));

  return (
    <div className="space-y-4">
      {nonImageItems.length > 0 ? (
        <div className="space-y-2">
          {nonImageItems.map((item) => (
            <div
              key={`${item.key}-${item.content}`}
              className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">
                {item.key}
              </p>
              <p className="mt-1 break-all text-sm text-neutral-100">
                {item.content || "Empty"}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {imageItems.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-300">Images</p>
          {imageItems.map((item) => (
            <div
              key={`${item.key}-${item.content}`}
              className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">
                {item.key}
              </p>
              <p className="mt-1 break-all text-sm text-neutral-100">
                {item.content || "Empty"}
              </p>
              {item.content ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800 bg-black/40">
                  <img
                    src={item.content}
                    alt={item.key}
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LinkList({
  items,
  emptyLabel,
}: {
  items: LinkTag[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-neutral-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={`${item.rel}-${item.href}-${item.hreflang || ""}`}
          className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3"
        >
          <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">
            {item.rel}
            {item.hreflang ? ` / ${item.hreflang}` : ""}
          </p>
          <p className="mt-1 break-all text-sm text-neutral-100">{item.href}</p>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
      <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
      {children}
    </section>
  );
}

export default function SeoDiagnosticOverlay() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<SeoSnapshot | null>(null);

  useEffect(() => {
    if (!IS_ENABLED) return;

    const refresh = () => setSnapshot(snapshotSeo());
    const timer = window.setTimeout(refresh, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!IS_ENABLED) {
    return null;
  }

  const refreshSnapshot = () => setSnapshot(snapshotSeo());

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) refreshSnapshot();
          setIsOpen((open) => !open);
        }}
        className="fixed bottom-4 right-4 z-[1000010] rounded-full border border-lime-400/40 bg-neutral-950/90 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-lime-400 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur"
      >
        SEO DIAG
      </button>

      {isOpen && snapshot ? (
        <aside className="fixed inset-y-4 right-4 z-[1000009] flex w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/95 text-neutral-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex items-start justify-between border-b border-neutral-800 px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-lime-400">
                SEO Diagnostics
              </p>
              <p className="mt-1 text-sm text-neutral-400">{pathname}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={refreshSnapshot}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 transition-colors hover:border-lime-400 hover:text-lime-400"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 transition-colors hover:border-lime-400 hover:text-lime-400"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <Section title="Core Metadata">
              <div className="grid gap-3">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">Title</p>
                  <p className="mt-1 text-sm text-neutral-100">{snapshot.title || "Missing"}</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">Description</p>
                  <p className="mt-1 text-sm text-neutral-100">
                    {snapshot.description || "Missing"}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">Robots</p>
                    <p className="mt-1 break-all text-sm text-neutral-100">
                      {snapshot.robots || "Missing"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">Lang</p>
                    <p className="mt-1 text-sm text-neutral-100">{snapshot.lang || "Missing"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-lime-400">Canonical</p>
                  <p className="mt-1 break-all text-sm text-neutral-100">
                    {snapshot.canonical || "Missing"}
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Link Tags">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-300">Alternates</p>
                  <LinkList items={snapshot.alternates} emptyLabel="No alternate links" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-300">Hreflang</p>
                  <LinkList items={snapshot.hreflangs} emptyLabel="No hreflang links" />
                </div>
              </div>
            </Section>

            <Section title="Open Graph">
              <TagList items={snapshot.openGraph} emptyLabel="No Open Graph tags" />
            </Section>

            <Section title="Twitter">
              <TagList items={snapshot.twitter} emptyLabel="No Twitter tags" />
            </Section>

            <Section title="Structured Data">
              {snapshot.jsonLd.length === 0 ? (
                <p className="text-neutral-500">No JSON-LD blocks found</p>
              ) : (
                <div className="space-y-3">
                  {snapshot.jsonLd.map((block) => (
                    <details
                      key={`${block.label}-${block.raw.length}`}
                      className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3"
                    >
                      <summary className="cursor-pointer text-sm font-medium text-neutral-100">
                        {block.label}
                      </summary>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-3 text-xs leading-5 text-neutral-300">
                        {block.raw}
                      </pre>
                    </details>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </aside>
      ) : null}
    </>
  );
}
