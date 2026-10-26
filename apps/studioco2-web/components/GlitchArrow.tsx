'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

const bitmap = ['01111111', '01111111', '00001111', '00011111', '00111011', '01110011', '11100011', '11000000']
const pixels = bitmap.flatMap((row, y) => [...row].flatMap((cell, x) => cell === '1' ? [{ x: x * 10, y: y * 10 }] : []))
const colors = ['#ff3cbd', '#b65cff', '#fa68e5', '#58f5ed']
const glyphs = ['+', '/', '#', '_', '×']
const noise = (index: number, tick: number) => {
  let value = Math.imul(index + 1, 374761393) ^ Math.imul(tick + 1, 668265263)
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return (value ^ (value >>> 16)) >>> 0
}

/** A finite pixel assembly on every entry and every deliberate replay. */
export default function GlitchArrow({ quiet, decorative = false, active = true, replayKey = 0, duration = 960 }: { quiet: boolean; decorative?: boolean; active?: boolean; replayKey?: number; duration?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  // The contact crop exposes less than half of the oversized SVG canvas.
  const inView = useInView(ref, { amount: decorative ? .15 : .6 })
  const hoverRequested = useRef(false)
  const [replay, setReplay] = useState(0)
  const [frame, setFrame] = useState({ tick: 24, deconstruct: false })
  useEffect(() => {
    if (!inView || quiet || !active) return
    const deconstruct = decorative || hoverRequested.current
    hoverRequested.current = false
    let raf = 0
    let previous = -1
    const start = performance.now()
    const draw = (now: number) => {
      const tick = Math.min(24, Math.floor((now - start) / (duration / 24)))
      if (tick !== previous) { previous = tick; setFrame({ tick, deconstruct }) }
      if (tick < 24) raf = requestAnimationFrame(draw)
    }
    const stop = () => { if (document.hidden) { cancelAnimationFrame(raf); setFrame({ tick: 24, deconstruct }) } }
    raf = requestAnimationFrame(draw)
    document.addEventListener('visibilitychange', stop)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', stop) }
  }, [inView, quiet, replay, active, decorative, replayKey, duration])
  const running = active && inView && !quiet && frame.tick < 24
  const play = () => {
    if (quiet || running) return
    hoverRequested.current = true
    setReplay(value => value + 1)
  }
  const artwork = <svg ref={ref} viewBox="-20 -20 120 120" aria-hidden="true" focusable="false">
      {pixels.map((pixel, index) => {
        const random = noise(index, frame.tick)
        const rank = 9 + noise(index, 0) % 14
        const scattered = running && (frame.deconstruct && frame.tick < 7 ? frame.tick > index % 5 : frame.tick < rank)
        const dx = scattered ? ((random % 9) - 4) * 7 : 0
        const dy = scattered ? (((random >>> 4) % 7) - 3) * 6 : 0
        const glyph = scattered && random % 3 === 0
        return <g key={index} transform={`translate(${dx} ${dy})`} opacity={scattered && random % 5 === 0 ? .1 : 1} fill={colors[scattered ? random % colors.length : Math.floor((pixel.x + pixel.y) / 20) % colors.length]} data-scattered={scattered}>
          {glyph ? <text x={pixel.x} y={pixel.y + 9} className="arrow-noise-glyph">{glyphs[random % glyphs.length]}</text> : <rect x={pixel.x} y={pixel.y} width="10" height="10" />}
        </g>
      })}
    </svg>
  const phase = running ? frame.deconstruct && frame.tick < 7 ? 'deconstructing' : 'constructing' : 'settled'
  if (decorative) return <span className="pixel-arrow glitch-arrow" aria-hidden="true" data-phase={phase}>{artwork}</span>
  return <button type="button" className="pixel-arrow glitch-arrow" aria-label="Replay neon arrow animation" aria-disabled={quiet} data-phase={phase}
    onClick={play} onPointerEnter={event => {
      if (event.pointerType === 'mouse' && matchMedia('(hover: hover) and (pointer: fine)').matches) play()
    }}>{artwork}</button>
}
