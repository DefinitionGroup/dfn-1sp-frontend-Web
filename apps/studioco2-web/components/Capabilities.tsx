'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { useSite } from './SiteProvider'
import type { Capability } from '@studioco2/lib/content'

export default function Capabilities({ items }: { items: Capability[] }) {
  const { quiet } = useSite()
  const [active, setActive] = useState(0)
  return <div className="capabilities" aria-label="Studio capabilities">
    {items.map((service, index) => <motion.article key={service.key} className={`capability ${active === index ? 'is-active' : ''}`} layout={!quiet} transition={{ type: 'spring', bounce: 0, duration: .45 }}
      onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) setActive(index) }}>
      <motion.h3 layout={quiet ? false : 'position'}><button className="capability-trigger" aria-expanded={active === index} aria-controls={`capability-${service.key}`} onClick={() => setActive(index)}><span>{service.title}</span><ArrowUpRight /></button></motion.h3>
      {/* Cancel panel stretching; the image has its own proportional entrance. */}
      <motion.div layout={quiet ? false : 'position'} className="capability-content" id={`capability-${service.key}`} aria-hidden={active !== index} inert={active !== index}
        initial={false} animate={{ opacity: active === index ? 1 : 0 }} transition={{ duration: quiet ? 0 : .2 }}>
        {service.image && <div className="capability-image">
          <motion.div className="capability-reveal" initial={false}
            animate={{ clipPath: active === index || quiet ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
            transition={{ type: 'spring', bounce: 0, duration: quiet ? 0 : .45 }}>
            <motion.img src={service.image} alt={service.alt} loading="lazy" width="800" height="500"
              initial={quiet ? false : { opacity: 0, transform: 'translateX(-32px) scale(1.08)' }}
              animate={{ opacity: active === index ? 1 : 0, transform: active === index || quiet ? 'translateX(0px) scale(1)' : 'translateX(-32px) scale(1.08)' }}
              transition={{ type: 'spring', bounce: 0, duration: quiet ? 0 : .45, opacity: { duration: quiet ? 0 : .3 } }} />
          </motion.div>
        </div>}
        <p>{service.text}</p>
      </motion.div>
    </motion.article>)}
  </div>
}
