'use client'

import { Fragment, useState } from 'react'
import { motion, useMotionValue } from 'motion/react'
import { ArrowCounterClockwise, ArrowUpRight } from '@phosphor-icons/react'

import GlitchText from './GlitchText'
import SignalBurst from './SignalBurst'
import { useSite } from './SiteProvider'
import type { IntroContent } from '@studioco2/data/homepageFallback'

export default function Specimen({ content }: { content: IntroContent }) {
  const { quiet } = useSite()
  const weight = useMotionValue(350)
  const [active, setActive] = useState(0)
  return <section id="studio" className="studio section-pad" aria-labelledby="studio-title">
    <div className="specimen-tools">
      <span className="section-label">{content.label}</span>
      <label className="weight-control">{content.weightLabel}
        <input type="range" min="200" max="750" defaultValue="350" aria-label="Type weight" onInput={e => weight.set(Number(e.currentTarget.value))} id="type-weight" />
      </label>
      <button className="reset-button" aria-label="Reset type weight" onClick={() => { weight.set(350); const input = document.querySelector<HTMLInputElement>('#type-weight'); if (input) input.value = '350' }}><ArrowCounterClockwise /></button>
    </div>
    <motion.h2 id="studio-title" className="type-specimen" style={{ fontWeight: weight }}>
      <SignalBurst quiet={quiet} />
      <GlitchText quiet={quiet}>{content.headline.first}</GlitchText><br /><GlitchText quiet={quiet} delay={80}>{content.headline.beforeImage}</GlitchText> <span className="inline-image"><img src={content.image} alt="" loading="lazy" /></span> <GlitchText quiet={quiet} delay={150}>{content.headline.afterImage}</GlitchText>
    </motion.h2>
    <p className="studio-description">{content.description.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</p>
    <div className="capabilities" aria-label="Studio capabilities">
      {content.capabilities.map((service, index) => <motion.article key={service.title} className={`capability ${active === index ? 'is-active' : ''}`} layout={!quiet} transition={{ type: 'spring', bounce: 0, duration: .45 }}
        onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) setActive(index) }}>
        <motion.h3 layout={quiet ? false : 'position'}><button className="capability-trigger" aria-expanded={active === index} aria-controls={`capability-${index}`} onClick={() => setActive(index)}><span>{service.title}</span><ArrowUpRight /></button></motion.h3>
        {/* Cancel panel stretching; the image has its own proportional entrance. */}
        <motion.div layout={quiet ? false : 'position'} className="capability-content" id={`capability-${index}`} aria-hidden={active !== index} inert={active !== index}
          initial={false} animate={{ opacity: active === index ? 1 : 0 }} transition={{ duration: quiet ? 0 : .2 }}>
          <div className="capability-image">
            <motion.div className="capability-reveal" initial={false}
              animate={{ clipPath: active === index || quiet ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
              transition={{ type: 'spring', bounce: 0, duration: quiet ? 0 : .45 }}>
              <motion.img src={service.image} alt={service.alt} loading="lazy" width="800" height="500"
                initial={quiet ? false : { opacity: 0, transform: 'translateX(-32px) scale(1.08)' }}
                animate={{ opacity: active === index ? 1 : 0, transform: active === index || quiet ? 'translateX(0px) scale(1)' : 'translateX(-32px) scale(1.08)' }}
                transition={{ type: 'spring', bounce: 0, duration: quiet ? 0 : .45, opacity: { duration: quiet ? 0 : .3 } }} />
            </motion.div>
          </div>
          <p>{service.text}</p>
        </motion.div>
      </motion.article>)}
    </div>
  </section>
}
