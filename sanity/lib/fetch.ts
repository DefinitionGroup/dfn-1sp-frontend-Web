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
    useCdn: !draftEnabled && resolvedPerspective === "published",
    token: draftEnabled ? process.env.SANITY_VIEWER_TOKEN : undefined,
  });

  const data = await configuredClient.fetch<TData>(query, params, {
    next: {
      revalidate: tags.length > 0 ? false : revalidate,
      tags,
    },
  });

  return { data };
}
