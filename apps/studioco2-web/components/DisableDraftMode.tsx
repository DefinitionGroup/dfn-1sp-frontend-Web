'use client'

import Link from 'next/link'
import { useVisualEditingEnvironment } from 'next-sanity/hooks'

/** Outside the Presentation tool, previews need a visible way back to published content. */
export default function DisableDraftMode() {
  const environment = useVisualEditingEnvironment()
  if (environment === 'presentation-iframe' || environment === 'presentation-window') return null
  // No prefetch: requesting the route is what ends draft mode.
  return <Link className="draft-exit" href="/api/draft-mode/disable" prefetch={false}>Exit draft preview</Link>
}
