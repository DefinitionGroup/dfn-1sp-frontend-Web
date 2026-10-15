import { createClient } from 'next-sanity'

import { resolveRequestTagPrefix } from './cache-policy'
import { apiVersion, dataset, projectId, studioUrl } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Disable CDN for write operations
  requestTagPrefix: resolveRequestTagPrefix(),
  stega: { studioUrl },
})
