'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { motion, useMotionValue } from 'motion/react'
import { ArrowCounterClockwise } from '@phosphor-icons/react'

import GlitchText from './GlitchText'
import SignalBurst from './SignalBurst'
import { useSite } from './SiteProvider'
import { splitLastWord } from '@studioco2/lib/content'
import type { SpecimenContent } from '@studioco2/lib/content'

/** The studio statement. Capabilities that follow it in the CMS render inside its section. */
export default function Specimen({ content, children }: { content: SpecimenContent; children?: ReactNode }) {
  const { quiet } = useSite()
  const weight = useMotionValue(350)
  const { head, before, final } = splitLastWord(content.headline)
  // Each headline segment starts 75ms after the previous one.
  const finalDelay = (head.length + (before ? 1 : 0)) * 75
  return <section id={content.anchor} className="studio section-pad" aria-labelledby="studio-title">
    <div className="specimen-tools">
      <span className="section-label">{content.label}</span>
      <label className="weight-control">Make it bolder
        <input type="range" min="200" max="750" defaultValue="350" aria-label="Type weight" onInput={e => weight.set(Number(e.currentTarget.value))} id="type-weight" />
      </label>
      <button className="reset-button" aria-label="Reset type weight" onClick={() => { weight.set(350); const input = document.querySelector<HTMLInputElement>('#type-weight'); if (input) input.value = '350' }}><ArrowCounterClockwise /></button>
    </div>
    <motion.h2 id="studio-title" className="type-specimen" style={{ fontWeight: weight }}>
      <SignalBurst quiet={quiet} />
      {head.map((line, index) => <Fragment key={line}><GlitchText quiet={quiet} delay={index * 75}>{line}</GlitchText><br /></Fragment>)}
      {before && <><GlitchText quiet={quiet} delay={head.length * 75}>{before}</GlitchText>{' '}</>}
      {content.image && <><span className="inline-image"><img src={content.image} alt="" loading="lazy" /></span>{' '}</>}
      <GlitchText quiet={quiet} delay={finalDelay}>{final}</GlitchText>
    </motion.h2>
    {content.description.length > 0 && <p className="studio-description">{content.description.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</p>}
    {children}
  </section>
}
