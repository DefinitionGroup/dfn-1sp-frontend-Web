'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { filterProjects, splitLastWord } from '@studioco2/lib/content'
import type { CaseFilters, Project, WorkContent } from '@studioco2/lib/content'
import GlitchText from './GlitchText'
import SignalBurst from './SignalBurst'
import GlitchArrow from './GlitchArrow'

const slide = { type: 'spring' as const, duration: .5, bounce: 0 }

function SlideCard({ project, index, total, quiet, glitch, open }: { project: Project; index: number; total: number; quiet: boolean; glitch: boolean; open: (project: Project) => void }) {
  const ref = useRef<HTMLElement>(null)
  const marker = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const show = revealed || hovered
  const seen = useInView(ref, { once: true, amount: .35 })
  const [anticipating, setAnticipating] = useState(false)
  useEffect(() => {
    if (!seen || quiet || !glitch) return
    const begin = window.setTimeout(() => setAnticipating(true), 160)
    const end = window.setTimeout(() => setAnticipating(false), 1120)
    return () => { clearTimeout(begin); clearTimeout(end); setAnticipating(false) }
  }, [seen, quiet, glitch])
  const [interrupted, setInterrupted] = useState(false)
  const hint = glitch && anticipating && !interrupted && !show && !quiet

  const { scrollYProgress } = useScroll({ target: marker, offset: ['start 25%', 'start -35%'] })
  const transform = useTransform(scrollYProgress, [0, 1], ['scale(1)', `scale(${1 - (total - index) * .025})`])
  const toggle = () => { setInterrupted(true); setAnticipating(false); setHovered(false); setRevealed(!show) }
  return <>
    <div ref={marker} className="stack-marker" aria-hidden="true" />
    <div className="stack-slot" style={{ '--stack-offset': `${index * 20 + index * index * 4}px`, '--stack-offset-mobile': `${index * 12 + index * index * 2}px`, zIndex: index + 1 } as CSSProperties}>
    <motion.article ref={ref} className="slide-card" style={quiet ? undefined : { transform }} data-revealed={show} data-glitch={glitch && (hovered || hint) && !quiet} data-anticipating={hint}
    onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) { setInterrupted(true); setAnticipating(false); setHovered(true) } }}
    onPointerLeave={() => setHovered(false)}
    onKeyDown={event => { if (event.key === 'Escape') { setRevealed(false); setHovered(false) } }}>
    <div className="slide-stage">
      <div className="slide-detail" id={`project-detail-${index}`} inert={!show} aria-hidden={!show}>
        <span className="slide-category">{project.type}</span>
        <h3><GlitchText quiet={quiet || !glitch} play={show}>{project.title}</GlitchText></h3>
        <p>{project.description}</p>
        {project.href
          ? <Link className="project-open" href={project.href}>Open project <ArrowUpRight /></Link>
          : <button className="project-open" onClick={() => open(project)}>Open project <ArrowUpRight /></button>}
      </div>
      <motion.button className="slide-image" aria-label={`${show ? 'Cover' : 'Reveal'} details for ${project.title}`} aria-expanded={show} aria-controls={`project-detail-${index}`}
        onClick={toggle} tabIndex={quiet && show ? -1 : 0}
        style={{ pointerEvents: quiet && show ? 'none' : 'auto' }}
        animate={quiet ? { transform: 'translateX(0%)', opacity: show ? 0 : 1 } : { transform: `translateX(${show ? 73 : hint ? 7 : 0}%)`, opacity: 1 }}
        transition={quiet ? { duration: .12 } : slide}>
        {project.image && <img src={project.image} alt={project.alt} width="800" height="500" loading="lazy" />}
        {glitch && project.image && <span className="hover-glitch" aria-hidden="true">
          <img className="glitch-slice glitch-slice-a" src={project.image} alt="" width="800" height="500" loading="lazy" />
          <img className="glitch-slice glitch-slice-b" src={project.image} alt="" width="800" height="500" loading="lazy" />
        </span>}
        {glitch && <SignalBurst quiet={quiet || !glitch} active={hovered || hint} />}
        <span className="pixel-seam" aria-hidden="true" />
      </motion.button>
    </div>
    <div className="slide-caption">
      {project.href
        ? <Link href={project.href} className="slide-title"><GlitchText quiet={quiet || !glitch}>{project.title}</GlitchText><ArrowUpRight /></Link>
        : <button onClick={() => open(project)} className="slide-title"><GlitchText quiet={quiet || !glitch}>{project.title}</GlitchText><ArrowUpRight /></button>}
      <button className="reveal-control" onClick={toggle} aria-expanded={show} aria-controls={`project-detail-${index}`} aria-label={`${show ? 'Cover' : 'Reveal'} ${project.title}`}>{show ? 'Cover' : 'Reveal'} {show ? <ArrowLeft /> : <ArrowRight />}</button>
    </div>
  </motion.article>
    </div>
  </>
}

export default function WorkGallery({ content, quiet, glitch, filters, resetFilters, open }: { content: WorkContent; quiet: boolean; glitch: boolean; filters: CaseFilters; resetFilters: () => void; open: (project: Project) => void }) {
  const projects = filterProjects(content.projects, filters)
  const { head, before, final } = splitLastWord(content.headline)
  const titleQuiet = quiet || !glitch
  return <section id={content.anchor} className="work section-pad" aria-labelledby="work-title">
    <div className="work-top"><span>{content.label}{(filters.service || filters.sector) && ` — ${projects.length} ${projects.length === 1 ? 'case' : 'cases'}`}</span><span>{content.hint}</span></div>
    <div className="digital-work-layout">
      <div className="digital-work-heading">
        <h2 id="work-title" tabIndex={-1}>
          {head.map((line, index) => <Fragment key={line}><GlitchText quiet={titleQuiet} delay={index * 60}>{line}</GlitchText><br /></Fragment>)}
          {before && <><GlitchText quiet={titleQuiet} delay={head.length * 60}>{before}</GlitchText>{' '}</>}
          <span className="work-title-muted"><GlitchText quiet={titleQuiet} delay={(head.length + (before ? 1 : 0)) * 60}>{final}</GlitchText></span>
          <SignalBurst quiet={titleQuiet} />
        </h2>
        {content.text.length > 0 && <p>{content.text.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</p>}
        <GlitchArrow quiet={quiet || !glitch} />
      </div>
      <div className="slide-gallery" data-stack-quiet={quiet}>{projects.map((project, index) => <SlideCard key={`${project.id}:${filters.service}:${filters.sector}`} project={project} index={index} total={projects.length} quiet={quiet} glitch={glitch} open={open} />)}{projects.length === 0 && <div className="work-empty"><h3>No cases in this combination.</h3><p>Try another service or sector to explore the archive.</p><button onClick={resetFilters}>Show all cases <ArrowRight /></button></div>}</div>
    </div>
  </section>
}
