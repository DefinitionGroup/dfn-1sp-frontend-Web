import "server-only";

import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import { client } from "./client";
import { studioUrl } from "./env";
import { resolveSanityFetchClientConfig } from "./fetch-config";
import { viewerToken } from "./token";

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
  revalidate = 60,
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
    next: {
      revalidate,
      tags,
    },
  });

  return { data };
}
