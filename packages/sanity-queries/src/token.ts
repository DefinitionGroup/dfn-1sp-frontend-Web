import 'server-only'

export const viewerToken = process.env.SANITY_VIEWER_TOKEN

export function requireViewerToken(): string {
  if (!viewerToken) {
    throw new Error(
      'Missing SANITY_VIEWER_TOKEN. Visual Editing requires a server-only Sanity Viewer token.',
    )
  }

  return viewerToken
}
