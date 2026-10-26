'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, CaretDown, Check, X } from '@phosphor-icons/react'
import { allCaseFilters, filterProjects } from '@studioco2/data/homepageFallback'
import type { CaseFilters, Project } from '@studioco2/data/homepageFallback'
import { useIsClient } from '@studioco2/lib/client'

export default function CaseDock({ projects, filters, onChange, quiet, hidden }: {
  projects: Project[]; filters: CaseFilters; onChange: (filters: CaseFilters) => void; quiet: boolean; hidden: boolean
}) {
  const services = useMemo(() => [...new Set(projects.map(project => project.type))], [projects])
  const sectors = useMemo(() => [...new Set(projects.map(project => project.sector))], [projects])
  // The body portal exists only in the browser.
  const mounted = useIsClient()
  const [geometry, setGeometry] = useState({ travel: 0, heroHeight: 1, panelSpace: 400 })
  const [expanded, setExpanded] = useState<keyof CaseFilters | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const count = filterProjects(projects, filters).length
  const visible = !hidden && mounted
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, value => -geometry.travel * (1 - Math.min(1, Math.max(0, value / geometry.heroHeight))))
  const panelMaxHeight = useTransform(y, offset => Math.max(120, Math.min(560, geometry.panelSpace + offset)))

  useEffect(() => {
    const hero = document.getElementById('top')
    const dock = root.current
    if (!hero || !dock || !visible) return
    const measure = () => {
      const bottom = parseFloat(getComputedStyle(dock).bottom)
      const dockHeight = dock.offsetHeight
      setGeometry({
        travel: Math.max(0, window.innerHeight / 2 - bottom - dockHeight / 2),
        heroHeight: hero.offsetHeight,
        panelSpace: window.innerHeight - bottom - dockHeight - 24,
      })
    }
    // A manual popover puts the dock above the dither and all page stacking contexts.
    // Defer until after the dither's layout effect has entered the top layer.
    const frame = requestAnimationFrame(() => { dock.showPopover?.(); measure() })
    const observer = new ResizeObserver(measure)
    observer.observe(hero)
    observer.observe(dock)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      if (dock.matches(':popover-open')) dock.hidePopover()
    }
  }, [visible])

  useEffect(() => { if (!visible) setExpanded(null) }, [visible])
  useEffect(() => {
    if (!expanded) return
    panel.current?.querySelector<HTMLInputElement>(`input[name="case-${expanded}"]:checked`)?.focus({ preventScroll: true })
    const outside = (event: Event) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(null)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside) }
  }, [expanded])

  const close = () => { setExpanded(null); trigger.current?.focus({ preventScroll: true }) }
  const viewCases = () => {
    setExpanded(null)
    const work = document.getElementById('work')
    work?.scrollIntoView({ behavior: quiet ? 'instant' : 'smooth', block: 'start' })
    document.getElementById('work-title')?.focus({ preventScroll: true })
  }
  const transition = { duration: quiet ? 0 : .22, ease: [.22, 1, .36, 1] as const }
  if (!mounted) return null
  return createPortal(<AnimatePresence>{visible && <motion.div ref={root} className="case-dock" data-quiet={quiet} popover="manual" style={{ y: quiet ? 0 : y }}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}
    onKeyDown={event => { if (event.key === 'Escape' && expanded) { event.preventDefault(); close() } }}>
    <AnimatePresence>{expanded && <motion.div ref={panel} id="case-filter-panel" role="region" aria-label="Filter selected work" className="case-filter-panel"
      style={{ maxHeight: quiet ? geometry.panelSpace : panelMaxHeight }} initial={{ opacity: 0, y: quiet ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: quiet ? 0 : 6 }} transition={transition}>
      <div className="case-filter-heading"><span>Find your kind of work.</span><button type="button" onClick={close} aria-label="Close case filters"><X /></button></div>
      <div className="case-filter-columns">
        {(['service', 'sector'] as const).map(field => <fieldset key={field}>
          <legend>{field === 'service' ? 'Service' : 'Sector'}</legend>
          {['', ...(field === 'service' ? services : sectors)].map(value => <label key={value} className="case-filter-option">
            <input type="radio" name={`case-${field}`} value={value} checked={filters[field] === value} onChange={() => onChange({ ...filters, [field]: value })} />
            <span>{value || (field === 'service' ? 'Everything' : 'Everyone')}</span><Check aria-hidden="true" />
          </label>)}
        </fieldset>)}
      </div>
      <div className="case-filter-actions"><button type="button" onClick={() => onChange(allCaseFilters)} disabled={!filters.service && !filters.sector}>Reset</button><button type="button" className="case-filter-view" onClick={viewCases}>View {count} {count === 1 ? 'case' : 'cases'} <ArrowRight /></button></div>
    </motion.div>}</AnimatePresence>
    <div className="case-dock-sentence" role="group" aria-label="Filter cases">
      <span>We design</span>
      <button type="button" aria-label={`Filter by service: ${filters.service || 'Everything'}`} aria-controls="case-filter-panel" aria-expanded={Boolean(expanded)} onClick={event => { trigger.current = event.currentTarget; setExpanded(expanded === 'service' ? null : 'service') }}>{filters.service || 'Everything'}<CaretDown /></button>
      <span>for</span>
      <button type="button" aria-label={`Filter by sector: ${filters.sector || 'Everyone'}`} aria-controls="case-filter-panel" aria-expanded={Boolean(expanded)} onClick={event => { trigger.current = event.currentTarget; setExpanded(expanded === 'sector' ? null : 'sector') }}>{filters.sector || 'Everyone'}<CaretDown /></button>
      <span className="case-dock-count" role="status" aria-live="polite" aria-atomic="true"><span className="sr-only">Matching cases: </span>{String(count).padStart(2, '0')}</span>
    </div>
  </motion.div>}</AnimatePresence>, document.body)
}
