import "server-only";

import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import { client } from "./client";

type SanityFetchOptions = {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
  perspective?: "published" | "previewDrafts" | "raw";
  stega?: boolean;
};

async function isDraftModeEnabled() {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    return false;
  }
}

export async function sanityFetch<TData = any>({
  query,
  params = {},
  tags = [],
  revalidate = 60,
  perspective,
  stega,
}: SanityFetchOptions): Promise<{ data: TData }> {
  const draftEnabled = await isDraftModeEnabled();
  const resolvedPerspective =
    perspective ?? (draftEnabled ? "previewDrafts" : "published");
  const resolvedStega = stega ?? draftEnabled;

  const configuredClient = client.withConfig({
    perspective: resolvedPerspective,
    stega: resolvedStega ? { studioUrl: "/studio" } : false,
    // Keep the CDN off for server reads. We rely on Next's Data Cache with
    // tag-based invalidation (`revalidateTag`) + a 60s TTL. Stacking Sanity's
    // apicdn cache underneath makes tag purges unreliable — a published change
    // can stay stale even after the revalidate webhook fires. Reads hit the
    // live API so revalidation is predictable; the 60s TTL bounds latency cost.
    useCdn: false,
    token: draftEnabled ? process.env.SANITY_VIEWER_TOKEN : undefined,
  });

  const data = await configuredClient.fetch<TData>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });

  return { data };
}
