'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_+<>[]'

// Seeded ranks give each letter its own settling time, like the existing
// Definition Studio FlickerStagger/Descramble, without changing text geometry.
function noise(index: number, tick: number, seed: number) {
  let value = Math.imul(index + 1, 374761393) ^ Math.imul(tick + 1, 668265263) ^ seed
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return (value ^ (value >>> 16)) >>> 0
}

export default function GlitchText({ children, quiet, play = true, delay = 0, className = '', replayKey = 0, duration = 820 }: {
  children: string; quiet: boolean; play?: boolean; delay?: number; className?: string; replayKey?: number; duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: .45 })
  const [tick, setTick] = useState(-1)
  useEffect(() => {
    if (!inView || !play || quiet) return
    let frame = 0
    let previous = -1
    const start = performance.now() + delay
    const draw = (now: number) => {
      const elapsed = now - start
      if (elapsed < 0) { frame = requestAnimationFrame(draw); return }
      const next = Math.min(20, Math.floor(elapsed / (duration / 20)))
      if (next !== previous) { previous = next; setTick(next) }
      if (next < 20) frame = requestAnimationFrame(draw)
    }
    const stop = () => { if (document.hidden) { cancelAnimationFrame(frame); setTick(20) } }
    setTick(-1)
    frame = requestAnimationFrame(draw)
    document.addEventListener('visibilitychange', stop)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', stop) }
  }, [children, inView, play, quiet, delay, replayKey, duration])

  const running = !quiet && play && inView && tick >= 0 && tick < 20
  const seed = Array.from(children).reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619), 2166136261)
  let index = 0
  return <span ref={ref} className={`glitch-text ${className}`} aria-label={children} data-scramble={running ? 'running' : 'settled'}>
    <span aria-hidden="true">{children.split(/(\s+)/).map((word, wordIndex) => /^\s+$/.test(word) ? word : <span className="glitch-word" key={wordIndex}>
      {Array.from(word).map(character => {
        const position = index++
        const rank = noise(position, 0, seed) % 12 + 7
        const changing = running && tick < rank
        const random = noise(position, tick, seed)
        return <span className="glitch-glyph" key={position} data-noise={changing} data-drop={changing && random % 7 === 0}>
          <span className="glyph-measure">{character}</span>
          <span className="glyph-output">{changing ? glyphs[random % glyphs.length] : character}</span>
        </span>
      })}
    </span>)}</span>
  </span>
}
