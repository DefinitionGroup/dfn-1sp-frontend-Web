import "server-only";

import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import { resolveRevalidateSeconds, toRequestTag } from "./cache-policy";
import { client } from "./client";
import { studioUrl } from "./env";
import { resolveSanityFetchClientConfig } from "./fetch-config";
import { viewerToken } from "./token";

const DEFAULT_REVALIDATE = resolveRevalidateSeconds();

type SanityFetchOptions = {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
  perspective?: "published" | "drafts" | "raw";
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
  revalidate = DEFAULT_REVALIDATE,
  perspective,
  stega,
}: SanityFetchOptions): Promise<{ data: TData }> {
  const draftEnabled = await isDraftModeEnabled();

  const configuredClient = client.withConfig(
    resolveSanityFetchClientConfig({
      draftEnabled,
      perspective,
      stega,
      studioUrl,
      viewerToken,
    }),
  );

  const data = await configuredClient.fetch<TData>(query, params, {
    tag: toRequestTag(tags[0]) ?? "query",
    next: {
      revalidate,
      tags,
    },
  });

  return { data };
}
