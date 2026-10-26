'use client'

import { useId, useRef } from 'react'
import { useInView } from 'motion/react'

/** Small, finite interruptions in the live backdrop; never a full-screen loop. */
export default function SignalBurst({ quiet, active }: { quiet: boolean; active?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, amount: .35 })
  const id = useId().replace(/:/g, '')
  const filter = `signal-displace-${id}`
  return <span ref={ref} className="signal-burst" data-active={!quiet && (active ?? seen)} aria-hidden="true">
    <svg className="signal-defs" focusable="false"><defs>
      <filter id={filter} x="-20%" y="-40%" width="140%" height="180%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".002 .19" numOctaves="1" seed="4" result="slices" />
        <feDisplacementMap in="SourceGraphic" in2="slices" scale="32" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs></svg>
    <span className="signal-band signal-band-a" style={{ backdropFilter: `url(#${filter})`, WebkitBackdropFilter: `url(#${filter})` }} />
    <span className="signal-band signal-band-b" style={{ backdropFilter: `url(#${filter}) invert(1)`, WebkitBackdropFilter: `url(#${filter}) invert(1)` }} />
    <span className="signal-band signal-band-c" />
  </span>
}
