'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useDocumentHidden } from '@studioco2/lib/client'
import type { Effects } from '@studioco2/lib/effects'

const fragments = [
  [7, 16, .2], [52, 28, .83], [23, 47, .48], [68, 66, .14],
  [12, 79, .65], [44, 11, .38], [35, 59, .92], [76, 40, .56], [4, 35, .74],
]
const clips = {
  bars: 'polygon(0 30%,100% 30%,100% 70%,0 70%)',
  blocks: 'inset(8%)',
  crosses: 'polygon(35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%)',
  steps: 'polygon(0 0,45% 0,45% 25%,72% 25%,72% 50%,100% 50%,100% 100%,0 100%)',
  diamonds: 'polygon(40% 0,60% 0,60% 20%,80% 20%,80% 40%,100% 40%,100% 60%,80% 60%,80% 80%,60% 80%,60% 100%,40% 100%,40% 80%,20% 80%,20% 60%,0 60%,0 40%,20% 40%,20% 20%,40% 20%)',
  rings: 'polygon(evenodd, 0 0,100% 0,100% 100%,0 100%,0 0,22% 22%,22% 78%,78% 78%,78% 22%,22% 22%)',
}
const shapeNames = Object.keys(clips) as (keyof typeof clips)[]

export default function PixelDrift({ effects, quiet }: { effects: Effects; quiet: boolean }) {
  const id = useId().replace(/:/g, '')
  const ref = useRef<HTMLDivElement>(null)
  const hidden = useDocumentHidden()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const size = effects.driftSize / 100
  const speed = effects.driftSpeed / 100
  const chaos = effects.driftChaos / 100
  const cycle = 12 - speed * 10
  const filterId = `pixel-drift-${id}`
  return <div ref={ref} className="neon-drift" data-quiet={quiet || hidden || !visible} data-size={effects.driftSize} data-speed={effects.driftSpeed} data-chaos={effects.driftChaos} data-shape={effects.driftShape} aria-hidden="true">
    <svg className="signal-defs" focusable="false"><defs>
      <filter id={filterId} x="-30%" y="-80%" width="160%" height="260%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".006 .14" numOctaves="1" seed="12" result="tear" />
        <feDisplacementMap in="SourceGraphic" in2="tear" scale={chaos * 110} xChannelSelector="R" yChannelSelector="G" result="warped" />
        <feColorMatrix in="warped" type="saturate" values="3" />
      </filter>
    </defs></svg>
    {fragments.slice(0, Math.ceil(3 + chaos * 6)).map(([x, y, seed], index) => {
      const shape = effects.driftShape === 'mixed' ? shapeNames[index % shapeNames.length] : effects.driftShape
      const dimension = 24 + size * (90 + seed * 80)
      return <span key={index} className="neon-drift-patch" data-shape={shape} style={{
        left: `${x}%`, top: `${y}%`, width: shape === 'bars' ? dimension * 2 : dimension, height: dimension,
        animationDuration: `${cycle + seed}s`, animationDelay: `${-(cycle + seed) * seed}s`,
        animationPlayState: speed === 0 ? 'paused' : undefined,
        '--drift-travel': '65px', '--drift-opacity': .65,
        '--drift-tint': index % 3 === 1 ? '111 255 225' : index % 3 === 2 ? '242 255 81' : '192 249 106',
      } as CSSProperties}>
        <i className="neon-drift-shape" style={{
          clipPath: clips[shape], backdropFilter: `url(#${filterId})`, WebkitBackdropFilter: `url(#${filterId})`,
          animationName: chaos === 0 ? 'none' : 'neon-drift-flicker',
          animationDuration: `${4.8 - chaos * 3.8 + seed * .4}s`, animationDelay: `${-seed * 3}s`,
        }} />
      </span>
    })}
  </div>
}
