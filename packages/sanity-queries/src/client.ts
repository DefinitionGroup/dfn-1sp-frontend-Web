import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, studioUrl } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Disable CDN for write operations
  stega: { studioUrl },
})
