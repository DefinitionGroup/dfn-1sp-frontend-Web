type SanityFetchPerspective = "published" | "drafts" | "raw";

type SanityFetchClientConfigOptions = {
  draftEnabled: boolean;
  perspective?: SanityFetchPerspective;
  stega?: boolean;
  studioUrl: string;
  viewerToken?: string;
};

export function resolveSanityFetchClientConfig({
  draftEnabled,
  perspective,
  stega,
  studioUrl,
  viewerToken,
}: SanityFetchClientConfigOptions) {
  const resolvedPerspective =
    perspective ?? (draftEnabled ? "drafts" : "published");
  const resolvedStega = stega ?? draftEnabled;

  return {
    perspective: resolvedPerspective,
    stega: resolvedStega ? { enabled: true, studioUrl } : false,
    // Keep the CDN off for server reads. Next's Data Cache handles tag-based
    // invalidation and the TTL without an additional stale cache underneath.
    useCdn: false,
    token: draftEnabled ? viewerToken : undefined,
  } as const;
}
