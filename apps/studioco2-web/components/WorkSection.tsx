'use client'

import { useState } from 'react'
import CaseDock from './CaseDock'
import WorkGallery from './WorkGallery'
import { useSite } from './SiteProvider'
import { allCaseFilters } from '@studioco2/lib/content'
import type { WorkContent } from '@studioco2/lib/content'

/** Selected work and its sentence filter share one filter state. */
export default function WorkSection({ content }: { content: WorkContent }) {
  const { quiet, effects, overlay, open } = useSite()
  const [filters, setFilters] = useState(allCaseFilters)
  return <>
    <WorkGallery content={content} filters={filters} resetFilters={() => setFilters(allCaseFilters)} glitch={effects.hoverGlitch} quiet={quiet} open={project => open({ type: 'project', project, note: content.projectNote })} />
    {content.showFilters && <CaseDock projects={content.projects} anchor={content.anchor} filters={filters} onChange={setFilters} quiet={quiet} hidden={Boolean(overlay)} />}
  </>
}
